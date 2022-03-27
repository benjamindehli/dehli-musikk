// Dependencies
import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Assets
import { ReactComponent as DehliMusikkLogo } from 'assets/svg/DehliMusikkLogoInverseHorizontal.svg'
import { ReactComponent as MenuIcon } from 'assets/svg/menuIcon.svg'


// Stylesheets
import style from 'components/partials/NavigationBar.module.scss';

const NavigationBar = () => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)

  // State
  const [showSidebar, setShowSidebar] = useState();
  const [hidingSidebar, setHidingSidebar] = useState(false);

  // Refs
  const sidebarWrapperRef = useRef();


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



  return (
    <div className={style.navigationBar}>
      <button onClick={handleShowSidebarClick} className={style.menuButton} aria-label={selectedLanguageKey === 'en' ? 'Show menu' : 'Vis meny'}>
        <MenuIcon className={style.menuIcon} />
      </button>
      <div className={`${style.sidebarOverlay} ${showSidebar
        ? style.active
        : ''} ${hidingSidebar
          ? style.hidingSidebar
          : ''} `}>
        <div ref={sidebarWrapperRef} className={style.sidebarContent}>
          <div className={style.sidebarContentHeader}>
            <Link to={`/`} aria-label='Link to Dehli Musikk home page' title='Link to Dehli Musikk home page'>
              <span className={style.appLogo}>
                <DehliMusikkLogo />
              </span>
            </Link>
          </div>
          <ul className={style.sidebarLinks}>
            <li>
              <NavLink to={`/portfolio/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}>
                <FontAwesomeIcon icon={['fas', 'music']} /> {selectedLanguageKey === 'en' ? 'Portfolio' : 'Portefølje'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/posts/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}>
                <FontAwesomeIcon icon={['fas', 'photo-video']} /> {selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/videos/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Videos' : 'Videoer'}>
                <FontAwesomeIcon icon={['fas', 'film']} /> {selectedLanguageKey === 'en' ? 'Videos' : 'Videoer'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/products/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Products' : 'Produkter'}>
                <FontAwesomeIcon icon={['fas', 'shopping-cart']} /> {selectedLanguageKey === 'en' ? 'Products' : 'Produkter'}
              </NavLink>
            </li>
            <li>
              <NavLink to={`/equipment/`} className={({ isActive }) => isActive ? style.activeLink : undefined} title={selectedLanguageKey === 'en' ? 'Equipment' : 'Utstyr'}>
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
