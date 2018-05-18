import { createSelector } from 'reselect';
import isEmpty from 'lodash/isEmpty';
import sortBy from 'lodash/sortBy';
import { format } from 'd3-format';
import groupBy from 'lodash/groupBy';
import sumBy from 'lodash/sumBy';
import moment from 'moment';

// get list data
const getData = state => (state.data && state.data.alerts) || null;
const getLatestDates = state => (state.data && state.data.latest) || null;
const getExtent = state => (state.data && state.data.extent) || null;
const getSettings = state => state.settings || null;
const getOptions = state => state.options || null;
const getIndicator = state => state.indicator || null;
const getLocation = state => state.payload || null;
const getLocationsMeta = state =>
  (!state.payload.region ? state.regions : state.subRegions) || null;
const getCurrentLocation = state => state.currentLabel || null;
const getColors = state => state.colors || null;
const getSentences = state => state.config.sentences || null;

export const parseData = createSelector(
  [
    getData,
    getLatestDates,
    getExtent,
    getSettings,
    getLocation,
    getLocationsMeta,
    getColors
  ],
  (data, latest, extent, settings, location, meta, colors) => {
    if (!data || isEmpty(data) || !meta || isEmpty(meta)) return null;
    const latestWeek = moment(latest)
      .subtract(1, 'weeks')
      .week();
    const latestYear = moment(latest)
      .subtract(1, 'weeks')
      .year();
    const alertsByDate = data.filter(d =>
      moment()
        .week(d.week)
        .year(d.year)
        .isAfter(
          moment()
            .week(latestWeek)
            .year(latestYear)
            .subtract(settings.weeks, 'weeks')
        )
    );
    const groupedAlerts = groupBy(
      alertsByDate,
      location.region ? 'adm2' : 'adm1'
    );
    const mappedData = Object.keys(groupedAlerts).map(k => {
      const region = meta.find(l => parseInt(k, 10) === l.value);
      const regionExtent = extent.find(a => a.region === parseInt(k, 10));
      const regionData = groupedAlerts[k];
      const countsArea = sumBy(regionData, 'area_ha');
      const counts = sumBy(regionData, 'count');
      const countsAreaPerc =
        countsArea && regionExtent ? countsArea / regionExtent.extent * 100 : 0;
      const countsPerHa =
        counts && regionExtent ? counts / regionExtent.extent : 0;
      return {
        id: k,
        color: colors.main,
        percentage:
          countsAreaPerc >= 0.1 ? `${format('.2r')(countsAreaPerc)}%` : '<0.1%',
        countsPerHa,
        count: counts,
        area: countsArea,
        value: settings.unit === 'ha' ? countsArea : countsAreaPerc,
        label: (region && region.label) || '',
        path: `/dashboards/country/${location.country}/${
          location.region ? `${location.region}/` : ''
        }${k}`
      };
    });
    return sortBy(mappedData, 'value').reverse();
  }
);

export const getSentence = createSelector(
  [
    parseData,
    getSettings,
    getOptions,
    getLocation,
    getIndicator,
    getCurrentLocation,
    getSentences
  ],
  (data, settings, options, location, indicator, currentLabel, sentences) => {
    if (!data || !options || !currentLabel) return '';
    const { initial, oneRegion } = sentences;
    const totalCount = sumBy(data, 'count');
    let percentileCount = 0;
    let percentileLength = 0;

    while (
      (percentileLength < data.length && percentileCount / totalCount < 0.5) ||
      (percentileLength < 10 && data.length > 10)
    ) {
      percentileCount += data[percentileLength].count;
      percentileLength += 1;
    }
    const topCount = percentileCount / totalCount * 100;
    const params = {
      timeframe: options.weeks.find(w => w.value === settings.weeks).label,
      count: format(',')(sumBy(data, 'count')),
      area: `${format('.3s')(sumBy(data, 'area'))}ha`,
      topPercent: `${format('.2r')(topCount)}%`,
      topRegions: percentileLength,
      location: currentLabel,
      indicator: `${indicator ? `${indicator.label.toLowerCase()} in ` : ''}`
    };
    const sentence = percentileLength === 1 ? oneRegion : initial;
    return { sentence, params };
  }
);
