import findIndex from 'lodash/findIndex';

export const getAdminPath = ({ country, region, query, id }) =>
  `/dashboards/country/${country ? `${country}/` : ''}${
    region ? `${region}/` : ''
  }${id || ''}${query && query.category ? `?category=${query.category}` : ''}`;

export const getRankedData = ({ data, meta, location, indexValue, trim }) => {
  const dataWithLocation = [];
  data.forEach((d, i) => {
    const locationData = meta && meta.find(l => d.id === l.value);
    if (locationData) {
      dataWithLocation.push({
        ...d,
        label: locationData && locationData.label,
        rank: i + 1
      });
    }
  });
  let dataTrimmed = dataWithLocation;
  if (location.country) {
    const locationIndex = findIndex(dataWithLocation, d => d.id === indexValue);
    let trimStart = locationIndex - Math.floor(trim / 2);
    let trimEnd = locationIndex + Math.ceil(trim / 2);
    if (locationIndex < Math.floor(trim / 2)) {
      trimStart = 0;
      trimEnd = trim;
    }
    if (locationIndex > dataWithLocation.length - Math.ceil(trim / 2)) {
      trimStart = dataWithLocation.length - trim;
      trimEnd = dataWithLocation.length;
    }
    dataTrimmed = dataWithLocation.slice(trimStart, trimEnd);
  }
  return dataTrimmed;
};
