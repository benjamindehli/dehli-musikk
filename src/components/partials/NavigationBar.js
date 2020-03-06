// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, NavLink} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Assets
import {ReactComponent as DehliMusikkLogo} from 'assets/svg/DehliMusikkLogoHorizontal.svg'
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
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutsideSidebar);
    document.addEventListener('mousedown', this.handleClickOutsideLanguageSelectorList);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutsideSidebar);
    document.removeEventListener('mousedown', this.handleClickOutsideLanguageSelectorList);
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
      return (<span className={style.languageSelectorButton}><FontAwesomeIcon icon={['fas', 'language']}/> {selectedLanguage && selectedLanguage.name ? selectedLanguage.name : ''} <FontAwesomeIcon icon={['fas', 'chevron-down']}/></span>);
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
      <span onClick={() => this.handleShowSidebarClick()} className={style.menuButton}>
        <MenuIcon className={style.menuIcon}/>
      </span>
      <div>
        <span onClick={() => this.handleShowLanguageSelectorList()}>{this.renderLanguageSelectorButton(this.props.availableLanguages, this.props.selectedLanguageKey)}</span>
        <div ref={this.setLanguageSelectorListWrapperRef} className={`${style.languageSelectorList} ${this.state.showLanguageSelectorList
            ? style.active
            : ''}`}>
          {this.renderLanguageSelectorList(this.props.availableLanguages, this.props.multilingualRoutes, this.props.selectedLanguageKey)}
        </div>
      </div>
      <div className={`${style.sidebarOverlay} ${this.state.showSidebar
          ? style.active
          : ''} ${this.state.hidingSidebar
            ? style.hidingSidebar
            : ''} `}>
        <div ref={this.setSidebarWrapperRef} className={style.sidebarContent}>
          <div className={style.sidebarContentHeader}>
            <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}`} aria-label='Link to Dehli Musikk home page' title='Link to Dehli Musikk home page'>
              <span className={style.appLogo}>
                <DehliMusikkLogo alt="Dehli Musikk logo"/>
              </span>
            </Link>
          </div>
          <ul className={style.sidebarLinks}>
            <li>
              <NavLink to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}>
                {this.props.selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/`} activeClassName={style.activeLink} title={this.props.selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}>
                {this.props.selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}
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
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
