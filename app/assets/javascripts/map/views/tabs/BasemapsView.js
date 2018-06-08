/**
 * The BasemapsView selector view.
 *
 * @return BasemapsView instance (extends Backbone.View).
 */
define(
  [
    'underscore',
    'handlebars',
    'enquire',
    'map/presenters/tabs/BasemapsPresenter',
    'text!map/templates/tabs/basemaps.handlebars'
  ],
  (_, Handlebars, enquire, Presenter, tpl) => {
    const BasemapsView = Backbone.View.extend({
      el: '#basemaps-tab',

      template: Handlebars.compile(tpl),

      events: {
        'click .maptype': '_setMaptype',
        'click .landsat-years li': '_setMaptype',
        'click .landsatSelector': 'toggleLandsat',
        'mouseover .landsat': 'showLandsat',
        'mouseout .landsat': 'hideLandsat'
      },

      initialize() {
        _.bindAll(this, 'selectMaptype');
        this.presenter = new Presenter(this);
        this.render();
        // Experiment
        // this.presenter.initExperiment('source');
        this.cartoAttribution =
          'Map tiles by <a href="http://carto.com/attributions#basemaps">CartoDB</a>, under <a href="https://creativecommons.org/licenses/by/3.0/">CC BY 3.0</a>. Data by <a href="http://www.openstreetmap.org/">OpenStreetMap</a>, under ODbL.';
      },

      render() {
        this.$el.html(this.template());
        this.$maptypeslist = this.$el;
        this.$maptypes = this.$el.find('.maptype');
        this.$landsatYears = $('.landsat-years');
        enquire.register(
          `screen and (min-width:${window.gfw.config.GFW_MOBILE}px)`,
          {
            match: _.bind(function () {
              this.mobile = false;
            }, this)
          }
        );
        enquire.register(
          `screen and (max-width:${window.gfw.config.GFW_MOBILE}px)`,
          {
            match: _.bind(function () {
              this.mobile = true;
            }, this)
          }
        );
      },

      _setMaptype(e) {
        e && e.preventDefault();
        if (
          !$(e.target).hasClass('source') &&
          !$(e.target)
            .parent()
            .hasClass('source')
        ) {
          const $currentTarget = $(e.currentTarget);
          const maptype = $currentTarget.data('maptype');
          if (maptype) {
            this.presenter.setMaptype(maptype);
            ga('send', 'event', 'Map', 'Toggle', maptype);
          }
        }
      },

      /**
       * Add selected mapview to .maptype-selected
       * and close the widget.
       *
       * @param  {string} maptype
       */
      selectMaptype(maptype) {
        this.$maptypes.removeClass('selected');

        if (maptype) {
          var maptype = maptype.indexOf('landsat') != -1 ? 'landsat' : maptype;
          this.$maptypeslist.find(`.${maptype}`).addClass('selected');
        }
      },

      showLandsat() {
        if (!this.mobile) {
          this.$landsatYears.addClass('active');
        }
      },

      hideLandsat() {
        if (!this.mobile) {
          this.$landsatYears.removeClass('active');
        }
      },

      toggleLandsat() {
        if (this.mobile) {
          this.$landsatYears.toggleClass('active');
        }
      }
    });

    return BasemapsView;
  }
);
