// Dependencies
import React from 'react';

// Stylesheets
import style from 'components/partials/Footer.module.scss';

const year = new Date().getFullYear();

const Footer = ({ lang }) => {
  return (<footer className={style.footer}>
    <div className={style.contentSection}>
      © {year} Dehli Musikk
    </div>
  </footer>)
}

export default Footer;
