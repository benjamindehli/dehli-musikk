// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Stylesheets
import style from './Footer.module.scss';

class Footer extends Component {

  componentDidMount() {}

  render() {
    return (<div className={style.footer}>
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
