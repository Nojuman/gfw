import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import NumberedList from 'components/numbered-list';
import WidgetDynamicSentence from '../../components/widget-dynamic-sentence';

import './widget-glad-ranked-styles.scss';

class WidgetGladRanked extends PureComponent {
  render() {
    const { data, settings, handlePageChange, embed, sentence } = this.props;

    return (
      <div className="c-widget-loss-located">
        <WidgetDynamicSentence sentence={sentence} />
        {data &&
          data.length > 0 && (
            <NumberedList
              className="locations-list"
              data={data}
              settings={settings}
              handlePageChange={handlePageChange}
              linksExt={embed}
            />
          )}
      </div>
    );
  }
}

WidgetGladRanked.propTypes = {
  data: PropTypes.array,
  settings: PropTypes.object.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  embed: PropTypes.bool,
  sentence: PropTypes.string
};

export default WidgetGladRanked;
