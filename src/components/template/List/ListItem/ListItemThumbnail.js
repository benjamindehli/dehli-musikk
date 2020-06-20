// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemThumbnail.module.scss';

class ListItemThumbnail extends React.Component {
  renderContent(link, children) {
    const childElements = (
      <figure className={`${style.listItemThumbnail} ${this.props.fullscreen ? style.fullscreen : ''} ${this.props.compact ? style.compact : ''}`}>
        <picture>{children}</picture>
      </figure>
    );
    return this.props.link && !this.props.fullscreen
      ? (<Link to={link.to} title={link.title}>{childElements}</Link>)
      : childElements;

  }
  render() {
    return this.renderContent(this.props.link, this.props.children);
  }
};

ListItemThumbnail.propTypes = {
  fullscreen: PropTypes.bool,
  compact: PropTypes.bool,
  link: PropTypes.exact({
    to: PropTypes.string,
    title: PropTypes.string
  })
};

ListItemThumbnail.defaultProps = {
  fullscreen: false,
  compact: false
};

export default ListItemThumbnail;
