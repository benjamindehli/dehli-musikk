// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemContent.module.scss';

class ListItemContent extends React.Component {
  render() {
    return (<div className={`${style.listItemContent} ${this.props.fullscreen ? style.fullscreen : ''}`}>
      {this.props.children}
    </div>)
  }
};

ListItemContent.propTypes = {
  fullscreen: PropTypes.bool,
};

ListItemContent.defaultProps = {
  fullscreen: false
};

export default ListItemContent;
