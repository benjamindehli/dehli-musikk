// Dependencies
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { getSearchResults } from "helpers/search";

// Stylesheets
import style from 'components/partials/NavigationBar/SearchField.module.scss';
import { Link } from "react-router-dom";


const SearchField = () => {

  const navigate = useNavigate();

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  // State
  const [showResultsList, setShowResultsList] = useState();
  const [results, setResults] = useState();

  // Refs
  const resultsListWrapperRef = useRef();


  const handleShowResultsList = (event) => {
    const searchResults = getSearchResults(event.target.value, selectedLanguageKey);
    if (searchResults) {
      setShowResultsList(true);
      setResults(searchResults);
    } else {
      setShowResultsList(false);
    }
  }

  const hideResultsList = () => {
    setShowResultsList(false);
  }

  useEffect(() => {
    const handleClickOutsideResultsList = (event) => {
      if (resultsListWrapperRef.current && !resultsListWrapperRef.current.contains(event.target) && showResultsList) {
        hideResultsList();
      }
    }
    document.addEventListener("mousedown", handleClickOutsideResultsList);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideResultsList);
    };
  }, [resultsListWrapperRef, showResultsList]);

  const handleSubmitSearch = (event) => {
    if (event.key === 'Enter') {
      let searchString = event.target.value.replace(/[^a-å0-9- ]+/ig, ""); // Removes unwanted characters
      searchString = searchString.replace(/\s\s+/g, ' '); // Remove redundant whitespace
      if (searchString.length > 1 && results.length) {
        navigate(`/${languageSlug}search/?q=${searchString}`);
        setShowResultsList(false);
      }
    }
  }

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
    }
    document.addEventListener("mousedown", keyDownFunction);
    return () => {
      document.removeEventListener("mousedown", keyDownFunction);
    };
  }, [showResultsList])


  const renderReleaseThumbnail = (thumbnailPaths, alt) => {
    return (<picture>
      <source sizes='55' srcSet={thumbnailPaths.avif} type="image/avif" />
      <source sizes='55' srcSet={`${thumbnailPaths.webp} 55w`} type="image/webp" />
      {thumbnailPaths.jpg ? <source sizes='55' srcSet={`${thumbnailPaths.jpg} 55w`} type="image/jpg" /> : ''}
      {thumbnailPaths.png ? <source sizes='55' srcSet={`${thumbnailPaths.png} 55w`} type="image/png" /> : ''}
      <img src={thumbnailPaths.jpg ? thumbnailPaths.jpg : thumbnailPaths.png} width='55' height='55' alt={alt} />
    </picture>);
  }


  const renderResultsList = (results, selectedLanguageKey) => {
    if (results && results.length) {
      const itemTypeIcons = {
        post: ['fas', 'photo-video'],
        video: ['fas', 'film'],
        product: ['fas', 'shopping-cart'],
        release: ['fas', 'music'],
        instruments: ['fas', 'guitar'],
        amplifiers: ['fas', 'bullhorn'],
        effects: ['fas', 'sliders-h'],
        faq: ['fas', 'comments']
      };
      const resultsElements = results.map((result, resultKey) => {
        return (<Link onClick={() => hideResultsList()} to={{pathname: result.link, hash: result.hash}} title={result.linkTitle} key={resultKey} className={style.resultsListItem}>
          {result.thumbnailPaths && result.thumbnailDescription ? renderReleaseThumbnail(result.thumbnailPaths, result.thumbnailDescription) : ''}
          <span className={style.resultsListItemText}>{result.text}</span>
          <span className={`${style.resultsListItemTypeLabel} ${style[result.type]}`}><span><FontAwesomeIcon icon={itemTypeIcons[result.type]} /> {result.label}</span></span>
        </Link>)
      });
      return resultsElements;
    } else {
      return (<span className={style.resultsListItem}>{selectedLanguageKey === 'en' ? 'No results' : 'Ingen resultat'}</span>);
    }
  }


  return (<React.Fragment>
    <div className={style.searchFieldContainer}>
      <FontAwesomeIcon icon={['fas', 'search']} />
      <label htmlFor="search" className={style.hidden}>{selectedLanguageKey === 'en' ? 'Search' : 'Søk'}</label>
      <input type="search"
        autoComplete="off"
        id="search"
        aria-label={selectedLanguageKey === 'en' ? 'Search' : 'Søk'}
        onChange={handleShowResultsList}
        onKeyUp={handleSubmitSearch}
        placeholder={selectedLanguageKey === 'en' ? 'Search' : 'Søk'}
        className={style.searchField} />
    </div>
    <div className={`${style.resultsListContainer} ${showResultsList
      ? style.active
      : ''}`}>
      <div ref={resultsListWrapperRef} className={style.resultsList}>
        {renderResultsList(results, selectedLanguageKey)}
      </div>
    </div>
  </React.Fragment>)
}


export default SearchField
