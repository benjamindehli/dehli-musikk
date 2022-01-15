// Dependencies
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import SearchResult from 'components/partials/SearchResult';

// Actions
import { updateSelectedLanguageKey } from 'actions/LanguageActions';
import { updateSearchResults, updateSearchResultsCount } from 'actions/SearchResultsActions';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { getSearchResults } from 'helpers/search';

// Stylesheets
import style from 'components/routes/Search.module.scss';


const Search = () => {

  const location = useLocation();
  const dispatch = useDispatch();
  const params = useParams();
  const navigate = useNavigate();

  const searchQuery = new URLSearchParams(location.search).get('q') || null;
  const searchCategory = new URLSearchParams(location.search).get('category') || 'all';

  const searchCategoryNames = {
    all: { en: 'Show all', no: 'Vis alle' },
    release: { en: 'Releases', no: 'Utgivelser' },
    post: { en: 'Posts', no: 'Innlegg' },
    video: { en: 'Videos', no: 'Videoer' },
    product: { en: 'Products', no: 'Produkter' },
    instruments: { en: 'Instruments', no: 'Instrumenter' },
    effects: { en: 'Effects', no: 'Effekter' },
    amplifiers: { en: 'Amplifiers', no: 'Forsterkere' }
  }

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const searchResults = useSelector(state => state.searchResults)
  const searchResultsCount = useSelector(state => state.searchResultsCount)

  const languageSlug = useSelector(state => getLanguageSlug(state));

  useEffect(() => {
    if (params.selectedLanguage) {
      dispatch(updateSelectedLanguageKey(params.selectedLanguage))
    }
  }, [dispatch, params])

  useEffect(() => {
    if (!searchQuery || searchQuery?.trim().length < 2) {
      navigate("/");
    } else {
      const searchResults = getSearchResults(searchQuery, selectedLanguageKey, searchCategory)
      dispatch(updateSearchResults(searchResults))
      if (searchCategory === 'all') {
        dispatch(updateSearchResultsCount(searchResults));
      }
    }
  }, [dispatch, navigate, searchQuery, selectedLanguageKey, searchCategory])

  const renderSearchResults = (searchResults) => {
    return searchResults.map((searchResult, index) => {
      return (<ListItem compact={true} key={index}>
        <SearchResult searchResult={searchResult} />
      </ListItem>);
    })
  }

  const renderSearchCategoryOptions = (searchCategoryNames, searchResultsCount) => {
    return Object.keys(searchCategoryNames).map(categoryKey => {
      const category = searchCategoryNames[categoryKey];
      const hasSearchResultsCount = Object.keys(searchResultsCount).length;
      const count = searchResultsCount[categoryKey] ? searchResultsCount[categoryKey] : 0;
      const isDisabled = hasSearchResultsCount && !count;
      return <option value={categoryKey} disabled={isDisabled} key={categoryKey}>{category[selectedLanguageKey]}{hasSearchResultsCount ? ` (${count})` : ''}</option>
    })
  }

  const handleSearchCategoryChange = (event) => {
    const value = event?.target?.value;
    const urlParameters = value !== 'all'
      ? `?q=${searchQuery}&category=${value}`
      : `?q=${searchQuery}`
    navigate(`/${languageSlug}search/${urlParameters}`);
  }

  const getMetaDescriptionFromSearchresults = (searchResults, description = '') => {
    if (searchResults && searchResults.length) {
      searchResults.forEach(result => {
        if (description.length < 160) {
          description += `${result.text}${result.excerpt ? ' ' + result.excerpt + ', ' : ', '}`;
        }
      });
    }
    return description.length > 160 ? `${description.substring(0, 160)}` : description;;
  }


  const hasSearchResultsCount = searchResultsCount && Object.keys(searchResultsCount).length;
  const urlParameters = searchQuery
    ? searchCategory !== 'all'
      ? `?q=${searchQuery}&category=${searchCategory}`
      : `?q=${searchQuery}`
    : '';

  const listPage = {
    title: searchQuery?.length
      ? {
        en: searchCategory !== 'all'
          ? `Results for ${searchCategoryNames[searchCategory]['en'].toLowerCase()} with the search term "${searchQuery}" | Dehli Musikk`
          : `All results with the search term "${searchQuery}" | Dehli Musikk`,
        no: searchCategory !== 'all'
          ? `Resultat for ${searchCategoryNames[searchCategory]['no'].toLowerCase()} med søkeordet "${searchQuery}" | Dehli Musikk`
          : `Alle resultater med søkeordet "${searchQuery}" | Dehli Musikk`
      } : {
        en: 'Search for content | Dehli Musikk',
        no: 'Søk etter innhold  | Dehli Musikk'
      },
    heading: searchQuery?.length
      ? {
        en: searchCategory !== 'all'
          ? `Results for ${searchCategoryNames[searchCategory]['en'].toLowerCase()} with the search term "${searchQuery}"`
          : `All results with the search term "${searchQuery}"`,
        no: searchCategory !== 'all'
          ? `Resultat for ${searchCategoryNames[searchCategory]['no'].toLowerCase()} med søkeordet "${searchQuery}"`
          : `Alle resultater med søkeordet "${searchQuery}"`
      } : {
        en: 'Search for content',
        no: 'Søk etter innhold'
      },
    description: searchQuery?.length
      ? {
        en: searchCategory !== 'all'
          ? getMetaDescriptionFromSearchresults(searchResults, `Results for ${searchCategoryNames[searchCategory]['en'].toLowerCase()} with the search term "${searchQuery}": `)
          : getMetaDescriptionFromSearchresults(searchResults, `Results with the search term "${searchQuery}": `),
        no: searchCategory !== 'all'
          ? getMetaDescriptionFromSearchresults(searchResults, `Resultat for ${searchCategoryNames[searchCategory]['no'].toLowerCase()} med søkeordet "${searchQuery}": `)
          : getMetaDescriptionFromSearchresults(searchResults, `Resultater med søkeordet "${searchQuery}": `)
      } : {
        en: 'Search for releases, videos, posts, products and equipment.Type in the word or phrase you\'re looking for in the search bar',
        no: 'Søk etter utgivelser, videoer, innlegg, produkter og utstyr. Skriv inn det du leter etter i søkefeltet'
      }
  }

  let breadcrumbs = [
    {
      name: listPage.heading[selectedLanguageKey],
      path: `/${languageSlug}search/${urlParameters}`
    }
  ];


  const metaTitle = listPage.title[selectedLanguageKey];
  const contentTitle = listPage.heading[selectedLanguageKey];
  const metaDescription = listPage.description[selectedLanguageKey];

  return (<React.Fragment>
    <Helmet htmlAttributes={{
      lang: selectedLanguageKey
    }}>
      <title>{metaTitle}</title>
      <meta name='description' content={metaDescription} />
      <link rel="canonical" href={`https://www.dehlimusikk.no/${languageSlug}search/${urlParameters}`} />
      <link rel="alternate" href={`https://www.dehlimusikk.no/search/${urlParameters}`} hreflang="no" />
      <link rel="alternate" href={`https://www.dehlimusikk.no/en/search/${urlParameters}`} hreflang="en" />
      <link rel="alternate" href={`https://www.dehlimusikk.no/search/${urlParameters}`} hreflang="x-default" />
      <meta property="og:title" content={contentTitle} />
      <meta property="og:url" content={`https://www.dehlimusikk.no/${languageSlug}search/${urlParameters}`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:locale" content={selectedLanguageKey === 'en'
        ? 'en_US'
        : 'no_NO'} />
      <meta property="og:locale:alternate" content={selectedLanguageKey === 'en'
        ? 'nb_NO'
        : 'en_US'} />
      <meta property="twitter:title" content={contentTitle} />
      <meta property="twitter:description" content={metaDescription} />
    </Helmet>
    <Container>
      <Breadcrumbs breadcrumbs={breadcrumbs} />
      <h1>{contentTitle}</h1>
      <p>{
        selectedLanguageKey === 'en'
          ? hasSearchResultsCount
            ? `Shows ${searchResults.length} of ${searchResultsCount.all} results`
            : `${searchResults.length} results`
          : hasSearchResultsCount
            ? `Viser ${searchResults.length} av ${searchResultsCount.all} treff`
            : `${searchResults.length} treff`
      }</p>
    </Container>
    <Container>
      <label className={style.selectListLabel} htmlFor="searchCategory">{selectedLanguageKey === 'en' ? 'Filter results by category' : 'Filtrer resultat på kategori'}</label>
      <div className={style.selectListContainer}>
        <FontAwesomeIcon icon={['fas', 'filter']} />
        <select id="searchCategory" name="searchCategory" value={searchCategory} onChange={handleSearchCategoryChange}>
          {renderSearchCategoryOptions(searchCategoryNames, searchResultsCount)}
        </select>
        <FontAwesomeIcon icon={['fas', 'chevron-down']} />
      </div>
      <div className={style.listContainer}>
        <List compact={true}>
          {renderSearchResults(searchResults)}
        </List>
      </div>
    </Container>
  </React.Fragment>)
}

export default Search;
