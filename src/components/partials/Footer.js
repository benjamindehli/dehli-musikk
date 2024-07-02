// Dependencies
import React from 'react';

// Assets
import map930Avif from 'assets/images/map_930.avif';
import map930Webp from 'assets/images/map_930.webp';
import map930Jpg from 'assets/images/map_930.jpg';

// Stylesheets
import style from 'components/partials/Footer.module.scss';

// Redux store
const selectedLanguageKey = window?.location?.pathname?.startsWith('/en/') ? 'en' : 'no';

const Footer = () => {
  return (<footer id="contact" className={style.footer}>
    <div className={style.contentSection}>
      <div className={style.grid}>
        <div className={style.textSection}>
          <h2>{selectedLanguageKey === "en" ? "Contact" : "Kontakt"}</h2>
          <address className={style.addressContent}>
            <ul id="hcard-Benjamin-Dehli" className="vcard">
              <li className="fn n">
                <span className="given-name">Benjamin</span> <span className="family-name">Dehli</span>
              </li>
              <li>
                <a className="url" href="https://www.dehlimusikk.no/">
                  <span className="org">Dehli Musikk</span>
                </a>
              </li>
              <li>
                <ul className="adr">
                  <li className="street-address">Margretes veg 15</li>
                  <li><span className="postal-code">3804</span> <span className="locality">Bø i Telemark</span>, <span className="country-name">Norway</span></li>
                </ul>
              </li>
              <li>
                <a className="email" href="mailto:superelg@gmail.com" title="Send email to Dehli Musikk">superelg@gmail.com</a>
              </li>
              <li>
                <a className="tel" href="tel:+4792292719" title="Call Dehli Musikk">(47) 922 92 719</a>
              </li>
            </ul>
          </address>
        </div>
        <div className={style.mapSection}>
          <a href='https://g.page/dehli-musikk?share' title='Location for Dehli Musikk in Google Maps' aria-label='Location for Dehli Musikk in Google Maps' target='_blank' rel="noopener noreferrer">
            <figure className={style.map}>
              <picture>
                <source sizes="100vw" srcSet={`${map930Avif} 930w`} type="image/avif" />
                <source sizes="100vw" srcSet={`${map930Webp} 930w`} type="image/webp" />
                <source sizes="100vw" srcSet={`${map930Jpg} 930w`} type="image/jpg" />
                <img loading="lazy" src={map930Jpg} alt="Location for Dehli Musikk" width="779" height="250" />
              </picture>
            </figure>
          </a>
        </div>
      </div>
    </div>
    <div className={style.contentSection}>
      © 2024 Dehli Musikk
    </div>
  </footer>)
}

export default Footer;
