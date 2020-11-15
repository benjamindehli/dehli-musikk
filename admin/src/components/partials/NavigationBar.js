// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, NavLink} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Assets
import {ReactComponent as DehliMusikkLogo} from 'assets/svg/DehliMusikkLogoInverseHorizontal.svg'
import {ReactComponent as MenuIcon} from 'assets/svg/menuIcon.svg'

// Stylesheets
import style from 'components/partials/NavigationBar.module.scss';

class NavigationBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showSidebar: false,
      hidingSidebar: false,
      showLanguageSelectorList: false
    };
    this.setSidebarWrapperRef = this.setSidebarWrapperRef.bind(this);
    this.setLanguageSelectorListWrapperRef = this.setLanguageSelectorListWrapperRef.bind(this);
    this.handleClickOutsideSidebar = this.handleClickOutsideSidebar.bind(this);
    this.handleClickOutsideLanguageSelectorList = this.handleClickOutsideLanguageSelectorList.bind(this);
    this.keyDownFunction = this.keyDownFunction.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutsideSidebar);
    document.addEventListener('mousedown', this.handleClickOutsideLanguageSelectorList);
    document.addEventListener("keydown", this.keyDownFunction, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutsideSidebar);
    document.removeEventListener('mousedown', this.handleClickOutsideLanguageSelectorList);
    document.removeEventListener("keydown", this.keyDownFunction, false);
  }

  componentDidUpdate(prevProps){
    if (prevProps.location.pathname !== this.props.location.pathname){
      if (this.state.showSidebar){
        this.hideSidebar();
      }
    }
  }

  setSidebarWrapperRef(node) {
    this.sidebarWrapperRef = node;
  }

  setLanguageSelectorListWrapperRef(node) {
    this.languageSelectorListWrapperRef = node;
  }

  keyDownFunction(event){
    switch (event.keyCode) {
      case 27: // Escape
        if (this.state.showSidebar){
          this.hideSidebar();
        }
        if (this.state.showLanguageSelectorList){
          this.hideLanguageSelectorList();
        }
        break;
      default:
        return null;
    }
  }

  handleShowSidebarClick() {
    this.setState({showSidebar: true});
  }

  handleShowLanguageSelectorList() {
    this.setState({showLanguageSelectorList: true});
  }

  handleClickOutsideSidebar(event) {
    if (this.sidebarWrapperRef && !this.sidebarWrapperRef.contains(event.target) && this.state.showSidebar) {
      this.hideSidebar();
    }
  }

  handleClickOutsideLanguageSelectorList(event) {
    if (this.languageSelectorListWrapperRef && !this.languageSelectorListWrapperRef.contains(event.target) && this.state.showLanguageSelectorList) {
      this.hideLanguageSelectorList();
    }
  }

  hideSidebar() {
    this.setState({hidingSidebar: true});
    setTimeout(function() {
      this.setState({showSidebar: false, hidingSidebar: false});
    }.bind(this), 225);
  }

  hideLanguageSelectorList() {
    this.setState({showLanguageSelectorList: false});
  }

  renderLanguageSelectorButton(availableLanguages, selectedLanguageKey) {
    const hasAvailableLanguages = availableLanguages && Object.keys(availableLanguages).length;
    if (hasAvailableLanguages) {
      const selectedLanguage = availableLanguages[selectedLanguageKey];
      return (
        <span className={style.languageSelectorButton}>
          <FontAwesomeIcon icon={['fas', 'language']}/>
          <span className={style.languageName}>{selectedLanguage && selectedLanguage.name ? selectedLanguage.name : ''}</span>
          <FontAwesomeIcon icon={['fas', 'chevron-down']}/>
        </span>);
    } else
      return '';
    }

  renderLanguageSelectorList(availableLanguages, multilingualRoutes, selectedLanguageKey) {
    const hasAvailableLanguages = availableLanguages && Object.keys(availableLanguages).length;
    const hasMultilingualRoutes = multilingualRoutes && Object.keys(multilingualRoutes).length;
    if (hasAvailableLanguages && hasMultilingualRoutes) {
      const languageElements = Object.keys(availableLanguages).map(languageKey => {
        const language = availableLanguages[languageKey];
        const path = multilingualRoutes[languageKey].path;
        const isActive = languageKey === selectedLanguageKey;
        return (<li key={languageKey}>
          <a href={path} title={language.name} className={isActive
              ? style.activeLink
              : ''}>{language.name}</a>
        </li>)
      });
      return (<ul>{languageElements}</ul>);
    } else {
      return '';
    }
  }

  render() {
    return (<div className={style.navigationBar}>
      <button onClick={() => this.handleShowSidebarClick()} className={style.menuButton} aria-label={this.props.selectedLanguageKey === 'en' ? 'Show menu' : 'Vis meny'}>
        <MenuIcon className={style.menuIcon}/>
      </button>
      <div className={`${style.sidebarOverlay} ${this.state.showSidebar
          ? style.active
          : ''} ${this.state.hidingSidebar
            ? style.hidingSidebar
            : ''} `}>
        <div ref={this.setSidebarWrapperRef} className={style.sidebarContent}>
          <div className={style.sidebarContentHeader}>
            <Link to={`/`} aria-label='Link to Dehli Musikk home page' title='Link to Dehli Musikk home page'>
              <span className={style.appLogo}>
                <DehliMusikkLogo alt="Dehli Musikk logo"/>
              </span>
            </Link>
          </div>
          <ul className={style.sidebarLinks}>
            <li>
              <NavLink to={`/portfolio/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}>
                <FontAwesomeIcon icon={['fas', 'music']}/> {this.props.selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/posts/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}>
                <FontAwesomeIcon icon={['fas', 'photo-video']}/> {this.props.selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/videos/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Videos' : 'Videoer'}>
                <FontAwesomeIcon icon={['fas', 'film']}/> {this.props.selectedLanguageKey === 'en' ? 'Videos' : 'Videoer'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/products/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Products' : 'Produkter'}>
                <FontAwesomeIcon icon={['fas', 'shopping-cart']}/> {this.props.selectedLanguageKey === 'en' ? 'Products' : 'Produkter'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/equipment/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Equipment' : 'Utstyr'}>
                <FontAwesomeIcon icon={['fas', 'guitar']}/> {this.props.selectedLanguageKey === 'en' ? 'Equipment' : 'Utstyr'}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>)
  }
}

const mapStateToProps = state => ({
  availableLanguages: state.availableLanguages,
  multilingualRoutes: state.multilingualRoutes,
  selectedLanguageKey: state.selectedLanguageKey,
  location: state.router.location
});

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
