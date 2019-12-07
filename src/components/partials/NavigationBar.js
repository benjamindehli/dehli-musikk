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
  constructor(props) {
    super(props);
    this.state = {
      showSidebar: false,
      hidingSidebar: false
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleShowSidebarClick() {
    this.setState({showSidebar: true});
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target) && this.state.showSidebar) {
      this.hideSidebar();
    }
  }

  hideSidebar() {
    this.setState({hidingSidebar: true});
    setTimeout(function() {
      this.setState({showSidebar: false, hidingSidebar: false});
    }.bind(this), 225);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  render() {
    return (<div className={style.navigationBar}>
      <span onClick={() => this.handleShowSidebarClick()} className={style.menuButton}>
        <MenuIcon className={style.menuIcon}/>
      </span>
      <div className={`${style.sidebarOverlay} ${this.state.showSidebar
          ? style.active
          : ''} ${this.state.hidingSidebar
            ? style.hidingSidebar
            : ''} `}>
        <div ref={this.setWrapperRef} className={style.sidebarContent}>
          <div className={style.sidebarContentHeader}>
            <Link to='/' aria-label='Link to Dehli Musikk home page'>
              <span className={style.appLogo}>
                <DehliMusikkLogo alt="Dehli Musikk logo"/>
              </span>
            </Link>
          </div>
          Sidebar
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
