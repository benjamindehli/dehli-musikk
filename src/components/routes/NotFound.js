// Dependencies
import React from 'react';
import { Helmet } from 'react-helmet-async';

// Stylesheets
import style from 'components/routes/NotFound.module.scss';

const NotFound = () => {
  return (<div className={style.contentSection}>
    <Helmet>
      <title>404 - Siden finnes ikke - Dehli Musikk</title>
      <meta name="prerender-status-code" content="404" />
    </Helmet>
    <h1>404 - Siden finnes ikke</h1>
  </div>)
}

export default NotFound;
