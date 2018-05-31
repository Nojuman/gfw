import { createSelector } from 'reselect';
import { biomassToCO2 } from 'utils/calculations';
import isEmpty from 'lodash/isEmpty';
import { format } from 'd3-format';

// get list data
const getLocation = state => state.payload || null;
const getLocationNames = state => state.locationNames || null;
const getData = state => state.data || null;
const getCountries = state => state.countries || null;
const getRegions = state => state.regions || null;
const getError = state => state.error || null;
const getSubRegions = state => state.subRegions || null;
const getSentences = state => state.config.sentences || null;

// get lists selected
export const getAdminsSelected = createSelector(
  [getCountries, getRegions, getSubRegions, getLocation],
  (countries, regions, subRegions, location) => {
    const country =
      (countries && countries.find(i => i.value === location.country)) || null;
    const region =
      (regions && regions.find(i => i.value === location.region)) || null;
    const subRegion =
      (subRegions && subRegions.find(i => i.value === location.subRegion)) ||
      null;
    let current = country;
    if (location.subRegion) {
      current = subRegion;
    } else if (location.region) {
      current = region;
    }

    return {
      ...current,
      country,
      region,
      subRegion
    };
  }
);

export const getSentence = createSelector(
  [getLocationNames, getData, getSentences, getError],
  (locationNames, data, sentences, error) => {
    if (error) {
      return 'An error occured while fetching data. Please try again later.';
    }
    if (isEmpty(data) || isEmpty(locationNames)) return {};
    const { initial, withLoss, withPlantationLoss } = sentences;
    const extent =
      data.extent < 1 ? format('.3r')(data.extent) : format('.3s')(data.extent);
    const percentageCover = format('.1f')(data.extent / data.totalArea * 100);
    const lossWithOutPlantations = format('.2s')(
      data.totalLoss.area - (data.plantationsLoss.area || 0)
    );
    const emissionsWithoutPlantations = format('.2s')(
      biomassToCO2(
        data.totalLoss.emissions - (data.plantationsLoss.emissions || 0)
      )
    );
    const location = locationNames && locationNames.label;

    const params = {
      extent: `${extent}ha`,
      location: location || 'the world',
      percentage: `${percentageCover}%`,
      loss: `${lossWithOutPlantations}ha`,
      emission: `${emissionsWithoutPlantations}t`,
      year: data.totalLoss.year
    };

    let sentence = initial;
    if (data.extent > 0 && data.totalLoss.area && data.plantationsLoss.area) {
      sentence =
        data.plantationsLoss.area && location ? withPlantationLoss : withLoss;
    }

    return {
      sentence,
      params
    };
  }
);
