import request from 'utils/request';
import { getIndicator } from 'utils/strings';

const DATASET = process.env.COUNTRIES_PAGE_DATASET;
const REQUEST_URL = `${process.env.GFW_API_HOST_PROD}/query/${DATASET}?sql=`;
const CARTO_REQUEST_URL = `${process.env.CARTO_API_URL}/sql?q=`;

const SQL_QUERIES = {
  extent:
    "SELECT SUM({extentYear}) as value, SUM(area_gadm28) as total_area FROM data WHERE {location} thresh = {threshold} AND polyname = '{indicator}'",
  plantationsExtent:
    "SELECT SUM(area_poly_aoi) AS plantation_extent, {admin} AS region, {bound} AS label FROM data WHERE {location} thresh = 0 AND polyname = 'plantations' GROUP BY {type} ORDER BY plantation_extent DESC",
  multiRegionExtent:
    "SELECT {region} as region, SUM({extentYear}) as extent, SUM(area_gadm28) as total FROM data WHERE {location} thresh = {threshold} AND polyname = '{indicator}' GROUP BY {region} ORDER BY {region}",
  rankedExtent:
    "SELECT polyname, SUM({extent_year}) as value, SUM(area_gadm28) as total_area, FROM data WHERE polyname='{polyname}' AND thresh={threshold} GROUP BY polyname, iso",
  gain:
    "SELECT {calc} as value FROM data WHERE {location} polyname = '{indicator}' AND thresh = 0",
  gainRanked:
    "SELECT {region} as region, SUM(area_gain) AS gain, SUM({extentYear}) as value FROM data WHERE {location} polyname = '{polyname}' AND thresh = 0 GROUP BY region",
  gainLocations:
    "SELECT {admin} as region, {calc} as gain FROM data WHERE {location} thresh = 0 AND polyname = '{indicator}' {grouping} ",
  loss:
    "SELECT polyname, year_data.year as year, SUM(year_data.area_loss) as area, SUM(year_data.emissions) as emissions FROM data WHERE {location} polyname = '{indicator}' AND thresh= {threshold} GROUP BY polyname, iso, nested(year_data.year)",
  locations:
    "SELECT {location} as region, {extentYear} as extent, {extent} as total FROM data WHERE iso = '{iso}' AND thresh = {threshold} AND polyname = '{indicator}' {grouping}",
  locationsLoss:
    "SELECT {select} AS region, year_data.year as year, SUM(year_data.area_loss) as area_loss, FROM data WHERE polyname = '{indicator}' AND iso = '{iso}' {region} AND thresh= {threshold} GROUP BY {group}, nested(year_data.year) ORDER BY {order}",
  lossRanked:
    "SELECT polyname, year_data.year as year, SUM(year_data.area_loss) as loss, SUM({extent_year}) as extent, FROM data WHERE polyname = '{polyname}' AND thresh={threshold} GROUP BY polyname, iso, nested(year_data.year)",
  fao:
    'SELECT country AS iso, name, plantfor * 1000 AS planted_forest, primfor * 1000 AS forest_primary, natregfor * 1000 AS forest_regenerated, forest * 1000 AS extent, totarea as area_ha FROM table_1_forest_area_and_characteristics WHERE {location} year = 2015',
  faoExtent:
    'SELECT country AS iso, name, year, reforest * 1000 AS rate, forest*1000 AS extent FROM table_1_forest_area_and_characteristics as fao WHERE fao.year = {period} AND reforest > 0 ORDER BY rate DESC',
  faoDeforest:
    'SELECT fao.country, fao.name, fao.deforest * 1000 AS deforest, fao.humdef, fao.year FROM table_1_forest_area_and_characteristics as fao {location}',
  faoDeforestRank:
    'WITH mytable AS (SELECT fao.country as iso, fao.name, fao.deforest * 1000 AS deforest, fao.humdef FROM table_1_forest_area_and_characteristics as fao WHERE fao.year = {year} AND deforest is not null), rank AS (SELECT deforest, iso, name from mytable ORDER BY mytable.deforest DESC) SELECT row_number() over () as rank, iso, name, deforest from rank',
  faoEcoLive:
    'SELECT fao.country, fao.forempl, fao.femempl, fao.usdrev, fao.usdexp, fao.gdpusd2012, fao.totpop1000, fao.year FROM table_7_economics_livelihood as fao WHERE fao.year = 2000 or fao.year = 2005 or fao.year = 2010 or fao.year = 9999'
};

const getExtentYear = year =>
  (year === 2000 ? 'area_extent_2000' : 'area_extent');

const getLocationQuery = (country, region, subRegion) =>
  `${country ? `iso = '${country}' AND` : ''}${
    region ? ` adm1 = ${region} AND` : ''
  }${subRegion ? ` adm2 = ${subRegion} AND` : ''}`;

export const getLocations = ({
  country,
  region,
  forestType,
  landCategory,
  threshold,
  extentYear
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.locations}`
    .replace('{location}', region ? 'adm2' : 'adm1')
    .replace(
      '{extentYear}',
      `${!region ? 'sum(' : ''}${getExtentYear(extentYear)}${
        !region ? ')' : ''
      }`
    )
    .replace('{extent}', region ? 'area_gadm28' : 'sum(area_gadm28)')
    .replace('{iso}', country)
    .replace('{threshold}', threshold)
    .replace('{indicator}', getIndicator(forestType, landCategory))
    .replace('{grouping}', region ? `AND adm1 = '${region}'` : 'GROUP BY adm1');
  return request.get(url);
};

export const getLocationsLoss = ({
  country,
  region,
  forestType,
  landCategory,
  threshold
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.locationsLoss}`
    .replace('{select}', region ? 'adm2' : 'adm1')
    .replace('{group}', region ? 'adm2' : 'adm1')
    .replace('{order}', region ? 'adm2' : 'adm1')
    .replace('{iso}', country)
    .replace('{region}', region ? `AND adm1 = ${region}` : '')
    .replace('{threshold}', threshold)
    .replace('{indicator}', getIndicator(forestType, landCategory));
  return request.get(url);
};

export const fetchLossRanked = ({
  extentYear,
  forestType,
  landCategory,
  threshold
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.lossRanked}`
    .replace('{extent_year}', getExtentYear(extentYear))
    .replace('{polyname}', getIndicator(forestType, landCategory))
    .replace('{threshold}', threshold);
  return request.get(url);
};

export const fetchExtentRanked = ({
  extentYear,
  forestType,
  landCategory,
  threshold
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.rankedExtent}`
    .replace('{extent_year}', getExtentYear(extentYear))
    .replace('{polyname}', getIndicator(forestType, landCategory))
    .replace('{threshold}', threshold);
  return request.get(url);
};

export const getExtent = ({
  country,
  region,
  subRegion,
  forestType,
  landCategory,
  threshold,
  extentYear
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.extent}`
    .replace('{location}', getLocationQuery(country, region, subRegion))
    .replace('{threshold}', threshold)
    .replace('{indicator}', getIndicator(forestType, landCategory))
    .replace('{extentYear}', getExtentYear(extentYear));
  return request.get(url);
};

export const getPlantationsExtent = ({
  country,
  region,
  subRegion,
  threshold,
  type,
  groupByRegion
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.plantationsExtent}`
    .replace('{location}', getLocationQuery(country, region, subRegion))
    .replace('{threshold}', threshold)
    .replace('{admin}', region ? 'adm2' : 'adm1')
    .replace('{bound}', type)
    .replace(
      '{type}',
      groupByRegion ? `${region ? 'adm2' : 'adm1'}, ${type}` : type
    );
  return request.get(url);
};

export const getMultiRegionExtent = ({
  country,
  region,
  subRegion,
  forestType,
  landCategory,
  threshold,
  extentYear
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.multiRegionExtent}`
    .replace(/{region}/g, region ? 'adm2' : 'adm1')
    .replace('{location}', getLocationQuery(country, region, subRegion))
    .replace('{threshold}', threshold)
    .replace('{indicator}', getIndicator(forestType, landCategory))
    .replace('{extentYear}', getExtentYear(extentYear));
  return request.get(url);
};

export const getGain = ({
  country,
  region,
  subRegion,
  forestType,
  landCategory
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.gain}`
    .replace('{location}', getLocationQuery(country, region, subRegion))
    .replace('{calc}', region ? 'area_gain' : 'SUM(area_gain)')
    .replace('{indicator}', getIndicator(forestType, landCategory));
  return request.get(url);
};

export const getGainLocations = ({
  country,
  region,
  forestType,
  landCategory
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.gainLocations}`
    .replace('{location}', getLocationQuery(country, region))
    .replace('{admin}', region ? 'adm2' : 'adm1')
    .replace('{calc}', region ? 'area_gain' : 'SUM(area_gain)')
    .replace('{indicator}', getIndicator(forestType, landCategory))
    .replace('{grouping}', !region ? 'GROUP BY adm1 ORDER BY adm1' : '');
  return request.get(url);
};

export const getLoss = ({
  country,
  region,
  subRegion,
  forestType,
  landCategory,
  threshold
}) => {
  const url = `${REQUEST_URL}${SQL_QUERIES.loss}`
    .replace('{location}', getLocationQuery(country, region, subRegion))
    .replace('{threshold}', threshold)
    .replace('{indicator}', getIndicator(forestType, landCategory));
  return request.get(url);
};

export const getFAO = ({ country }) => {
  const url = `${CARTO_REQUEST_URL}${SQL_QUERIES.fao}`.replace(
    '{location}',
    country ? `country = '${country}' AND` : ''
  );
  return request.get(url);
};

export const getFAOExtent = ({ period }) => {
  const url = `${CARTO_REQUEST_URL}${SQL_QUERIES.faoExtent}`.replace(
    '{period}',
    period
  );
  return request.get(url);
};

export const getFAODeforest = ({ country }) => {
  const url = `${CARTO_REQUEST_URL}${SQL_QUERIES.faoDeforest}`.replace(
    '{location}',
    country ? `WHERE fao.country = '${country}'` : ''
  );
  return request.get(url);
};
export const getFAODeforestRank = ({ period }) => {
  const url = `${CARTO_REQUEST_URL}${SQL_QUERIES.faoDeforestRank}`.replace(
    '{year}',
    period
  );
  return request.get(url);
};

export const getFAOEcoLive = () => {
  const url = `${CARTO_REQUEST_URL}${SQL_QUERIES.faoEcoLive}`;
  return request.get(url);
};

export const getGainRanked = ({
  country,
  region,
  subRegion,
  forestType,
  landCategory,
  extentYear
}) => {
  let regionValue = 'iso';
  if (subRegion) {
    regionValue = 'adm2';
  } else if (region) {
    regionValue = 'adm1';
  }

  const location = region
    ? `iso = '${country}' AND ${subRegion ? `adm1 = ${region} AND` : ''}`
    : '';

  const url = `${REQUEST_URL}${SQL_QUERIES.gainRanked}`
    .replace('{region}', regionValue)
    .replace('{location}', location)
    .replace('{extentYear}', getExtentYear(extentYear))
    .replace('{polyname}', getIndicator(forestType, landCategory));
  return request.get(url);
};
