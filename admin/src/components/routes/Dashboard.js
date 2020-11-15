// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';

class Dashboard extends Component {
  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Dashboard</h1>
    </div>)
  }
}

export default connect(null, null)(Dashboard);
