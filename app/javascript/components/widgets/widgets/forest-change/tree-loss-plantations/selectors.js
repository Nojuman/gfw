import { createSelector } from 'reselect';
import sumBy from 'lodash/sumBy';
import groupBy from 'lodash/groupBy';
import { format } from 'd3-format';
import { getColorPalette } from 'utils/data';

// get list data
const getLoss = state => (state.data && state.data.loss) || null;
const getTotalLoss = state => (state.data && state.data.totalLoss) || null;
const getSettings = state => state.settings || null;
const getCurrentLocation = state => state.currentLabel || null;
const getColors = state => state.colors || null;
const getSentences = state => state.config && state.config.sentences;

// get lists selected
export const parseData = createSelector(
  [getLoss, getTotalLoss, getSettings],
  (loss, totalLoss, settings) => {
    if (!loss || !totalLoss) return null;
    const { startYear, endYear } = settings;
    const totalLossByYear = groupBy(totalLoss, 'year');

    return loss
      .filter(d => d.year >= startYear && d.year <= endYear)
      .map(d => ({
        ...d,
        outsideAreaLoss: totalLossByYear[d.year][0].area - d.area,
        areaLoss: d.area || 0,
        outsideCo2Loss: totalLossByYear[d.year][0].emissions - d.emissions,
        co2Loss: d.emissions || 0
      }));
  }
);

export const parseConfig = createSelector([getColors], colors => {
  const colorRange = getColorPalette(colors.ramp, 2);
  return {
    xKey: 'year',
    yKeys: {
      bars: {
        areaLoss: {
          fill: colorRange[0],
          stackId: 1
        },
        outsideAreaLoss: {
          fill: colorRange[1],
          stackId: 1
        }
      }
    },
    unit: 'ha',
    tooltip: [
      {
        key: 'outsideAreaLoss',
        label: 'Natural forest',
        color: colorRange[1],
        unit: 'ha',
        unitFormat: value => format('.3s')(value)
      },
      {
        key: 'areaLoss',
        label: 'Plantations',
        color: colorRange[0],
        unit: 'ha',
        unitFormat: value => format('.3s')(value)
      }
    ]
  };
});

export const getSentence = createSelector(
  [parseData, getSettings, getCurrentLocation, getSentences],
  (data, settings, currentLabel, sentences) => {
    if (!data) return null;
    const { initial } = sentences;
    const { startYear, endYear } = settings;
    const totalLoss = sumBy(data, 'areaLoss') || 0;
    const totalOutsideLoss = sumBy(data, 'outsideAreaLoss') || 0;
    const lossPhrase =
      totalLoss > totalOutsideLoss ? 'plantations' : 'natural forest';

    const sentence = initial;
    const params = {
      location: currentLabel,
      startYear,
      endYear,
      lossPhrase,
      value: `${format('.3s')(totalOutsideLoss)}t of CO<sub>2</sub> emissions`
    };

    return {
      sentence,
      params
    };
  }
);
