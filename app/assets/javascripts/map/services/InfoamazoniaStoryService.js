/**
 * Aysynchronous service for use stories layer.
 *
 */
define(['underscore', 'Class', 'map/services/DataService'], (
  _,
  Class,
  ds
) => {
  const InfoamazoniaStoryService = Class.extend({
    requestId: 'InfoamazoniaStoryService',

    url:
      '//wri-01.carto.com/api/v2/sql?q=(SELECT ST_AsGeoJSON(the_geom),the_geom_webmercator, title, permalink FROM geojson union SELECT ST_AsGeoJSON(the_geom),the_geom_webmercator, title, permalink FROM table_4200314533 where the_geom_webmercator is not null) union SELECT ST_AsGeoJSON(the_geom),the_geom_webmercator, title, permalink FROM table_2528172694 where the_geom_webmercator is not null',

    /**
     * Constructs a new instance of StoryService.
     *
     * @return {StoryService} instance
     */
    init() {
      this._defineRequests();
    },

    /**
     * Defines JSON requests used by StoryService.
     */
    _defineRequests() {
      const cache = { type: 'persist', duration: 1, unit: 'days' };
      const url = this.url;
      const config = { cache, url, type: 'GET', dataType: 'json' };
      ds.define(this.requestId, config);
    },

    fetchStories(successCb, errorCb) {
      function _parseData(data) {
        const result = _.map(data.rows, (d) => {
          d.latlng = JSON.parse(d.st_asgeojson).coordinates;
          d.lat = d.latlng[1];
          d.lng = d.latlng[0];
          d.link = d.permalink;
          return d;
        });
        successCb(result);
      }

      const config = {
        resourceId: this.requestId,
        success: _parseData,
        error: errorCb
      };

      ds.request(config);
    }
  });

  const service = new InfoamazoniaStoryService();

  return service;
});
