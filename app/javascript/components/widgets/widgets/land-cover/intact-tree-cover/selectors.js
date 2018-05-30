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
    const parsedData = [
      {
        label: 'Intact Forest',
        value: extent,
        color: colorRange[0],
        percentage: extent / totalArea * 100
      },
      {
        label: 'Other Tree Cover',
        value: totalExtent - extent,
        color: colorRange[1],
        percentage: (totalExtent - extent) / totalArea * 100
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
    if (!parsedData) return null;
    const { initial, withIndicator } = sentences;
    const totalExtent = parsedData
      .filter(d => d.label !== 'Non-Forest')
      .map(d => d.value)
      .reduce((sum, d) => sum + d);
    const intactData = parsedData.find(d => d.label === 'Intact Forest').value;
    const intactPercentage = intactData && intactData / totalExtent * 100;
    let indicatorLabel = indicator && indicator.label;
    switch (indicator && indicator.value) {
      case 'ifl_2013__mining':
        indicatorLabel = 'mining concessions';
        break;
      case 'ifl_2013__wdpa':
        indicatorLabel = 'protected areas';
        break;
      case 'ifl_2013__landmark':
        indicatorLabel = 'indigenous lands';
        break;
      default:
        indicatorLabel = 'intact forest';
    }
    const params = {
      location: currentLabel !== 'global' ? `${currentLabel}'s` : currentLabel,
      indicator: indicatorLabel,
      percentage:
        intactPercentage < 0.1 ? '<0.1%' : `${format('.2r')(intactPercentage)}%`
    };

    const sentence =
      indicator && indicator.value === 'ifl_2013' ? initial : withIndicator;

    return {
      sentence,
      params
    };
  }
);
