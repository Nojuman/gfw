import React, { PureComponent } from 'react';
import Link from 'redux-first-router-link';
import PropTypes from 'prop-types';
import { format } from 'd3-format';

import Paginate from 'components/paginate';

import './numbered-list-styles.scss';

class NumberedList extends PureComponent {
  render() {
    const {
      className,
      data,
      settings,
      handlePageChange,
      linksDisabled,
      linksExt
    } = this.props;
    const { page, pageSize, unit, unitFormat } = settings;
    const pageData = pageSize
      ? data.slice(page * pageSize, (page + 1) * pageSize)
      : data;

    return (
      <div className={`c-numbered-list ${className}`}>
        <ul className="list">
          {data.length > 0 &&
            pageData.map((item, index) => {
              const linkContent = (
                <div className="list-item">
                  <div className="item-label">
                    <div
                      className="item-bubble"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.rank || index + 1 + pageSize * page}
                    </div>
                    <div className="item-name">{item.label}</div>
                  </div>
                  <div className="item-value">
                    {unitFormat
                      ? unitFormat(item.value)
                      : format('.3s')(item.value)}
                    {unit}
                  </div>
                </div>
              );
              return (
                <li key={`${item.label}-${item.id}`}>
                  {linksExt ? (
                    <a
                      href={`http://${window.location.host}${item.path}`}
                      target="_blank"
                      rel="noopener nofollower"
                    >
                      {linkContent}
                    </a>
                  ) : (
                    <Link
                      className={`${linksDisabled ? 'disabled' : ''}`}
                      to={item.path}
                    >
                      {linkContent}
                    </Link>
                  )}
                </li>
              );
            })}
        </ul>
        {handlePageChange &&
          data.length > settings.pageSize && (
            <Paginate
              settings={settings}
              count={data.length}
              onClickChange={handlePageChange}
            />
          )}
      </div>
    );
  }
}

NumberedList.propTypes = {
  data: PropTypes.array.isRequired,
  settings: PropTypes.object.isRequired,
  handlePageChange: PropTypes.func,
  className: PropTypes.string,
  linksDisabled: PropTypes.bool,
  linksExt: PropTypes.bool
};

export default NumberedList;
