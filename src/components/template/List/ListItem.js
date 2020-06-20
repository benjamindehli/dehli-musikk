// Dependencies
import React from 'react';
import PropTypes from 'prop-types';

// Stylesheets
import style from 'components/template/List/ListItem.module.scss';

class ListItem extends React.Component {
  render() {
    const CustomTag = this.props.article ? 'article' : 'div';
    return (<CustomTag className={`${style.listItem} ${this.props.fullscreen ? style.fullscreen : ''} ${this.props.compact ? style.compact : ''}`}>
      {this.props.children}
    </CustomTag>)
  }
};


ListItem.propTypes = {
  fullscreen: PropTypes.bool,
  article: PropTypes.bool,
  compact: PropTypes.bool
};

ListItem.defaultProps = {
  fullscreen: false,
  article: false,
  compact: false
};

export default ListItem;
