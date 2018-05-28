import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import { format } from 'd3-format';

// get list data
const getData = state => state.data || null;
const getCurrentLocation = state => state.currentLabel || null;
const getColors = state => state.colors || null;
const getSentences = state => state.config && state.config.sentences;

// get lists selected
export const parseData = createSelector(
  [getData, getCurrentLocation, getColors],
  (data, currentLabel, colors) => {
    if (isEmpty(data)) return null;
    const {
      area_ha,
      extent,
      planted_forest,
      forest_primary,
      forest_regenerated
    } = data;
    const colorRange = colors.ramp;
    const otherCover =
      extent - (forest_regenerated + forest_primary + planted_forest);
    const nonForest = area_ha - extent;
    return [
      {
        label: 'Naturally Regenerated Forest',
        value: forest_regenerated,
        percentage: forest_regenerated / area_ha * 100,
        color: colorRange[1]
      },
      {
        label: 'Primary Forest',
        value: forest_primary || 0,
        percentage: forest_primary / area_ha * 100 || 0,
        color: colorRange[2]
      },
      {
        label: 'Planted Forest',
        value: planted_forest || 0,
        percentage: planted_forest / area_ha * 100 || 0,
        color: colorRange[4]
      },
      {
        label: 'Other Tree Cover',
        value: otherCover,
        percentage: otherCover / area_ha * 100,
        color: colorRange[6]
      },
      {
        label: 'Non-Forest',
        value: nonForest,
        percentage: nonForest / area_ha * 100,
        color: colors.nonForest
      }
    ];
  }
);

export const getSentence = createSelector(
  [getData, getCurrentLocation, getSentences],
  (data, currentLabel, sentences) => {
    if (isEmpty(data)) return null;
    const { initial, noPrimary, globalInitial, globalNoPrimary } = sentences;
    const { area_ha, extent, forest_primary } = data;
    const primaryPercent =
      forest_primary > 0
        ? forest_primary / area_ha * 100
        : extent / area_ha * 100;

    const params = {
      location: currentLabel || 'globally',
      extent: `${format('.3s')(extent)}ha`,
      primaryPercent:
        primaryPercent >= 0.1 ? `${format('.2r')(primaryPercent)}%` : '<0.1%'
    };
    let sentence = forest_primary > 0 ? initial : noPrimary;
    if (!currentLabel) {
      sentence = forest_primary > 0 ? globalInitial : globalNoPrimary;
    }
    return {
      sentence,
      params
    };
  }
);
