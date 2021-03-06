import request from 'utils/request';

const REQUEST_URL = `${process.env.RESOURCE_WATCH_API_URL}/geostore/admin/`;

export const getGeostoreProvider = (country, region, subRegion) => {
  const url = `${REQUEST_URL}${country}${region ? `/${region}` : ''}${
    subRegion ? `/${subRegion}` : ''
  }`;
  return request.get(url);
};

export default {
  getGeostoreProvider
};
