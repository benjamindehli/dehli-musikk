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
import { useModalState } from "lib/ModalContext";
import { LANGUAGES } from "lib/i18n";

// Stylesheets
import style from "components/partials/NavigationBar.module.scss";

const NavigationBar = () => {
    const { lang, languageSlug } = useLang();
    const { isModalOpen } = useModalState();
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

    /*
     * Every page already declares its counterpart in the other language: the same
     * buildAlternates call that feeds hreflang puts the exact URL in the document
     * head. Reading it there means the switcher does not have to know how each
     * route builds its slug, and the visible link can never disagree with what
     * hreflang tells crawlers.
     */
    const [alternatePaths, setAlternatePaths] = useState({});

    useEffect(() => {
        const paths = {};
        document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((link) => {
            const hreflang = link.getAttribute('hreflang');
            const href = link.getAttribute('href');
            if (!hreflang || hreflang === 'x-default' || !href) return;
            try {
                // Keep it a path so Link still navigates client side
                paths[hreflang] = new URL(href).pathname;
            } catch {
                // A malformed href is not worth breaking the switcher over
            }
        });
        setAlternatePaths(paths);
    }, [pathname]);

    // Posts and videos build their slug from the translated title, so the slug
    // itself differs between languages and swapping the /en prefix cannot produce
    // a path that exists. Every other section uses a language-independent slug.
    const translatedSlugSections = ['posts', 'videos'];

    const getAlternateLangPath = (targetLang) => {
        if (targetLang === lang) return pathname;

        const declaredPath = alternatePaths[targetLang];
        if (declaredPath) return declaredPath;

        /*
         * Only reached before hydration, or if a page declares no alternate.
         * Swapping the prefix is correct wherever the slug is language
         * independent; for a post or video it would 404, so offer that section's
         * list in the target language rather than a broken link.
         */
        const pathWithoutLang = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
        const [, section, slug] = pathWithoutLang.split('/');
        const targetPrefix = targetLang === 'en' ? '/en' : '';

        if (slug && translatedSlugSections.includes(section)) {
            return `${targetPrefix}/${section}/`;
        }
        return `${targetPrefix}${pathWithoutLang}`;
    };

    const isNavActive = (segment) => pathname.includes(`/${segment}/`);

    return (
        // The modal overlay paints over the navigation bar, so clicks already
        // cannot reach it while a modal is open. inert makes keyboard focus and
        // screen readers agree, instead of landing on links behind the overlay.
        <div className={style.navigationBar} inert={isModalOpen}>
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
                                <img src="/images/DehliMusikkLogoHorizontal.svg" alt="Dehli Musikk logo" width="680" height="112" />
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
