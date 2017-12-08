import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import upperFirst from 'lodash/upperFirst';
import camelCase from 'lodash/camelCase';

import WidgetTreeCover from 'pages/country/widget/widgets/widget-tree-cover';
import WidgetTreeLocated from 'pages/country/widget/widgets/widget-tree-located';
import WidgetTreeLoss from 'pages/country/widget/widgets/widget-tree-loss';
import WidgetTotalAreaPlantations from 'pages/country/widget/widgets/widget-total-area-plantations';
import WidgetTreeGain from 'pages/country/widget/widgets/widget-tree-gain';
import WidgetPlantationArea from 'pages/country/widget/widgets/widget-plantation-area';

import './widget-styles.scss';
import './widget-settings-styles.scss';
import './widget-tooltip-styles.scss';

const widgets = {
  WidgetTreeCover,
  WidgetTreeGain,
  WidgetTreeLocated,
  WidgetTreeLoss,
  WidgetTotalAreaPlantations,
  WidgetPlantationArea
};

class Widget extends PureComponent {
  render() {
    const { widget } = this.props;
    const WidgetComponent = widgets[`Widget${upperFirst(camelCase(widget))}`];
    return (
      <div>
        <WidgetComponent {...this.props} />
      </div>
    );
  }
}

Widget.propTypes = {
  widget: PropTypes.string.isRequired,
  locationNames: PropTypes.object
};

export default Widget;
