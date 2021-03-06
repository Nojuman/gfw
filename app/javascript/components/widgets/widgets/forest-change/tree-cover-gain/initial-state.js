export default {
  title: {
    global: 'Global Tree cover gain',
    withLocation: 'Tree cover gain in {location} compared to other areas'
  },
  config: {
    size: 'small',
    forestTypes: ['ifl_2013'],
    landCategories: ['wdpa', 'landmark', 'mining'],
    units: ['ha'],
    categories: ['summary', 'forest-change'],
    admins: ['global', 'country', 'region', 'subRegion'],
    selectors: ['forestTypes', 'landCategories'],
    type: 'gain',
    metaKey: 'widget_tree_cover_gain',
    layers: ['forestgain'],
    sortOrder: {
      summary: 3,
      forestChange: 7
    },
    sentences: {
      globalInitial:
        'From 2001 to 2012, {gain} of tree cover was gained {location}.',
      globalWithIndicator:
        'From 2001 to 2012, {gain} of tree cover was gained within {indicator} {location}.',
      initial:
        'From 2001 to 2012, {location} gained {gain} of tree cover equal to {gainPercent} of global total.',
      withIndicator:
        'From 2001 to 2012, {location} gained {gain} of tree cover in {indicator} equal to {gainPercent} of global total.',
      regionInitial:
        'From 2001 to 2012, {location} gained {gain} of tree cover {indicator} equal to {gainPercent} of all tree cover gain in {parent}.',
      regionWithIndicator:
        'From 2001 to 2012, {location} gained {gain} of tree cover in {indicator} equal to {gainPercent} of all tree cover gain in {parent}.'
    }
  },
  settings: {
    threshold: 50,
    unit: 'ha',
    layers: ['forestgain'],
    pageSize: 5,
    page: 0
  },
  enabled: true
};
