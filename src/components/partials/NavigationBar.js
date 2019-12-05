// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';

// Assets
import {ReactComponent as DehliMusikkLogo} from '../../assets/svg/DehliMusikkLogoHorizontal.svg'
import {ReactComponent as MenuIcon} from '../../assets/svg/menuIcon.svg'

// Stylesheets
import style from './NavigationBar.module.scss';

class NavigationBar extends Component {

  render() {
    return (<div className={style.navigationBar}>
      <span className={style.menuButton}>
        <MenuIcon className={style.menuIcon}/>
      </span>
      <Link to='/' aria-label='Link to Dehli Musikk home page'>
        <span className={style.appLogo}>
          <DehliMusikkLogo alt="Dehli Musikk logo"/>
        </span>
      </Link>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
