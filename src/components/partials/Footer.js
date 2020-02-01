// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Stylesheets
import style from 'components/partials/Footer.module.scss';

class Footer extends Component {

  render() {
    const mapSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2028.2397254204238!2d9.082164416109066!3d59.44575370872419!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46474b358bd48fdb%3A0xb904a39178048510!2sDehli%20Musikk!5e0!3m2!1sno!2sno!4v1580048325174!5m2!1sno!2sno';
    return (<div className={style.footer}>
      <div className={style.contentSection}>
        <div className={style.grid}>
          <div>
            <h2>Kontakt</h2>
            <address className={style.addressContent}>
              <ul>
                <li>Benjamin Dehli</li>
                <li>Margretes veg 15</li>
                <li>3804 Bø i Telemark, Norway</li>
                <li>
                  <a href="mailto:superelg@gmail.com">superelg@gmail.com</a>
                </li>
                <li>
                  <a href="tel:+4792292719">(47) 922 92 719</a>
                </li>
              </ul>
            </address>
          </div>
          <div>
            <iframe src={mapSrc} title="Location for Dehli Musikk" width="400" height="300" frameBorder="0"></iframe>
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
