// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import Sitemaps from 'components/partials/Sitemaps';
import Feeds from 'components/partials/Feeds';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';

class Dashboard extends Component {
  render() {
    return (<div className={style.contentSection}>
      <Helmet>
        <title>Dashboard - Dehli Musikk</title>
      </Helmet>
      <h1>Dashboard</h1>
      <h2>Items</h2>
      <div className={style.grid}>
        <Link to="/portfolio/" className={style.gridItem}>
          <span className={style.gridItemIcon}>
            <FontAwesomeIcon icon={['fas', 'music']} size="3x" />
            <span className={style.gridItemIconBadge}>{this.props.releases.length}</span>
          </span>
          <span className={style.gridItemName}>Portfolio</span>
        </Link>
        <Link to="/posts/" className={style.gridItem}>
          <span className={style.gridItemIcon}>
            <FontAwesomeIcon icon={['fas', 'photo-video']} size="3x" />
            <span className={style.gridItemIconBadge}>{this.props.posts.length}</span>
          </span>
          <span className={style.gridItemName}>Posts</span>
        </Link>
        <Link to="/videos/" className={style.gridItem}>
          <span className={style.gridItemIcon}>
            <FontAwesomeIcon icon={['fas', 'film']} size="3x" />
            <span className={style.gridItemIconBadge}>{this.props.videos.length}</span>
          </span>
          <span className={style.gridItemName}>Videos</span>
        </Link>

      </div>
      <h2>Sitemaps</h2>
      <Sitemaps />
      <h2>Feeds</h2>
      <Feeds />
    </div>)
  }
}

const mapStateToProps = state => (
  {
    releases: state.releases,
    posts: state.posts,
    videos: state.videos
  }
);


export default connect(mapStateToProps, null)(Dashboard);
