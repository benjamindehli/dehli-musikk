// Dependencies
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet-async";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Components
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";
import List from "components/template/List";
import ListItem from "components/template/List/ListItem";
import SearchResult from "components/partials/SearchResult";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "actions/LanguageActions";
import { updateSearchResults, updateSearchResultsCount } from "actions/SearchResultsActions";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { getSearchResults } from "helpers/search";

// Stylesheets
import style from "components/routes/Search.module.scss";

const Search = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const params = useParams();
    const navigate = useNavigate();

    const searchQuery = new URLSearchParams(location.search).get("q") || null;
    const searchCategory = new URLSearchParams(location.search).get("category") || "all";

    const searchCategoryNames = {
        all: { en: "Show all", no: "Vis alle" },
        release: { en: "Releases", no: "Utgivelser" },
        post: { en: "Posts", no: "Innlegg" },
        video: { en: "Videos", no: "Videoer" },
        product: { en: "Products", no: "Produkter" },
        instruments: { en: "Instruments", no: "Instrumenter" },
        effects: { en: "Effects", no: "Effekter" },
        amplifiers: { en: "Amplifiers", no: "Forsterkere" },
        faq: { en: "Frequently Asked Questions", no: "Ofte stilte spørsmål" }
    };

    // Redux store
    const selectedLanguageKey = useSelector((state) => state.selectedLanguageKey);
    const searchResults = useSelector((state) => state.searchResults);
    const searchResultsCount = useSelector((state) => state.searchResultsCount);
    const languageSlug = useSelector((state) => getLanguageSlug(state));
    const availableLanguages = useSelector((state) => state.availableLanguages);
    const multilingualRoutes = useSelector((state) => state.multilingualRoutes);

    const hasSearchResultsCount = searchResultsCount && Object.keys(searchResultsCount).length;

    useEffect(() => {
        if (params.selectedLanguage) {
            dispatch(updateSelectedLanguageKey(params.selectedLanguage));
        }
    }, [dispatch, params]);

    useEffect(() => {
        const urlParameters = searchQuery
            ? searchCategory !== "all"
                ? `?q=${searchQuery}&category=${searchCategory}`
                : `?q=${searchQuery}`
            : "";
        const multilingualPaths = {
            no: `search/${urlParameters}`,
            en: `search/${urlParameters}`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch, searchCategory, searchQuery]);

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!searchQuery || searchQuery?.trim().length < 2) {
                navigate("/");
            } else {
                const searchResults = await getSearchResults(searchQuery, selectedLanguageKey, searchCategory);
                dispatch(updateSearchResults(searchResults));
                if (searchCategory === "all") {
                    dispatch(updateSearchResultsCount(searchResults));
                }
            }
        };
        fetchSearchResults();
    }, [dispatch, navigate, searchQuery, selectedLanguageKey, searchCategory]);

    const renderSearchResults = (searchResults) => {
        return searchResults.map((searchResult, index) => {
            return (
                <ListItem compact={true} key={index}>
                    <SearchResult searchResult={searchResult} />
                </ListItem>
            );
        });
    };

    const renderSearchCategoryOptions = (searchCategoryNames, searchResultsCount) => {
        return Object.keys(searchCategoryNames).map((categoryKey) => {
            const category = searchCategoryNames[categoryKey];
            const hasSearchResultsCount = Object.keys(searchResultsCount).length;
            const count = searchResultsCount[categoryKey] ? searchResultsCount[categoryKey] : 0;
            const isDisabled = hasSearchResultsCount && !count;
            return (
                <option value={categoryKey} disabled={isDisabled} key={categoryKey}>
                    {category[selectedLanguageKey]}
                    {hasSearchResultsCount ? ` (${count})` : ""}
                </option>
            );
        });
    };

    const handleSearchCategoryChange = (event) => {
        const value = event?.target?.value;
        const urlParameters = value !== "all" ? `?q=${searchQuery}&category=${value}` : `?q=${searchQuery}`;
        navigate(`/${languageSlug}search/${urlParameters}`);
    };

    const getMetaDescriptionFromSearchresults = (searchResults, description = "") => {
        if (searchResults && searchResults.length) {
            searchResults.forEach((result) => {
                if (description.length < 160) {
                    description += `${result.text}${result.excerpt ? " " + result.excerpt + ", " : ", "}`;
                }
            });
        }
        return description.length > 160 ? `${description.substring(0, 160)}` : description;
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            const listPage = {
                title: searchQuery?.length
                    ? {
                          en:
                              searchCategory !== "all"
                                  ? `Results for ${searchCategoryNames[searchCategory][
                                        "en"
                                    ].toLowerCase()} with the search term "${searchQuery}" | Dehli Musikk`
                                  : `All results with the search term "${searchQuery}" | Dehli Musikk`,
                          no:
                              searchCategory !== "all"
                                  ? `Resultat for ${searchCategoryNames[searchCategory][
                                        "no"
                                    ].toLowerCase()} med søkeordet "${searchQuery}" | Dehli Musikk`
                                  : `Alle resultater med søkeordet "${searchQuery}" | Dehli Musikk`
                      }
                    : {
                          en: "Search for content | Dehli Musikk",
                          no: "Søk etter innhold  | Dehli Musikk"
                      },
                heading: searchQuery?.length
                    ? {
                          en:
                              searchCategory !== "all"
                                  ? `Results for ${searchCategoryNames[searchCategory][
                                        "en"
                                    ].toLowerCase()} with the search term "${searchQuery}"`
                                  : `All results with the search term "${searchQuery}"`,
                          no:
                              searchCategory !== "all"
                                  ? `Resultat for ${searchCategoryNames[searchCategory][
                                        "no"
                                    ].toLowerCase()} med søkeordet "${searchQuery}"`
                                  : `Alle resultater med søkeordet "${searchQuery}"`
                      }
                    : {
                          en: "Search for content",
                          no: "Søk etter innhold"
                      },
                description: searchQuery?.length
                    ? {
                          en:
                              searchCategory !== "all"
                                  ? getMetaDescriptionFromSearchresults(
                                        searchResults,
                                        `Results for ${searchCategoryNames[searchCategory][
                                            "en"
                                        ].toLowerCase()} with the search term "${searchQuery}": `
                                    )
                                  : getMetaDescriptionFromSearchresults(
                                        searchResults,
                                        `Results with the search term "${searchQuery}": `
                                    ),
                          no:
                              searchCategory !== "all"
                                  ? getMetaDescriptionFromSearchresults(
                                        searchResults,
                                        `Resultat for ${searchCategoryNames[searchCategory][
                                            "no"
                                        ].toLowerCase()} med søkeordet "${searchQuery}": `
                                    )
                                  : getMetaDescriptionFromSearchresults(
                                        searchResults,
                                        `Resultater med søkeordet "${searchQuery}": `
                                    )
                      }
                    : {
                          en: "Search for releases, videos, posts, products and equipment.Type in the word or phrase you're looking for in the search bar",
                          no: "Søk etter utgivelser, videoer, innlegg, produkter og utstyr. Skriv inn det du leter etter i søkefeltet"
                      }
            };

            let breadcrumbs = [
                {
                    name: listPage.heading?.[selectedLanguageKey],
                    path: multilingualRoutes?.[selectedLanguageKey]?.path
                }
            ];

            const metaTitle = listPage?.title?.[selectedLanguageKey];
            const contentTitle = listPage?.heading?.[selectedLanguageKey];
            const metaDescription = listPage?.description?.[selectedLanguageKey];

            return (
                <React.Fragment>
                    <Helmet
                        htmlAttributes={{
                            lang: selectedLanguageKey
                        }}
                    >
                        <title>{metaTitle}</title>
                        <meta name="description" content={metaDescription} />
                        <link
                            rel="canonical"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.[selectedLanguageKey]?.path}`}
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.no?.path}`}
                            hreflang="no"
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.en?.path}`}
                            hreflang="en"
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no${multilingualRoutes?.no?.path}`}
                            hreflang="x-default"
                        />
                        <meta property="og:title" content={contentTitle} />
                        <meta
                            property="og:url"
                            content={`https://www.dehlimusikk.no${multilingualRoutes?.[selectedLanguageKey]?.path}`}
                        />
                        <meta property="og:description" content={metaDescription} />
                        <meta property="og:locale" content={selectedLanguageKey === "en" ? "en_US" : "no_NO"} />
                        <meta
                            property="og:locale:alternate"
                            content={selectedLanguageKey === "en" ? "nb_NO" : "en_US"}
                        />
                        <meta property="twitter:title" content={contentTitle} />
                        <meta property="twitter:description" content={metaDescription} />
                    </Helmet>
                    <Container>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                        <h1>{contentTitle}</h1>
                        <p>
                            {selectedLanguageKey === "en"
                                ? hasSearchResultsCount
                                    ? `Shows ${searchResults.length} of ${searchResultsCount.all} results`
                                    : `${searchResults.length} results`
                                : hasSearchResultsCount
                                ? `Viser ${searchResults.length} av ${searchResultsCount.all} treff`
                                : `${searchResults.length} treff`}
                        </p>
                    </Container>
                    <Container>
                        <label className={style.selectListLabel} htmlFor="searchCategory">
                            {selectedLanguageKey === "en"
                                ? "Filter results by category"
                                : "Filtrer resultat på kategori"}
                        </label>
                        <div className={style.selectListContainer}>
                            <FontAwesomeIcon icon={["fas", "filter"]} />
                            <select
                                id="searchCategory"
                                name="searchCategory"
                                value={searchCategory}
                                onChange={handleSearchCategoryChange}
                            >
                                {renderSearchCategoryOptions(searchCategoryNames, searchResultsCount)}
                            </select>
                            <FontAwesomeIcon icon={["fas", "chevron-down"]} />
                        </div>
                        <div className={style.listContainer}>
                            <List compact={true}>{renderSearchResults(searchResults)}</List>
                        </div>
                    </Container>
                </React.Fragment>
            );
        }
    }
};

export default Search;
