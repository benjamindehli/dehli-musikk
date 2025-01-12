// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet-async";

// Components
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";
import List from "components/template/List";
import ListItem from "components/template/List/ListItem";
import Modal from "components/template/Modal";
import Release from "components/partials/Portfolio/Release";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { getReleaseInstruments } from "helpers/releaseInstruments";

// Data
import releases from "data/portfolio";

const Portfolio = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const selectedReleaseId = params?.releaseId || null;

    // State
    const [selectedRelease, setSelectedRelease] = useState();

    // Redux store
    const selectedLanguageKey = useSelector((state) => state.selectedLanguageKey);
    const languageSlug = useSelector((state) => getLanguageSlug(state));
    const availableLanguages = useSelector((state) => state.availableLanguages);

    useEffect(() => {
        if (params.selectedLanguage) {
            dispatch(updateSelectedLanguageKey(params.selectedLanguage));
        }
    }, [dispatch, params]);

    useEffect(() => {
        const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
        setSelectedRelease(
            !!languageIsInitialized && !!selectedReleaseId ? getSelectedRelease(selectedReleaseId) : undefined
        );
    }, [params.selectedLanguage, selectedLanguageKey, selectedReleaseId]);

    useEffect(() => {
        const multilingualIds = {
            en: selectedRelease ? convertToUrlFriendlyString(selectedRelease.title) : "",
            no: selectedRelease ? convertToUrlFriendlyString(selectedRelease.title) : ""
        };
        const multilingualPaths = {
            no: `portfolio/${selectedRelease ? multilingualIds.no + "/" : ""}`,
            en: `portfolio/${selectedRelease ? multilingualIds.en + "/" : ""}`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch, selectedRelease]);

    const renderSummarySnippet = (releases) => {
        const releaseItems = releases.map((release, index) => {
            const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
            return {
                "@type": "MusicRecording",
                "@id": `https://www.dehlimusikk.no/portfolio/${releaseId}/`,
                position: index + 1,
                url: `https://www.dehlimusikk.no/${languageSlug}portfolio/${releaseId}/`
            };
        });
        const snippet = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            itemListElement: releaseItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderReleases = () => {
        return releases && releases.length
            ? releases.map((release) => {
                  const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
                  return (
                      <ListItem key={releaseId}>
                          <Release release={release} />
                      </ListItem>
                  );
              })
            : "";
    };

    const renderSelectedRelease = (selectedRelease) => {
        const handleClickOutside = () => {
            navigate(`/${languageSlug}portfolio/`);
        };
        const arrowLeftLink =
            selectedRelease && selectedRelease.previousReleaseId
                ? `/${languageSlug}portfolio/${selectedRelease.previousReleaseId}/`
                : null;
        const arrowRightLink =
            selectedRelease && selectedRelease.nextReleaseId
                ? `/${languageSlug}portfolio/${selectedRelease.nextReleaseId}/`
                : null;
        return selectedRelease ? (
            <Modal
                onClickOutside={handleClickOutside}
                maxWidth="540px"
                arrowLeftLink={arrowLeftLink}
                arrowRightLink={arrowRightLink}
                selectedLanguageKey={selectedLanguageKey}
            >
                <Release release={selectedRelease} fullscreen={true} />
            </Modal>
        ) : (
            ""
        );
    };

    const getSelectedRelease = (selectedReleaseId) => {
        let selectedRelease = null;
        releases.forEach((release, index) => {
            const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
            if (releaseId === selectedReleaseId) {
                selectedRelease = {
                    ...release,
                    previousReleaseId:
                        index > 0
                            ? convertToUrlFriendlyString(
                                  `${releases[index - 1].artistName} ${releases[index - 1].title}`
                              )
                            : null,
                    nextReleaseId:
                        index < releases.length - 1
                            ? convertToUrlFriendlyString(
                                  `${releases[index + 1].artistName} ${releases[index + 1].title}`
                              )
                            : null
                };
            }
        });
        return selectedRelease;
    };

    const getReleaseInstrumentsText = (releaseId) => {
        const releaseInstruments = getReleaseInstruments(releaseId);
        const releaseInstrumentsString =
            releaseInstruments?.length &&
            releaseInstruments
                .map((instrument, index) => {
                    const separator =
                        index === releaseInstruments.length - 2
                            ? ` ${selectedLanguageKey === "en" ? "and" : "og"} `
                            : ", ";
                    return `${instrument.brand} ${instrument.model}${
                        index === releaseInstruments.length - 1 ? "" : separator
                    }`;
                })
                .join("");
        return `${
            selectedLanguageKey === "en" ? "Instruments used on the song: " : "Instrumenter som er brukt på låta: "
        }${releaseInstrumentsString}`;
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            const selectedRelease = selectedReleaseId
                ? getSelectedRelease(selectedReleaseId, selectedLanguageKey)
                : null;

            if (selectedReleaseId && !selectedRelease) {
                return <Navigate to="/404" />;
            }

            const listPage = {
                title: {
                    en: "Portfolio | Dehli Musikk",
                    no: "Portefølje | Dehli Musikk"
                },
                heading: {
                    en: "Portfolio",
                    no: "Portefølje"
                },
                description: {
                    en: "Recordings where Dehli Musikk has contributed",
                    no: "Utgivelser Dehli Musikk har bidratt på"
                }
            };

            const detailsPage = {
                title: {
                    en: `${
                        selectedRelease ? `${selectedRelease.title} by ${selectedRelease.artistName}` : ""
                    } - Portfolio | Dehli Musikk`,
                    no: `${
                        selectedRelease ? `${selectedRelease.title} av ${selectedRelease.artistName}` : ""
                    } - Portefølje | Dehli Musikk`
                },
                heading: {
                    en: selectedRelease ? `${selectedRelease.title} by ${selectedRelease.artistName}` : "",
                    no: selectedRelease ? `${selectedRelease.title} av ${selectedRelease.artistName}` : ""
                },
                description: {
                    en: selectedRelease
                        ? `Listen to the track ${selectedRelease.title} by ${selectedRelease.artistName}`
                        : "",
                    no: selectedRelease ? `Lytt til låta ${selectedRelease.title} av ${selectedRelease.artistName}` : ""
                }
            };

            let breadcrumbs = [
                {
                    name: listPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}portfolio/`
                }
            ];
            if (selectedRelease) {
                breadcrumbs.push({
                    name: detailsPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}portfolio/${selectedReleaseId}/`
                });
            }

            const metaTitle = selectedRelease
                ? detailsPage.title[selectedLanguageKey]
                : listPage.title[selectedLanguageKey];
            const contentTitle = selectedRelease
                ? detailsPage.heading[selectedLanguageKey]
                : listPage.heading[selectedLanguageKey];
            const metaDescription = selectedRelease
                ? detailsPage.description[selectedLanguageKey]
                : listPage.description[selectedLanguageKey];

            return (
                <React.Fragment>
                    <Helmet htmlAttributes={{ lang: selectedLanguageKey }}>
                        <title>{metaTitle}</title>
                        <meta name="description" content={metaDescription} />
                        <link
                            rel="canonical"
                            href={`https://www.dehlimusikk.no/${languageSlug}portfolio/${
                                selectedRelease ? selectedReleaseId + "/" : ""
                            }`}
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no/portfolio/${
                                selectedRelease ? selectedReleaseId + "/" : ""
                            }`}
                            hreflang="no"
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no/en/portfolio/${
                                selectedRelease ? selectedReleaseId + "/" : ""
                            }`}
                            hreflang="en"
                        />
                        <link
                            rel="alternate"
                            href={`https://www.dehlimusikk.no/portfolio/${
                                selectedRelease ? selectedReleaseId + "/" : ""
                            }`}
                            hreflang="x-default"
                        />
                        <meta property="og:title" content={contentTitle} />
                        <meta
                            property="og:url"
                            content={`https://www.dehlimusikk.no/${languageSlug}portfolio/${
                                selectedRelease ? selectedReleaseId + "/" : ""
                            }`}
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
                    {selectedRelease ? renderSelectedRelease(selectedRelease) : renderSummarySnippet(releases)}
                    <Container blur={selectedRelease !== null}>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                        <h1>{contentTitle}</h1>
                        {selectedRelease ? (
                            <p>
                                {detailsPage.description[selectedLanguageKey]}
                                <br />
                                {getReleaseInstrumentsText(selectedReleaseId)}
                            </p>
                        ) : (
                            <p>
                                {selectedLanguageKey === "en"
                                    ? "Recordings where Dehli Musikk has contributed"
                                    : "Utgivelser Dehli Musikk har bidratt på"}
                            </p>
                        )}
                    </Container>
                    <Container blur={selectedRelease !== null}>
                        <List>{renderReleases()}</List>
                    </Container>
                </React.Fragment>
            );
        }
    }
};

export default Portfolio;
