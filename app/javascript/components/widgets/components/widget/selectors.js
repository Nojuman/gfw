import { createSelector } from 'reselect';

import isEmpty from 'lodash/isEmpty';
import uniq from 'lodash/uniq';
import lowerCase from 'lodash/lowerCase';
import { sortByKey } from 'utils/data';
import { pluralise } from 'utils/strings';

// get list data
const getData = state => state.data || null;
const getOptions = state => state.options || null;
const getConfig = state => state.config || null;
const getSettings = state => state.settings || null;
const getLocation = state => state.payload || null;
const getWhitelist = state => state.whitelist || null;
const getForestType = state => state.forestType || null;
const getLandCategory = state => state.landCategory || null;
const getDatasets = state => state.nonGlobalDatasets || null;

export const getOptionsSelected = createSelector(
  [getOptions, getSettings],
  (options, settings) => {
    if (!options || !settings) return null;
    const optionsMeta = {};
    Object.keys(settings).forEach(o => {
      const optionsKey = pluralise(o);
      if (options[optionsKey]) {
        optionsMeta[o] = options[optionsKey].find(
          opt => opt.value === settings[o]
        );
      }
    });
    return optionsMeta;
  }
);

export const getIndicator = createSelector(
  [getForestType, getLandCategory],
  (forestType, landCategory) => {
    if (!forestType && !landCategory) return null;
    let label = '';
    let value = '';
    if (forestType && landCategory) {
      label = `${forestType.label} in ${landCategory.label}`;
      value = `${forestType.value}__${landCategory.value}`;
    } else if (landCategory) {
      label = landCategory.label;
      value = landCategory.value;
    } else {
      label = forestType.label;
      value = forestType.value;
    }

    return {
      label,
      value
    };
  }
);

export const getNonGlobalDatasets = createSelector(
  [getIndicator, getLocation, getDatasets],
  (indicator, location, datasets) => {
    if (!datasets || location.type !== 'global') return null;
    return datasets[indicator && indicator.value];
  }
);

// get options
export const getForestTypes = createSelector(
  [getWhitelist, getLocation, getConfig, getOptions],
  (whitelist, location, config, options) => {
    if (isEmpty(options)) return null;
    const { forestTypes } = options;
    const { country } = location;
    let filteredOptions = forestTypes;

    if (!isEmpty(whitelist)) {
      filteredOptions = forestTypes.filter(
        i => whitelist.indexOf(i.value) > -1
      );
    }

    return sortByKey(
      filteredOptions
        .filter(
          f => config.forestTypes && config.forestTypes.indexOf(f.value) > -1
        )
        .map(i => ({
          ...i,
          metaKey:
            i.metaKey === 'primary_forest'
              ? `${lowerCase(country)}_${i.metaKey}${
                country === 'IDN' ? 's' : ''
              }`
              : i.metaKey
        })),
      'label'
    );
  }
);

export const getLandCategories = createSelector(
  [getWhitelist, getConfig, getOptions],
  (whitelist, config, options) => {
    if (isEmpty(options)) return null;
    const { landCategories } = options;
    let filteredOptions = landCategories;

    if (!isEmpty(whitelist)) {
      filteredOptions = landCategories.filter(
        i => whitelist.indexOf(i.value) > -1
      );
    }

    return sortByKey(
      filteredOptions.filter(
        l =>
          config.landCategories && config.landCategories.indexOf(l.value) > -1
      ),
      'label'
    );
  }
);

export const getUnits = createSelector(
  [getConfig, getOptions],
  (config, options) => {
    const units = options.units.filter(item =>
      config.units.includes(item.value)
    );
    return sortByKey(units, 'label');
  }
);

export const getWeeks = createSelector(
  [getConfig, getOptions],
  (config, options) => {
    if (!config || !config.weeks) return options.weeks;
    return options.weeks.filter(w => config.weeks.indexOf(w.value) > -1);
  }
);

export const getDatasets = createSelector(
  [getConfig, getOptions],
  (config, options) => {
    if (!config || !config.datasets) return options.datasets;
    return options.datasets.filter(w => config.datasets.indexOf(w.value) > -1);
  }
);

export const getRangeYears = createSelector(
  [getData, getConfig],
  (data, config) => {
    if (isEmpty(data)) return null;
    const yearsData =
      data.loss ||
      (data.lossByRegion &&
        data.lossByRegion.length &&
        data.lossByRegion[0].loss) ||
      data;
    if (isEmpty(yearsData) || !Array.isArray(yearsData)) return null;
    return uniq(yearsData.map(d => d.year))
      .filter(
        d =>
          !config.yearRange ||
          (d >= config.yearRange[0] && d <= config.yearRange[1])
      )
      .map(d => ({
        label: d,
        value: d
      }));
  }
);

export const getStartYears = createSelector(
  [getRangeYears, getSettings],
  (years, settings) => {
    if (isEmpty(years)) return null;
    const { endYear } = settings;
    return years.filter(y => y.value <= endYear);
  }
);

export const getEndYears = createSelector(
  [getRangeYears, getSettings],
  (years, settings) => {
    if (isEmpty(years)) return null;
    const { startYear } = settings;
    return years.filter(y => y.value >= startYear);
  }
);

export const getYears = createSelector([getConfig], config => {
  if (!config.years) return null;
  return config.years.map(d => ({
    label: d,
    value: d
  }));
});
