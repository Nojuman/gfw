import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import NoContent from 'components/ui/no-content';
import WidgetPieChartLegend from 'components/widgets/components/widget-pie-chart-legend';

import './styles';

class WidgetForestryEmployment extends PureComponent {
  render() {
    const { data } = this.props;

    return (
      <div className="c-widget-forestry-employment">
        {data[0].noContent ? (
          <NoContent message="No gender data available" />
        ) : (
          <WidgetPieChartLegend {...this.props} />
        )}
      </div>
    );
  }
}

WidgetForestryEmployment.propTypes = {
  data: PropTypes.array
};
export default WidgetForestryEmployment;
