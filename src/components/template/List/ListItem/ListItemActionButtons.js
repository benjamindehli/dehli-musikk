// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemActionButtons.module.scss';

class ListItemActionButtons extends React.Component {
  render() {
    return (<div className={`${style.listItemActionButtons} ${this.props.fullscreen ? style.fullscreen : ''}`}>
      {this.props.children}
    </div>)
  }
};

ListItemActionButtons.propTypes = {
  fullscreen: PropTypes.bool,
};

ListItemActionButtons.defaultProps = {
  fullscreen: false
};

export default ListItemActionButtons;
