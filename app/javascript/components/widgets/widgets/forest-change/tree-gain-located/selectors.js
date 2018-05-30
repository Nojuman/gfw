import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import sumBy from 'lodash/sumBy';
import { sortByKey } from 'utils/data';
import { format } from 'd3-format';

// get list data
const getGain = state => (state.data && state.data.gain) || null;
const getExtent = state => (state.data && state.data.extent) || null;
const getSettings = state => state.settings || null;
const getOptions = state => state.options || null;
const getIndicator = state => state.indicator || null;
const getLocation = state => state.payload || null;
const getLocationsMeta = state =>
  (state.payload.region ? state.subRegions : state.regions) || null;
const getCurrentLocation = state => state.currentLabel || null;
const getColors = state => state.colors || null;
const getSentences = state => state.config.sentences || null;

export const getSortedData = createSelector(
  [getGain, getExtent, getSettings, getLocation, getLocationsMeta, getColors],
  (data, extent, settings, location, meta, colors) => {
    if (isEmpty(data) || isEmpty(meta)) return null;
    const dataMapped = [];
    data.forEach(d => {
      const region = meta.find(l => d.id === l.value);
      if (region) {
        const locationExtent = extent.filter(l => l.id === d.id);
        const percentage = d.gain / locationExtent[0].extent * 100;
        dataMapped.push({
          label: (region && region.label) || '',
          gain: d.gain,
          percentage,
          value: settings.unit === 'ha' ? d.gain : percentage,
          path: `/dashboards/country/${location.country}/${
            location.region ? `${location.region}/` : ''
          }${d.id}`,
          color: colors.main
        });
      }
    });
    return sortByKey(dataMapped, 'gain');
  }
);

export const parseData = createSelector([getSortedData], data => {
  if (!data || !data.length) return null;
  return sortByKey(uniqBy(data, 'label'), 'value', true);
});

export const getSentence = createSelector(
  [
    getSortedData,
    parseData,
    getSettings,
    getOptions,
    getLocation,
    getIndicator,
    getCurrentLocation,
    getSentences
  ],
  (
    data,
    sortedData,
    settings,
    options,
    location,
    indicator,
    currentLabel,
    sentences
  ) => {
    if (!data || !options || !currentLabel) return null;
    const {
      initial,
      withIndicator,
      initialPercent,
      withIndicatorPercent
    } = sentences;
    const totalGain = sumBy(data, 'gain');
    const topRegion = sortedData.length && sortedData[0];
    const avgGainPercentage = sumBy(data, 'percentage') / data.length;
    const avgGain = sumBy(data, 'gain') / data.length;
    let percentileGain = 0;
    let percentileLength = 0;

    while (
      percentileLength < data.length &&
      percentileGain / totalGain < 0.5 &&
      data.length !== 10
    ) {
      percentileGain += data[percentileLength].gain;
      percentileLength += 1;
    }
    const topGain = percentileGain / totalGain * 100;
    let sentence = !indicator ? initialPercent : withIndicatorPercent;
    if (settings.unit !== '%') {
      sentence = !indicator ? initial : withIndicator;
    }

    const params = {
      indicator: indicator && indicator.value.toLowerCase(),
      location: currentLabel,
      topGain: `${format('.2r')(topGain)}%`,
      percentileLength,
      region: percentileLength > 1 ? topRegion.label : 'This region',
      value:
        topRegion.percentage > 1 && settings.unit === '%'
          ? `${format('.2r')(topRegion.percentage)}%`
          : `${format('.3s')(topRegion.gain)}ha`,
      average:
        topRegion.percentage > 1 && settings.unit === '%'
          ? `${format('.2r')(avgGainPercentage)}%`
          : `${format('.3s')(avgGain)}ha`
    };

    return {
      sentence,
      params
    };
  }
);
