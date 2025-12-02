// Dependencies
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Components
import SearchField from "./NavigationBar/SearchField";

// Assets
import DehliMusikkLogo from "../../assets/svg/DehliMusikkLogoHorizontal.svg?react";
import MenuIcon from "../../assets/svg/menuIcon.svg?react";

// Selectors
import { getLanguageSlug } from "../../reducers/AvailableLanguagesReducer";

// Stylesheets
import style from "./NavigationBar.module.scss";

const NavigationBar = () => {
    // Redux store
    const availableLanguages = useSelector((state) => state.availableLanguages);
    const multilingualRoutes = useSelector((state) => state.multilingualRoutes);
    const selectedLanguageKey = useSelector((state) => state.selectedLanguageKey);
    const languageSlug = useSelector((state) => getLanguageSlug(state));

    // State
    const [showSidebar, setShowSidebar] = useState();
    const [hidingSidebar, setHidingSidebar] = useState(false);
    const [showLanguageSelectorList, setShowLanguageSelectorList] = useState(false);

    // Refs
    const sidebarWrapperRef = useRef();
    const languageSelectorListWrapperRef = useRef();

    const handleShowSidebarClick = () => {
        setShowSidebar(true);
    };

    const hideSidebar = () => {
        setHidingSidebar(true);
        setTimeout(() => {
            setShowSidebar(false);
            setHidingSidebar(false);
        }, 225);
    };

    useEffect(() => {
        const handleClickOutsideSidebar = (event) => {
            if (sidebarWrapperRef.current && !sidebarWrapperRef.current.contains(event.target) && showSidebar) {
                hideSidebar();
            }
        };
        document.addEventListener("mousedown", handleClickOutsideSidebar);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideSidebar);
        };
    }, [sidebarWrapperRef, showSidebar]);

    const handleShowLanguageSelectorList = () => {
        setShowLanguageSelectorList(true);
    };

    const hideLanguageSelectorList = () => {
        setShowLanguageSelectorList(false);
    };

    useEffect(() => {
        const handleClickOutsideLanguageSelectorList = (event) => {
            if (
                languageSelectorListWrapperRef.current &&
                !languageSelectorListWrapperRef.current.contains(event.target) &&
                showLanguageSelectorList
            ) {
                hideLanguageSelectorList();
            }
        };
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
                    <FontAwesomeIcon icon={["fas", "language"]} />
                    <span className={style.languageName}>
                        {selectedLanguage && selectedLanguage.name ? selectedLanguage.name : ""}
                    </span>
                    <FontAwesomeIcon icon={["fas", "chevron-down"]} />
                </span>
            );
        } else return "";
    };

    const renderLanguageSelectorList = (availableLanguages, multilingualRoutes, selectedLanguageKey) => {
        const hasAvailableLanguages = availableLanguages && Object.keys(availableLanguages).length;
        const hasMultilingualRoutes = multilingualRoutes && Object.keys(multilingualRoutes).length;
        if (hasAvailableLanguages && hasMultilingualRoutes) {
            const languageElements = Object.keys(availableLanguages).map((languageKey) => {
                const language = availableLanguages[languageKey];
                const path = multilingualRoutes[languageKey].path;
                const isActive = languageKey === selectedLanguageKey;
                return (
                    <li key={languageKey}>
                        <a href={path} title={language.name} className={isActive ? style.activeLink : ""}>
                            {language.name}
                        </a>
                    </li>
                );
            });
            return <ul>{languageElements}</ul>;
        } else {
            return "";
        }
    };

    return availableLanguages && multilingualRoutes && selectedLanguageKey ? (
        <div className={style.navigationBar}>
            <button
                onClick={handleShowSidebarClick}
                className={style.menuButton}
                aria-label={selectedLanguageKey === "en" ? "Show menu" : "Vis meny"}
            >
                <MenuIcon className={style.menuIcon} />
            </button>

            <SearchField />

            <div className={style.languageSelectorListContainer}>
                <button
                    onClick={handleShowLanguageSelectorList}
                    aria-label={
                        selectedLanguageKey === "en"
                            ? "English language is selected. Click to select a different language"
                            : "Norsk språk er valgt. Klikk for å velge et annet språk"
                    }
                >
                    {renderLanguageSelectorButton(availableLanguages, selectedLanguageKey)}
                </button>
                <div
                    ref={languageSelectorListWrapperRef}
                    className={`${style.languageSelectorList} ${showLanguageSelectorList ? style.active : ""}`}
                >
                    {renderLanguageSelectorList(availableLanguages, multilingualRoutes, selectedLanguageKey)}
                </div>
            </div>

            <aside
                className={`${style.sidebarOverlay} ${showSidebar ? style.active : ""} ${
                    hidingSidebar ? style.hidingSidebar : ""
                } `}
            >
                <nav ref={sidebarWrapperRef} className={style.sidebarContent}>
                    <div className={style.sidebarContentHeader}>
                        <Link
                            to={`/${languageSlug}`}
                            aria-label="Link to Dehli Musikk home page"
                            title="Link to Dehli Musikk home page"
                            onClick={hideSidebar}
                        >
                            <span className={style.appLogo}>
                                <DehliMusikkLogo />
                            </span>
                        </Link>
                    </div>
                    <ul className={style.sidebarLinks}>
                        <li>
                            <NavLink
                                to={`/${languageSlug}portfolio/`}
                                className={({ isActive }) => (isActive ? style.activeLink : undefined)}
                                title={selectedLanguageKey === "en" ? "Portfolio" : "Portefølje"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "music"]} />{" "}
                                {selectedLanguageKey === "en" ? "Portfolio" : "Portefølje"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${languageSlug}posts/`}
                                className={({ isActive }) => (isActive ? style.activeLink : undefined)}
                                title={selectedLanguageKey === "en" ? "Posts" : "Innlegg"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "photo-video"]} />{" "}
                                {selectedLanguageKey === "en" ? "Posts" : "Innlegg"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${languageSlug}videos/`}
                                className={({ isActive }) => (isActive ? style.activeLink : undefined)}
                                title={selectedLanguageKey === "en" ? "Videos" : "Videoer"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "film"]} />{" "}
                                {selectedLanguageKey === "en" ? "Videos" : "Videoer"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${languageSlug}products/`}
                                className={({ isActive }) => (isActive ? style.activeLink : undefined)}
                                title={selectedLanguageKey === "en" ? "Products" : "Produkter"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "shopping-cart"]} />{" "}
                                {selectedLanguageKey === "en" ? "Products" : "Produkter"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${languageSlug}equipment/`}
                                className={({ isActive }) => (isActive ? style.activeLink : undefined)}
                                title={selectedLanguageKey === "en" ? "Equipment" : "Utstyr"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "guitar"]} />{" "}
                                {selectedLanguageKey === "en" ? "Equipment" : "Utstyr"}
                            </NavLink>
                        </li>
                        <li>
                            <NavLink
                                to={`/${languageSlug}frequently-asked-questions/`}
                                className={({ isActive }) => (isActive ? style.activeLink : undefined)}
                                title={selectedLanguageKey === "en" ? "Frequently Asked Questions" : "Ofte stilte spørsmål"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "comments"]} />{" "}
                                {selectedLanguageKey === "en" ? "FAQ" : "FAQ"}
                            </NavLink>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    ) : null;
};

export default NavigationBar;
