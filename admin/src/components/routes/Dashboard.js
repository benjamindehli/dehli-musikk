// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import { Link } from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';

class Dashboard extends Component {
  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Dashboard</h1>
      <div>
      <Link to="/posts/"><FontAwesomeIcon icon={['fas', 'photo-video']}/> Posts <span>{this.props.posts.length}</span></Link>
      </div>
      <FontAwesomeIcon icon={['fas', 'music']}/>
    </div>)
  }
}

const mapStateToProps = state => ({ posts: state.posts });


export default connect(mapStateToProps, null)(Dashboard);
