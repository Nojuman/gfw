import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import { format } from 'd3-format';

// get list data
const getData = state => state.data;
const getSettings = state => state.settings;
const getCurrentLocation = state => state.currentLabel;
const getIndicator = state => state.indicator || null;
const getWhitelist = state => state.countryWhitelist;
const getColors = state => state.colors;
const getSentences = state => state.config && state.config.sentences;

// get lists selected
export const parseData = createSelector(
  [getData, getSettings, getWhitelist, getColors, getCurrentLocation],
  (data, settings, whitelist, colors, currentLabel) => {
    if (isEmpty(data)) return null;
    const { totalArea, cover, plantations } = data;
    const { indicator } = settings;
    const hasPlantations =
      (currentLabel !== 'global' && isEmpty(whitelist)) ||
      whitelist.indexOf('plantations') > -1;
    const plantationsCover = hasPlantations ? plantations : 0;
    const parsedData = [
      {
        label: hasPlantations && !indicator ? 'Natural Forest' : 'Tree cover',
        value: cover - plantationsCover,
        color: colors.naturalForest,
        percentage: (cover - plantationsCover) / totalArea * 100
      },
      {
        label: 'Non-Forest',
        value: totalArea - cover,
        color: colors.nonForest,
        percentage: (totalArea - cover) / totalArea * 100
      }
    ];
    if (!indicator && hasPlantations) {
      parsedData.splice(1, 0, {
        label: 'Plantations',
        value: plantations,
        color: colors.plantedForest,
        percentage: plantations / totalArea * 100
      });
    }
    return parsedData;
  }
);

export const getSentence = createSelector(
  [getData, getSettings, getCurrentLocation, getIndicator, getSentences],
  (data, settings, currentLabel, indicator, sentences) => {
    if (!data || !sentences) return null;
    const {
      initial,
      withIndicator,
      globalInitial,
      globalWithIndicator
    } = sentences;
    const percentCover = 100 * data.cover / data.totalArea;
    const params = {
      year: settings.extentYear,
      location: currentLabel || 'global',
      indicator: indicator && indicator.label.toLowerCase(),
      percentage:
        percentCover >= 0.1 ? `${format('.2r')(percentCover)}%` : '<0.1%',
      value:
        data.cover < 1
          ? `${format('.3r')(data.cover)}ha`
          : `${format('.3s')(data.cover)}ha`
    };
    let sentence = indicator ? withIndicator : initial;
    if (currentLabel === 'global') {
      sentence = indicator ? globalWithIndicator : globalInitial;
    }
    return { sentence, params };
  }
);
