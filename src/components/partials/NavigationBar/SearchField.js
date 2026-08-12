'use client';
// Dependencies
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faMagnifyingGlass,
    faPhotoFilm,
    faFilm,
    faCartShopping,
    faMusic,
    faGuitar,
    faBullhorn,
    faSliders,
    faComments
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// Lib
import { useLang } from "lib/LangContext";

// Helpers
import { getSearchResults } from "helpers/search";

// Stylesheets
import style from "components/partials/NavigationBar/SearchField.module.scss";


const SearchField = () => {

    const router = useRouter();
    const { lang, languageSlug } = useLang();

    // State
    const [showResultsList, setShowResultsList] = useState();
    const [results, setResults] = useState();

    // Refs
    const resultsListWrapperRef = useRef();

    const handleShowResultsList = async (event) => {
        const searchResults = await getSearchResults(event.target.value, lang);
        if (searchResults) {
            setShowResultsList(true);
            setResults(searchResults);
        } else {
            setShowResultsList(false);
        }
    };

    const hideResultsList = () => {
        setShowResultsList(false);
    };

    useEffect(() => {
        const handleClickOutsideResultsList = (event) => {
            if (resultsListWrapperRef.current && !resultsListWrapperRef.current.contains(event.target) && showResultsList) {
                hideResultsList();
            }
        };
        document.addEventListener("mousedown", handleClickOutsideResultsList);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsideResultsList);
        };
    }, [resultsListWrapperRef, showResultsList]);

    const handleSubmitSearch = (event) => {
        if (event.key === "Enter") {
            let searchString = event.target.value.replace(/[^a-å0-9- ]+/ig, "");
            searchString = searchString.replace(/\s\s+/g, " ");
            if (searchString.length > 1 && results.length) {
                router.push(`/${languageSlug}search/?q=${searchString}`);
                setShowResultsList(false);
            }
        }
    };

    useEffect(() => {
        const keyDownFunction = (event) => {
            switch (event.keyCode) {
                case 27: // Escape
                    if (showResultsList) {
                        hideResultsList();
                    }
                    break;
                default:
                    return null;
            }
        };
        document.addEventListener("keydown", keyDownFunction);
        return () => {
            document.removeEventListener("keydown", keyDownFunction);
        };
    }, [showResultsList]);

    // The box is a fixed 55px, so the candidates vary by pixel ratio rather than
    // by layout width: x descriptors, and no sizes attribute to get wrong.
    const renderReleaseThumbnail = (thumbnailPaths, alt) => {
        return (
            <picture>
                <source srcSet={`${thumbnailPaths.avif} 1x, ${thumbnailPaths.avif110} 2x`} type="image/avif" />
                <source srcSet={`${thumbnailPaths.webp} 1x, ${thumbnailPaths.webp110} 2x`} type="image/webp" />
                {thumbnailPaths.jpg ? <source srcSet={`${thumbnailPaths.jpg} 1x, ${thumbnailPaths.jpg110} 2x`} type="image/jpeg" /> : ""}
                {thumbnailPaths.png ? <source srcSet={`${thumbnailPaths.png} 1x, ${thumbnailPaths.png110} 2x`} type="image/png" /> : ""}
                <img src={thumbnailPaths.jpg ? thumbnailPaths.jpg : thumbnailPaths.png} width="55" height="55" alt={alt} />
            </picture>
        );
    };

    const itemTypeIcons = {
        post: faPhotoFilm,
        video: faFilm,
        product: faCartShopping,
        release: faMusic,
        instruments: faGuitar,
        amplifiers: faBullhorn,
        effects: faSliders,
        faq: faComments
    };

    const renderResultsList = (results, lang) => {
        if (results && results.length) {
            const resultsElements = results.map((result, resultKey) => {
                const href = result.hash ? `${result.link}${result.hash}` : result.link;
                return (
                    <Link
                        onClick={() => hideResultsList()}
                        href={href}
                        title={result.linkTitle}
                        key={resultKey}
                        className={style.resultsListItem}
                    >
                        {result.thumbnailPaths && result.thumbnailDescription
                            ? renderReleaseThumbnail(result.thumbnailPaths, result.thumbnailDescription)
                            : ""}
                        <span className={style.resultsListItemText}>{result.text}</span>
                        <span className={`${style.resultsListItemTypeLabel} ${style[result.type]}`}>
                            <span>
                                <FontAwesomeIcon icon={itemTypeIcons[result.type]} /> {result.label}
                            </span>
                        </span>
                    </Link>
                );
            });
            return resultsElements;
        } else {
            return (
                <span className={style.resultsListItem}>
                    {lang === "en" ? "No results" : "Ingen resultat"}
                </span>
            );
        }
    };

    return (
        <React.Fragment>
            <div className={style.searchFieldContainer}>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                <label htmlFor="search" className={style.hidden}>
                    {lang === "en" ? "Search" : "Søk"}
                </label>
                <input
                    type="search"
                    autoComplete="off"
                    id="search"
                    aria-label={lang === "en" ? "Search" : "Søk"}
                    onChange={handleShowResultsList}
                    onKeyUp={handleSubmitSearch}
                    placeholder={lang === "en" ? "Search" : "Søk"}
                    className={style.searchField}
                />
            </div>
            <div className={`${style.resultsListContainer} ${showResultsList ? style.active : ""}`}>
                <div ref={resultsListWrapperRef} className={style.resultsList}>
                    {renderResultsList(results, lang)}
                </div>
            </div>
        </React.Fragment>
    );
};

export default SearchField;
