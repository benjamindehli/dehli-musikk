'use client';
// Dependencies
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faLanguage,
    faChevronDown,
    faMusic,
    faPhotoFilm,
    faFilm,
    faCartShopping,
    faGuitar,
    faComments
} from "@fortawesome/free-solid-svg-icons";

// Components
import SearchField from "components/partials/NavigationBar/SearchField";

// Lib
import { useLang } from "lib/LangContext";
import { LANGUAGES } from "lib/i18n";

// Stylesheets
import style from "components/partials/NavigationBar.module.scss";

const NavigationBar = () => {
    const { lang, languageSlug } = useLang();
    const pathname = usePathname();

    // State
    const [showSidebar, setShowSidebar] = useState(false);
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

    const getAlternateLangPath = (targetLang) => {
        if (targetLang === lang) return pathname;
        if (targetLang === 'en') {
            return `/en${pathname}`;
        } else {
            return pathname.replace(/^\/en/, '') || '/';
        }
    };

    const isNavActive = (segment) => pathname.includes(`/${segment}/`);

    return (
        <div className={style.navigationBar}>
            <button
                onClick={handleShowSidebarClick}
                className={style.menuButton}
                aria-label={lang === "en" ? "Show menu" : "Vis meny"}
            >
                <img src="/images/menuIcon.svg" className={style.menuIcon} alt="" aria-hidden="true" />
            </button>

            <SearchField />

            <div className={style.languageSelectorListContainer}>
                <button
                    onClick={handleShowLanguageSelectorList}
                    aria-label={
                        lang === "en"
                            ? "English language is selected. Click to select a different language"
                            : "Norsk språk er valgt. Klikk for å velge et annet språk"
                    }
                >
                    <span className={style.languageSelectorButton}>
                        <FontAwesomeIcon icon={faLanguage} />
                        <span className={style.languageName}>
                            {LANGUAGES[lang]?.name || ""}
                        </span>
                        <FontAwesomeIcon icon={faChevronDown} />
                    </span>
                </button>
                <div
                    ref={languageSelectorListWrapperRef}
                    className={`${style.languageSelectorList} ${showLanguageSelectorList ? style.active : ""}`}
                >
                    <ul>
                        {Object.keys(LANGUAGES).map((langKey) => {
                            const language = LANGUAGES[langKey];
                            const path = getAlternateLangPath(langKey);
                            const isActive = langKey === lang;
                            return (
                                <li key={langKey}>
                                    <a href={path} title={language.name} className={isActive ? style.activeLink : ""}>
                                        {language.name}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
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
                                <img src="/images/DehliMusikkLogoHorizontal.svg" alt="Dehli Musikk logo" />
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
                                <FontAwesomeIcon icon={faMusic} />{" "}
                                {lang === "en" ? "Portfolio" : "Portefølje"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}posts/`}
                                className={isNavActive("posts") ? style.activeLink : undefined}
                                title={lang === "en" ? "Posts" : "Innlegg"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={faPhotoFilm} />{" "}
                                {lang === "en" ? "Posts" : "Innlegg"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}videos/`}
                                className={isNavActive("videos") ? style.activeLink : undefined}
                                title={lang === "en" ? "Videos" : "Videoer"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={faFilm} />{" "}
                                {lang === "en" ? "Videos" : "Videoer"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}products/`}
                                className={isNavActive("products") ? style.activeLink : undefined}
                                title={lang === "en" ? "Products" : "Produkter"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={faCartShopping} />{" "}
                                {lang === "en" ? "Products" : "Produkter"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}equipment/`}
                                className={isNavActive("equipment") ? style.activeLink : undefined}
                                title={lang === "en" ? "Equipment" : "Utstyr"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={faGuitar} />{" "}
                                {lang === "en" ? "Equipment" : "Utstyr"}
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${languageSlug}frequently-asked-questions/`}
                                className={isNavActive("frequently-asked-questions") ? style.activeLink : undefined}
                                title={lang === "en" ? "Frequently Asked Questions" : "Ofte stilte spørsmål"}
                                onClick={hideSidebar}
                            >
                                <FontAwesomeIcon icon={faComments} />{" "}
                                {lang === "en" ? "FAQ" : "FAQ"}
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>
        </div>
    );
};

export default NavigationBar;
