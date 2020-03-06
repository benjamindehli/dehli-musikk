// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Assets
import map930Webp from 'assets/images/map_930.webp';
import map930Jpg from 'assets/images/map_930.jpg';

// Stylesheets
import style from 'components/partials/Footer.module.scss';

class Footer extends Component {

  render() {
    return (<div className={style.footer}>
      <div className={style.contentSection}>
        <div className={style.grid}>
          <div className={style.textSection}>
            <h2>Kontakt</h2>
            <address className={style.addressContent}>
              <ul>
                <li>Benjamin Dehli</li>
                <li>Margretes veg 15</li>
                <li>3804 Bø i Telemark, Norway</li>
                <li>
                  <a href="mailto:superelg@gmail.com" title="Send email to Dehli Musikk">superelg@gmail.com</a>
                </li>
                <li>
                  <a href="tel:+4792292719" title="Call Dehli Musikk">(47) 922 92 719</a>
                </li>
              </ul>
            </address>
          </div>
          <div className={style.mapSection}>
            <a href='https://g.page/dehli-musikk?share' title='Location for Dehli Musikk in Google Maps' aria-label='Location for Dehli Musikk in Google Maps' target='_blank' rel="noopener noreferrer">
              <figure className={style.map}>
                <picture>
                  <source srcSet={`${map930Webp} 930w`} type="image/webp"/>
                  <source srcSet={`${map930Jpg} 930w`} type="image/jpg"/>
                  <img src={map930Jpg} alt="Location for Dehli Musikk"/>
                </picture>
              </figure>
            </a>
          </div>
        </div>
      </div>
      <div className={style.contentSection}>
        <span>
          © 2019 Dehli Musikk
        </span>
      </div>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Footer);
