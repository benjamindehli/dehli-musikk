// Dependencies
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Components
import SearchField from "components/partials/NavigationBar/SearchField";

// Assets
import { ReactComponent as DehliMusikkLogo } from "assets/svg/DehliMusikkLogoHorizontal.svg";
import { ReactComponent as MenuIcon } from "assets/svg/menuIcon.svg";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Stylesheets
import style from "components/partials/NavigationBar.module.scss";

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
                            href={`/${languageSlug}`}
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
                            <Link
                                href={`/${languageSlug}portfolio/`}
                                className={isNavActive("portfolio") ? style.activeLink : undefined}
                                title={lang === "en" ? "Portfolio" : "Portefølje"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "music"]} />{" "}
                                {selectedLanguageKey === "en" ? "Portfolio" : "Portefølje"}
                            </NavLink>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}posts/`}
                                className={isNavActive("posts") ? style.activeLink : undefined}
                                title={lang === "en" ? "Posts" : "Innlegg"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "photo-video"]} />{" "}
                                {selectedLanguageKey === "en" ? "Posts" : "Innlegg"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}videos/`}
                                className={isNavActive("videos") ? style.activeLink : undefined}
                                title={lang === "en" ? "Videos" : "Videoer"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "film"]} />{" "}
                                {selectedLanguageKey === "en" ? "Videos" : "Videoer"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}products/`}
                                className={isNavActive("products") ? style.activeLink : undefined}
                                title={lang === "en" ? "Products" : "Produkter"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "shopping-cart"]} />{" "}
                                {selectedLanguageKey === "en" ? "Products" : "Produkter"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}equipment/`}
                                className={isNavActive("equipment") ? style.activeLink : undefined}
                                title={lang === "en" ? "Equipment" : "Utstyr"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "guitar"]} />{" "}
                                {selectedLanguageKey === "en" ? "Equipment" : "Utstyr"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}frequently-asked-questions/`}
                                className={isNavActive("frequently-asked-questions") ? style.activeLink : undefined}
                                title={lang === "en" ? "Frequently Asked Questions" : "Ofte stilte spørsmål"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={["fas", "comments"]} />{" "}
                                {selectedLanguageKey === "en" ? "FAQ" : "FAQ"}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    ) : null;
};

export default NavigationBar;
