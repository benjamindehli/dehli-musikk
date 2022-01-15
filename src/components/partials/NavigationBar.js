// Dependencies
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import SearchField from 'components/partials/NavigationBar/SearchField';

// Assets
import { ReactComponent as DehliMusikkLogo } from 'assets/svg/DehliMusikkLogoHorizontal.svg'
import { ReactComponent as MenuIcon } from 'assets/svg/menuIcon.svg'

// Actions
import { updateMultilingualRoutes } from 'actions/LanguageActions';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Stylesheets
import style from 'components/partials/NavigationBar.module.scss';

const NavigationBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  // Redux store
  const availableLanguages = useSelector(state => state.availableLanguages);
  const multilingualRoutes = useSelector(state => state.multilingualRoutes);
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  // State
  const [showSidebar, setShowSidebar] = useState();
  const [hidingSidebar, setHidingSidebar] = useState(false);
  const [showLanguageSelectorList, setShowLanguageSelectorList] = useState(false);

  // Refs
  const sidebarWrapperRef = useRef();
  const languageSelectorListWrapperRef = useRef();


  const handleShowSidebarClick = () => {
    setShowSidebar(true);
  }

  const hideSidebar = () => {
    setHidingSidebar(true);
    setTimeout(() => {
      setShowSidebar(false);
      setHidingSidebar(false);
    }, 225);
  }

  useEffect(() => {
    const handleClickOutsideSidebar = (event) => {
      if (sidebarWrapperRef.current && !sidebarWrapperRef.current.contains(event.target) && showSidebar) {
        hideSidebar();
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSidebar);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideSidebar);
    };
  }, [sidebarWrapperRef, showSidebar]);


  const handleShowLanguageSelectorList = () => {
    setShowLanguageSelectorList(true);
  }

  const hideLanguageSelectorList = () => {
    setShowLanguageSelectorList(false);
  }

  useEffect(() => {
    const handleClickOutsideLanguageSelectorList = (event) => {
      if (languageSelectorListWrapperRef.current && !languageSelectorListWrapperRef.current.contains(event.target) && showLanguageSelectorList) {
        hideLanguageSelectorList();
      }
    }
    document.addEventListener("mousedown", handleClickOutsideLanguageSelectorList);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideLanguageSelectorList);
    };
  }, [languageSelectorListWrapperRef, showLanguageSelectorList]);


  const renderLanguageSelectorButton = (availableLanguages, selectedLanguageKey) => {
    const hasAvailableLanguages = availableLanguages && Object.keys(availableLanguages).length;
    if (hasAvailableLanguages) {
      const selectedLanguage = availableLanguages[selectedLanguageKey];
      return (
        <span className={style.languageSelectorButton}>
          <FontAwesomeIcon icon={['fas', 'language']} />
          <span className={style.languageName}>{selectedLanguage && selectedLanguage.name ? selectedLanguage.name : ''}</span>
          <FontAwesomeIcon icon={['fas', 'chevron-down']} />
        </span>);
    } else
      return '';
  }

  const renderLanguageSelectorList = (availableLanguages, multilingualRoutes, selectedLanguageKey) => {
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

  useEffect(() => {
    dispatch(updateMultilingualRoutes(location, availableLanguages))
  }, [dispatch, location, availableLanguages])


  return (
    <div className={style.navigationBar}>
      <button onClick={handleShowSidebarClick} className={style.menuButton} aria-label={selectedLanguageKey === 'en' ? 'Show menu' : 'Vis meny'}>
        <MenuIcon className={style.menuIcon} />
      </button>

      <SearchField />

      <div className={style.languageSelectorListContainer}>
        <button onClick={handleShowLanguageSelectorList} aria-label={selectedLanguageKey === 'en' ? 'Select language' : 'Velg språk'}>
          {renderLanguageSelectorButton(availableLanguages, selectedLanguageKey)}
        </button>
        <div ref={languageSelectorListWrapperRef} className={`${style.languageSelectorList} ${showLanguageSelectorList
          ? style.active
          : ''}`}>
          {renderLanguageSelectorList(availableLanguages, multilingualRoutes, selectedLanguageKey)}
        </div>
      </div>

      <div className={`${style.sidebarOverlay} ${showSidebar
        ? style.active
        : ''} ${hidingSidebar
          ? style.hidingSidebar
          : ''} `}>
        <div ref={sidebarWrapperRef} className={style.sidebarContent}>
          <div className={style.sidebarContentHeader}>
            <Link to={`/${languageSlug}`} aria-label='Link to Dehli Musikk home page' title='Link to Dehli Musikk home page'>
              <span className={style.appLogo}>
                <DehliMusikkLogo />
              </span>
            </Link>
          </div>
          <ul className={style.sidebarLinks}>
            <li>
              <NavLink to={`/${languageSlug}portfolio/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}>
                <FontAwesomeIcon icon={['fas', 'music']} /> {selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/${languageSlug}posts/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}>
                <FontAwesomeIcon icon={['fas', 'photo-video']} /> {selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/${languageSlug}videos/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Videos' : 'Videoer'}>
                <FontAwesomeIcon icon={['fas', 'film']} /> {selectedLanguageKey === 'en' ? 'Videos' : 'Videoer'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/${languageSlug}products/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Products' : 'Produkter'}>
                <FontAwesomeIcon icon={['fas', 'shopping-cart']} /> {selectedLanguageKey === 'en' ? 'Products' : 'Produkter'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/${languageSlug}equipment/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Equipment' : 'Utstyr'}>
                <FontAwesomeIcon icon={['fas', 'guitar']} /> {selectedLanguageKey === 'en' ? 'Equipment' : 'Utstyr'}
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default NavigationBar;
