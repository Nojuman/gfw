import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-tippy';
import isEmpty from 'lodash/isEmpty';
import { COUNTRY } from 'pages/country/router';

import Button from 'components/ui/button';
import Icon from 'components/ui/icon';
import Tip from 'components/ui/tip';
import WidgetSettings from 'components/widgets/components/widget-settings';

import settingsIcon from 'assets/icons/settings.svg';
import shareIcon from 'assets/icons/share.svg';
import infoIcon from 'assets/icons/info.svg';
import mapIcon from 'assets/icons/map-button.svg';
import './widget-header-styles.scss';

class WidgetHeader extends PureComponent {
  constructor() {
    super();
    this.state = {
      tooltipOpen: false
    };
  }

  render() {
    const {
      title,
      settings,
      options,
      currentLocation,
      modalClosing,
      widget,
      location,
      query,
      embed,
      shareData,
      setShareModal,
      setModalMeta,
      setShowMapMobile,
      citation,
      active,
      haveMapLayers,
      isDeviceTouch,
      size,
      widgetMetaKey
    } = this.props;
    const { tooltipOpen } = this.state;

    return (
      <div className="c-widget-header">
        <div className="title">{`${title} in ${
          currentLocation ? currentLocation.label : ''
        }`}</div>
        <div className="options">
          {!embed &&
            haveMapLayers && (
              <Button
                className={`map-button ${active ? '-active' : ''}`}
                theme={`theme-button-small ${
                  size === 'small' || isDeviceTouch ? 'square' : ''
                }`}
                link={{
                  type: COUNTRY,
                  payload: { ...location.payload },
                  query: {
                    ...query,
                    widget
                  }
                }}
                trackingData={{
                  title: 'map-button',
                  widget: `${title} in ${
                    currentLocation ? currentLocation.label : ''
                  }`
                }}
                onClick={() => setShowMapMobile(true)}
                tooltip={
                  size === 'small'
                    ? {
                      theme: 'tip',
                      position: 'top',
                      arrow: true,
                      disabled: isDeviceTouch,
                      html: (
                        <Tip
                          text={
                            active ? 'Currently displayed' : 'Show on map'
                          }
                        />
                      )
                    }
                    : null
                }
              >
                {(size === 'small' || isDeviceTouch) && (
                  <Icon icon={mapIcon} className="map-icon" />
                )}
                {size !== 'small' && !isDeviceTouch && 'SHOW ON MAP'}
              </Button>
            )}
          {settings &&
            !isEmpty(options) && (
              <Tooltip
                className="widget-tooltip-theme"
                theme="light"
                position="bottom-right"
                offset={-95}
                trigger="click"
                interactive
                onRequestClose={() => {
                  if (!modalClosing) {
                    this.setState({ tooltipOpen: false });
                  }
                }}
                onShow={() => this.setState({ tooltipOpen: true })}
                arrow
                useContext
                open={tooltipOpen}
                html={<WidgetSettings {...this.props} />}
              >
                <Button
                  className="theme-button-small square"
                  tooltip={{
                    theme: 'tip',
                    position: 'top',
                    arrow: true,
                    disabled: isDeviceTouch,
                    html: <Tip text="Filter and customize the data" />
                  }}
                  trackingData={{
                    event: 'open-settings',
                    label: `${title} in ${
                      currentLocation ? currentLocation.label : ''
                    }`
                  }}
                >
                  <Icon icon={settingsIcon} className="settings-icon" />
                </Button>
              </Tooltip>
            )}
          {!embed &&
            (!isEmpty(options) || haveMapLayers) && (
              <div className="separator" />
            )}
          <div className="small-options">
            <Button
              className="theme-button-small square"
              onClick={() =>
                setModalMeta(
                  widgetMetaKey,
                  ['title', 'citation'],
                  ['function', 'source'],
                  citation
                )
              }
              tooltip={{
                theme: 'tip',
                position: 'top',
                arrow: true,
                disabled: isDeviceTouch,
                html: <Tip text="Learn more about the data" />
              }}
            >
              <Icon icon={infoIcon} />
            </Button>
            <Button
              className="theme-button-small square"
              onClick={() => setShareModal(shareData)}
              tooltip={{
                theme: 'tip',
                position: 'top',
                arrow: true,
                disabled: isDeviceTouch,
                html: <Tip text="Share or embed this widget" />
              }}
            >
              <Icon icon={shareIcon} />
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

WidgetHeader.propTypes = {
  widget: PropTypes.string,
  title: PropTypes.string.isRequired,
  settings: PropTypes.object,
  options: PropTypes.object,
  currentLocation: PropTypes.object,
  location: PropTypes.object,
  query: PropTypes.object,
  embed: PropTypes.bool,
  haveMapLayers: PropTypes.bool,
  isDeviceTouch: PropTypes.bool,
  size: PropTypes.string,
  widgetMetaKey: PropTypes.string,
  setShareModal: PropTypes.func.isRequired,
  shareData: PropTypes.object.isRequired,
  setModalMeta: PropTypes.func.isRequired,
  setShowMapMobile: PropTypes.func.isRequired,
  modalOpen: PropTypes.bool,
  modalClosing: PropTypes.bool,
  active: PropTypes.bool,
  citation: PropTypes.string,
  whitelist: PropTypes.object
};

export default WidgetHeader;
