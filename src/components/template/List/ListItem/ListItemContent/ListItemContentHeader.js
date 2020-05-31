// Dependencies
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader.module.scss';

class ListItemContentHeader extends React.Component {
  renderContent(link, children) {
    return this.props.link && !this.props.fullscreen
      ? (<Link to={link.to} title={link.title}>{children}</Link>)
      : children
  }
  render() {
    return (<header className={`${style.listItemContentHeader} ${this.props.fullscreen ? style.fullscreen : ''}`}>
      {this.renderContent(this.props.link, this.props.children)}
    </header>)
  }
};

ListItemContentHeader.propTypes = {
  fullscreen: PropTypes.bool,
  link: PropTypes.exact({
    to: PropTypes.string,
    title: PropTypes.string
  })
};

ListItemContentHeader.defaultProps = {
  fullscreen: false
};

export default ListItemContentHeader;
