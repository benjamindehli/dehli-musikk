// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemContent/ListItemContentBody.module.scss';

class ListItemContentBody extends React.Component {
  render() {
    return (<div className={`${style.listItemContentBody} ${this.props.fullscreen ? style.fullscreen : ''}`}>
      {this.props.children}
    </div>)
  }
};

ListItemContentBody.propTypes = {
  fullscreen: PropTypes.bool,
};

ListItemContentBody.defaultProps = {
  fullscreen: false
};

export default ListItemContentBody;
