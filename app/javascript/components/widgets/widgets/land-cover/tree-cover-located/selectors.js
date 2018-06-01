import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';
import sumBy from 'lodash/sumBy';
import { sortByKey } from 'utils/data';
import { format } from 'd3-format';
import { getAdminPath } from '../../../utils';

// get list data
const getData = state => state.data || null;
const getSettings = state => state.settings || null;
const getOptions = state => state.options || null;
const getIndicator = state => state.indicator || null;
const getLocation = state => state.payload || null;
const getQuery = state => state.query || null;
const getLocationsMeta = state => state[state.childKey] || null;
const getCurrentLocation = state => state.currentLabel || null;
const getColors = state => state.colors || null;
const getSentences = state => state.config && state.config.sentences;

export const parseList = createSelector(
  [getData, getSettings, getLocation, getLocationsMeta, getColors, getQuery],
  (data, settings, location, meta, colors, query) => {
    if (isEmpty(data) || isEmpty(meta)) return null;
    const dataMapped = [];
    data.forEach(d => {
      const regionMeta = meta.find(l => d.id === l.value);
      if (regionMeta) {
        dataMapped.push({
          label: (regionMeta && regionMeta.label) || '',
          extent: d.extent,
          percentage: d.percentage,
          value: settings.unit === 'ha' ? d.extent : d.percentage,
          path: getAdminPath({ ...location, query, id: d.id }),
          color: colors.main
        });
      }
    });
    return sortByKey(dataMapped, 'extent', true);
  }
);

export const parseData = createSelector([parseList], data => {
  if (isEmpty(data)) return null;
  return sortByKey(uniqBy(data, 'label'), 'value', true);
});

export const getSentence = createSelector(
  [
    parseList,
    parseData,
    getSettings,
    getOptions,
    getLocation,
    getIndicator,
    getCurrentLocation,
    getSentences
  ],
  (
    list,
    data,
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
      hasIndicator,
      globalInitial,
      globalWithIndicator,
      percInitial,
      percHasIndicator,
      percGlobalInitial,
      percGlobalWithIndicator,
      noCover
    } = sentences;
    const topRegion = (data.length && data[0]) || {};
    const totalExtent = sumBy(data, 'extent');
    const avgExtent = sumBy(data, 'extent') / data.length;
    const avgExtentPercentage = sumBy(data, 'percentage') / data.length;
    let percentileExtent = 0;
    let percentileLength = 0;
    while (
      percentileLength < data.length &&
      percentileExtent / totalExtent < 0.5 &&
      data.length !== 10
    ) {
      percentileExtent += list[percentileLength].extent;
      percentileLength += 1;
    }
    const topExtent = percentileExtent / (totalExtent || 0) * 100;

    const topRegionExtent =
      topRegion.extent < 1
        ? `${format('.3r')(topRegion.extent)}ha`
        : `${format('.3s')(topRegion.extent)}ha`;
    const aveRegionExtent =
      avgExtent < 1
        ? `${format('.3r')(avgExtent)}ha`
        : `${format('.3s')(avgExtent)}ha`;

    const topRegionPercent =
      topRegion.percentage < 0.1
        ? '<0.1%'
        : `${format('.2r')(topRegion.percentage)}%`;
    const aveRegionPercent =
      avgExtentPercentage < 0.1
        ? '<0.1%'
        : `${format('.2r')(avgExtentPercentage)}%`;

    const params = {
      location: currentLabel === 'global' ? 'Globally' : currentLabel,
      region: topRegion.label,
      indicator: indicator && indicator.label.toLowerCase(),
      percentage: topExtent ? `${format('.2r')(topExtent)}%` : '0%',
      year: settings.extentYear,
      value: settings.unit === '%' ? topRegionPercent : topRegionExtent,
      average: settings.unit === '%' ? aveRegionPercent : aveRegionExtent,
      count: percentileLength
    };

    let sentence = noCover;
    if (params.percentage !== '0%' && settings.unit === '%') {
      sentence = currentLabel === 'global' ? percGlobalInitial : percInitial;
      if (indicator) {
        sentence =
          currentLabel === 'global'
            ? percGlobalWithIndicator
            : percHasIndicator;
      }
    } else if (params.percentage !== '0%' && settings.unit === 'ha') {
      sentence = currentLabel === 'global' ? globalInitial : initial;
      if (indicator) {
        sentence =
          currentLabel === 'global' ? globalWithIndicator : hasIndicator;
      }
    }

    return {
      sentence,
      params
    };
  }
);
