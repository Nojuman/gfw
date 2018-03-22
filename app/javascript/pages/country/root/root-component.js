import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import upperFirst from 'lodash/upperFirst';
import Sticky from 'react-stickynode';
import { SCREEN_M } from 'utils/constants';

import CountryDataProvider from 'pages/country/providers/country-data-provider';
import WhitelistsProvider from 'pages/country/providers/whitelists-provider';

import Widget from 'pages/country/widget';
import Meta from 'pages/country/meta';
import Header from 'pages/country/header';

import Share from 'components/share';
import Map from 'components/map';
import MapControls from 'components/map/components/map-controls';
import SubNavMenu from 'components/subnav-menu';
import NoContent from 'components/no-content';
import Loader from 'components/loader';
import Button from 'components/button';
import Icon from 'components/icon';
import ModalMeta from 'components/modal-meta';
import ScrollTo from 'components/scroll-to';

import { IntlProvider, FormattedMessage } from 'react-intl';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
// import es_MX from 'react-intl/locale-data/es-MX';
import fr from 'react-intl/locale-data/fr';
import id from 'react-intl/locale-data/id';
// import pt_BR from 'react-intl/locale-data/pt-BR';
import translations from 'locales/index.js';

addLocaleData([...en, ...fr, ...id]);

import closeIcon from 'assets/icons/close.svg';
import './root-styles.scss';

class Root extends PureComponent {
  render() {
    const {
      showMapMobile,
      handleShowMapMobile,
      links,
      isGeostoreLoading,
      widgets,
      location,
      currentLocation,
      locationOptions,
      locationNames,
      category,
      loading,
      widgetAnchor,
      activeWidget,
      locationGeoJson,
      setMapZoom,
      locale
    } = this.props;
    const mergedMessages = { ...translations['en'], ...translations[locale] };
    return (
      <IntlProvider
        locale={locale}
        messages={mergedMessages}
      >
        <div className="l-country">
          {showMapMobile && (
            <Button
              theme="square theme-button-light"
              className="close-map-button"
              onClick={handleShowMapMobile}
            >
              <Icon icon={closeIcon} />
            </Button>
          )}
          <div className="content-panel">
            <Header
              className="header"
              location={location}
              locationOptions={locationOptions}
              locationNames={locationNames}
            />
            <SubNavMenu
              className="nav"
              theme="theme-subnav-dark"
              links={links}
              checkActive
            />
            <div className="widgets">
              {loading && <Loader className="widgets-loader large" />}
              {!loading &&
                widgets &&
                widgets.length > 0 &&
                widgets.map(widget => (
                  <Widget
                    key={widget.name}
                    widget={widget.name}
                    active={activeWidget && activeWidget.name === widget.name}
                  />
                ))}
              {!loading &&
                (!widgets || widgets.length === 0) && (
                  <NoContent
                    className="no-widgets-message large"
                    message={`${upperFirst(
                      category
                    )} data for ${currentLocation} coming soon`}
                    icon
                  />
                )}
            </div>
          </div>
          <FormattedMessage
            id='app.greeting'
            defaultMessage='Hello, {name}!'
            values={{
                name: 'Eric'
            }}
          />
          <FormattedMessage
            id='app.test'
            defaultMessage='Hello, {name}!'
            values={{
                name: 'Eric'
            }}
          />
          <div className={`map-panel ${showMapMobile ? '-open-mobile' : ''}`}>
            <Sticky
              enabled={window.innerWidth > SCREEN_M}
              bottomBoundary=".l-country"
            >
              <div className="map-container">
                <Map
                  maxZoom={14}
                  minZoom={3}
                  mapOptions={{
                    mapTypeId: 'GFWdefault',
                    backgroundColor: '#99b3cc',
                    disableDefaultUI: true,
                    panControl: false,
                    zoomControl: false,
                    mapTypeControl: false,
                    scaleControl: true,
                    streetViewControl: false,
                    overviewMapControl: false,
                    tilt: 0,
                    scrollwheel: false,
                    center: { lat: -34.397, lng: 150.644 },
                    zoom: 8
                  }}
                  areaHighlight={locationGeoJson}
                  isParentLoading={isGeostoreLoading}
                  parentLayersKey={
                    activeWidget && `widget${upperFirst(activeWidget.name)}`
                  }
                />
              </div>
            </Sticky>
          </div>
          {!isGeostoreLoading && (
            <MapControls
              className="map-controls"
              stickyOptions={{ enabled: true, top: 15 }}
              handleZoomIn={() => setMapZoom({ value: 1, sum: true })}
              handleZoomOut={() => setMapZoom({ value: -1, sum: true })}
            />
          )}
          <Share />
          <ModalMeta />
          {widgetAnchor && <ScrollTo target={widgetAnchor} />}
          <CountryDataProvider />
          <WhitelistsProvider />
          <Meta
            page={
              locationNames &&
              locationNames.country &&
              locationNames.country.label
            }
          />
        </div>
      </IntlProvider>
    );
  }
}

Root.propTypes = {
  showMapMobile: PropTypes.bool.isRequired,
  handleShowMapMobile: PropTypes.func.isRequired,
  links: PropTypes.array.isRequired,
  isGeostoreLoading: PropTypes.bool,
  widgets: PropTypes.array,
  location: PropTypes.object,
  loading: PropTypes.bool,
  currentLocation: PropTypes.string,
  category: PropTypes.string,
  locationOptions: PropTypes.object,
  locationNames: PropTypes.object,
  widgetAnchor: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  locationGeoJson: PropTypes.object,
  activeWidget: PropTypes.object,
  setMapZoom: PropTypes.func
};

export default Root;
