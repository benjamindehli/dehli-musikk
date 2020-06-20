// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/List.module.scss';

class List extends React.Component {
  render() {
    return (<div className={`${style.list} ${this.props.compact ? style.compact : ''}`}>
      {this.props.children}
    </div>)
  }
};

List.propTypes = {
  compact: PropTypes.bool,
};

List.defaultProps = {
  compact: false
};

export default List;
