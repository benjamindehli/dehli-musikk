import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

import style from './Breadcrumbs.module.scss';

export class Breadcrumb extends Component {

  renderBreadcrumb() {
    return (<div className={style.breadCrumb}>
      <ul>
        <li>
          <Link to={'/'}>Dehli Musikk</Link>
        </li>
        <li>
          <span>{this.props.pageTitle}</span>
        </li>
      </ul>
    </div>)
  }

  render() {
    return this.renderBreadcrumb()
  }
}

Breadcrumb.propTypes = {
  pageTitle: PropTypes.string
};

export default connect(null, null)(Breadcrumb);
