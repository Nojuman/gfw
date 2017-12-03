import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import numeral from 'numeral';

class WidgetTreeLossTooltip extends PureComponent {
  render() {
    const { data, extent } = this.props;

    if (!data || data.length === 0) {
      return null;
    }

    return (
      <ul>
        <li>Year: {data[0].payload.year}</li>
        <li>ha loss: {numeral(data[0].payload.area).format('0,0')} ha</li>
        <li>
          % loss:{' '}
          {numeral(data[0].payload.area / (extent * 100)).format('0.00')}%
        </li>
      </ul>
    );
  }
}

WidgetTreeLossTooltip.propTypes = {
  data: PropTypes.array,
  extent: PropTypes.number.isRequired
};

export default WidgetTreeLossTooltip;
