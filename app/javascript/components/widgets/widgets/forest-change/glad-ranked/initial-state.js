export default {
  title: 'Location of deforestation Alerts',
  config: {
    size: 'small',
    indicators: [
      'gadm28',
      'mining',
      'landmark',
      'ifl_2013',
      'wdpa',
      'plantations',
      'primary_forest'
    ],
    units: ['ha', '%'],
    categories: ['forest-change'],
    admins: ['country', 'region'],
    selectors: ['indicators', 'thresholds', 'units', 'extentYears', 'weeks'],
    metaKey: 'widget_deforestation_alert_location',
    locationWhitelist: [
      'BRA',
      'COL',
      'ECU',
      'GUF',
      'GUY',
      'PER',
      'SUR',
      'BDI',
      'CMR',
      'CAF',
      'GNQ',
      'GAB',
      'RWA',
      'UGA',
      'IDN',
      'MYS',
      'PNG',
      'VEN',
      'TLS',
      'COD',
      'COG'
    ],
    locationCheck: true,
    type: 'loss',
    layers: ['umd_as_it_happens'],
    sortOrder: {
      summary: 6,
      forestChange: 8
    },
    sentences: {
      initial:
        'In the last {timeframe}, {count} GLAD alerts were detected in {indicator} in {location}, which affected an area of approximately {area}. The top {topRegions} regions accounted for {topPercent} of all GLAD alerts.',
      oneRegion:
        'In the last {timeframe}, {count} GLAD alerts were detected in {indicator} in {location}, which affected an area of approximately {area}. The top {topRegions} region accounted for {topPercent} of all GLAD alerts.'
    }
  },
  settings: {
    indicator: 'gadm28',
    threshold: 30,
    extentYear: 2010,
    unit: '%',
    weeks: 4,
    pageSize: 5,
    page: 0,
    layers: ['umd_as_it_happens']
  },
  enabled: true
};
