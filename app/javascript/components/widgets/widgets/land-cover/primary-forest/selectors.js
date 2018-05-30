import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import { getColorPalette } from 'utils/data';
import { format } from 'd3-format';

// get list data
const getData = state => state.data;
const getSettings = state => state.settings;
const getCurrentLocation = state => state.currentLabel;
const getIndicator = state => state.indicator || null;
const getColors = state => state.colors;
const getSentences = state => state.config && state.config.sentences;

// get lists selected
export const parseData = createSelector(
  [getData, getSettings, getColors],
  (data, settings, colors) => {
    if (isEmpty(data)) return null;
    const { totalArea, totalExtent, extent } = data;
    const colorRange = getColorPalette(colors.ramp, 2);
    const secondaryExtent = totalExtent - extent < 0 ? 0 : totalExtent - extent;
    const parsedData = [
      {
        label: 'Primary Forest',
        value: extent,
        color: colorRange[0],
        percentage: extent / totalArea * 100
      },
      {
        label: 'Other Tree Cover',
        value: secondaryExtent,
        color: colorRange[1],
        percentage: secondaryExtent / totalArea * 100
      },
      {
        label: 'Non-Forest',
        value: totalArea - totalExtent,
        color: colors.nonForest,
        percentage: (totalArea - totalExtent) / totalArea * 100
      }
    ];
    return parsedData;
  }
);

export const getSentence = createSelector(
  [parseData, getSettings, getCurrentLocation, getIndicator, getSentences],
  (parsedData, settings, currentLabel, indicator, sentences) => {
    if (!parsedData || !currentLabel) return null;
    const { initial, withIndicator } = sentences;
    const primaryPercentage = parsedData.find(d => d.label === 'Primary Forest')
      .percentage;

    let indicatorLabel = indicator && indicator.label;
    switch (indicator && indicator.value) {
      case 'primary_forest__mining':
        indicatorLabel = 'mining concessions';
        break;
      case 'primary_forest__landmark':
        indicatorLabel = 'indigenous lands';
        break;
      case 'primary_forest__wdpa':
        indicatorLabel = 'protected areas';
        break;
      default:
        indicatorLabel = 'primary forests';
    }

    const params = {
      location: `${currentLabel}'s`,
      indicator: indicatorLabel,
      percentage:
        primaryPercentage < 0.1
          ? '<0.1%'
          : `${format('.2r')(primaryPercentage)}%`,
      extentYear: settings.extentYear
    };

    const sentence =
      indicator && indicator.value === 'primary_forest'
        ? initial
        : withIndicator;

    return {
      sentence,
      params
    };
  }
);
