// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import Sitemaps from 'components/partials/Sitemaps';
import Feeds from 'components/partials/Feeds';

// Stylesheets
import style from 'components/routes/Dashboard.module.scss';

const Dashboard = () => {

  // Redux store
  const releases = useSelector(state => state.releases);
  const posts = useSelector(state => state.posts);
  const videos = useSelector(state => state.videos);


  return (<div className={style.contentSection}>
    <h1>Dashboard</h1>
    <h2>Items</h2>
    <div className={style.grid}>
      <Link to="/portfolio/" className={style.gridItem}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'music']} size="3x" />
          <span className={style.gridItemIconBadge}>{releases.length}</span>
        </span>
        <span className={style.gridItemName}>Portfolio</span>
      </Link>
      <Link to="/posts/" className={style.gridItem}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'photo-video']} size="3x" />
          <span className={style.gridItemIconBadge}>{posts.length}</span>
        </span>
        <span className={style.gridItemName}>Posts</span>
      </Link>
      <Link to="/videos/" className={style.gridItem}>
        <span className={style.gridItemIcon}>
          <FontAwesomeIcon icon={['fas', 'film']} size="3x" />
          <span className={style.gridItemIconBadge}>{videos.length}</span>
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

export default Dashboard;
