// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";
import { Helmet } from "react-helmet-async";

// Components
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";
import List from "components/template/List";
import ListItem from "components/template/List/ListItem";
import Modal from "components/template/Modal";
import Video from "components/partials/Video";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentAsString, formatContentWithReactLinks } from "helpers/contentFormatter";

// Data
import videos from "data/videos";

const Videos = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const selectedVideoId = params?.videoId || null;

    const location = useLocation();
    const startOffset = new URLSearchParams(location.search).get("t") || null;


    const lastSegment = location.pathname
        .split("/")
        .filter((segment) => segment?.length)
        .pop();
    const isTheaterMode = lastSegment === "video";

    // State
    const [selectedVideo, setSelectedVideo] = useState();

    // Redux store
    const selectedLanguageKey = useSelector((state) => state.selectedLanguageKey);
    const languageSlug = useSelector((state) => getLanguageSlug(state));
    const availableLanguages = useSelector((state) => state.availableLanguages);
    const multilingualRoutes = useSelector((state) => state.multilingualRoutes);

    useEffect(() => {
        if (params.selectedLanguage) {
            dispatch(updateSelectedLanguageKey(params.selectedLanguage));
        }
    }, [dispatch, params]);

    useEffect(() => {
        const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
        setSelectedVideo(
            !!languageIsInitialized && !!selectedVideoId
                ? getSelectedVideo(selectedVideoId, selectedLanguageKey)
                : undefined
        );
    }, [params.selectedLanguage, selectedLanguageKey, selectedVideoId]);

    useEffect(() => {
        const multilingualIds = {
            en: selectedVideo ? convertToUrlFriendlyString(selectedVideo.title.en) : "",
            no: selectedVideo ? convertToUrlFriendlyString(selectedVideo.title.no) : ""
        };
        const theaterModePath = isTheaterMode ? "video/" : "";
        const multilingualPaths = {
            no: `videos/${selectedVideo ? multilingualIds.no + "/" + theaterModePath : ""}`,
            en: `videos/${selectedVideo ? multilingualIds.en + "/" + theaterModePath : ""}`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch, isTheaterMode, selectedVideo]);

    const renderSummarySnippet = (videos) => {
        const videoItems = videos.map((video, index) => {
            const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
            const imagePathJpg = `data/videos/thumbnails/web/jpg/${video.thumbnailFilename}`;
            const videoThumbnailSrc = require(`../../${imagePathJpg}_540.jpg`);
            const videoDate = new Date(video.timestamp).toISOString();

            return {
                "@type": "VideoObject",
                "@id": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/video/`,
                position: index + 1,
                url: `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/video/`,
                name: video.title[selectedLanguageKey],
                description: video.content[selectedLanguageKey]
                    ? formatContentAsString(video.content[selectedLanguageKey])
                    : "",
                thumbnailUrl: `https://www.dehlimusikk.no${videoThumbnailSrc}`,
                embedURL: `https://www.youtube.com/watch?v=${video.youTubeId}`,
                uploadDate: videoDate
            };
        });
        const snippet = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            itemListElement: videoItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderVideos = () => {
        return videos && videos.length
            ? videos.map((video) => {
                  const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
                  return (
                      <ListItem key={videoId}>
                          <Video video={video} />
                      </ListItem>
                  );
              })
            : "";
    };

    const renderSelectedVideo = (selectedVideo) => {
        const handleClickOutside = () => {
            navigate(`/${languageSlug}videos/`);
        };
        const theaterModePath = isTheaterMode ? "video/" : "";
        const arrowLeftLink =
            selectedVideo && selectedVideo.previousVideoId
                ? `/${languageSlug}videos/${selectedVideo.previousVideoId}/${theaterModePath}`
                : null;
        const arrowRightLink =
            selectedVideo && selectedVideo.nextVideoId
                ? `/${languageSlug}videos/${selectedVideo.nextVideoId}/${theaterModePath}`
                : null;
        return selectedVideo ? (
            <Modal
                onClickOutside={handleClickOutside}
                maxWidth={isTheaterMode ? "none" : "945px"}
                arrowLeftLink={arrowLeftLink}
                arrowRightLink={arrowRightLink}
                selectedLanguageKey={selectedLanguageKey}
                isTheaterMode={isTheaterMode}
            >
                <Video video={selectedVideo} fullscreen={true} isTheaterMode={isTheaterMode} startOffset={startOffset} />
            </Modal>
        ) : (
            ""
        );
    };

    const getSelectedVideo = (selectedVideoId, selectedLanguageKey) => {
        let selectedVideo = null;
        videos.forEach((video, index) => {
            const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
            if (videoId === selectedVideoId) {
                selectedVideo = {
                    ...video,
                    previousVideoId:
                        index > 0 ? convertToUrlFriendlyString(videos[index - 1].title[selectedLanguageKey]) : null,
                    nextVideoId:
                        index < videos.length - 1
                            ? convertToUrlFriendlyString(videos[index + 1].title[selectedLanguageKey])
                            : null
                };
            }
        });
        return selectedVideo;
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            if (selectedVideoId && selectedVideo === null) {
                return <Navigate to="/404" />;
            }

            const listPage = {
                title: {
                    en: "Videos | Dehli Musikk",
                    no: "Videoer | Dehli Musikk"
                },
                heading: {
                    en: "Videos",
                    no: "Videoer"
                },
                description: {
                    en: "Videos Dehli Musikk has created or contributed in",
                    no: "Videoer Dehli Musikk har har laget eller bidratt på"
                }
            };

            const detailsPage = {
                title: {
                    en: `${isTheaterMode ? "Video: " : ""}${
                        selectedVideo ? selectedVideo.title.en : ""
                    } - Videos | Dehli Musikk`,
                    no: `${isTheaterMode ? "Video: " : ""}${
                        selectedVideo ? selectedVideo.title.no : ""
                    } - Videoer | Dehli Musikk`
                },
                heading: {
                    en: `${isTheaterMode ? "Video: " : ""}${selectedVideo ? selectedVideo.title.en : ""}`,
                    no: `${isTheaterMode ? "Video: " : ""}${selectedVideo ? selectedVideo.title.no : ""}`
                },
                description: {
                    en: selectedVideo ? formatContentAsString(selectedVideo.content.en) : "",
                    no: selectedVideo ? formatContentAsString(selectedVideo.content.no) : ""
                }
            };

            let breadcrumbs = [
                {
                    name: listPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}videos/`
                }
            ];
            if (selectedVideo) {
                breadcrumbs.push({
                    name: detailsPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}videos/${selectedVideoId}/${isTheaterMode ? "video/" : ""}`
                });
            }

            const metaTitle = selectedVideo
                ? detailsPage.title[selectedLanguageKey]
                : listPage.title[selectedLanguageKey];
            const contentTitle = selectedVideo
                ? detailsPage.heading[selectedLanguageKey]
                : listPage.heading[selectedLanguageKey];
            const metaDescription = selectedVideo
                ? detailsPage.description[selectedLanguageKey]
                : listPage.description[selectedLanguageKey];

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
                            content={`https://www.dehlimusikk.no/${languageSlug}videos/${
                                selectedVideo ? selectedVideoId + "/" : ""
                            }${isTheaterMode ? "video/" : ""}`}
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
                    <Container blur={!!selectedVideo}>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </Container>
                    {selectedVideo ? renderSelectedVideo(selectedVideo) : renderSummarySnippet(videos)}
                    <Container blur={!!selectedVideo}>
                        {
                            selectedVideo
                                ? <h2 data-size="h1">{listPage.heading[selectedLanguageKey]}</h2>
                                : <h1>{listPage.heading[selectedLanguageKey]}</h1>
                        }
                        <p>
                            {selectedLanguageKey === "en"
                                ? "Videos Dehli Musikk has created or contributed in"
                                : "Videoer Dehli Musikk har har laget eller bidratt på"}
                        </p>
                    </Container>
                    {!isTheaterMode && (
                        <Container blur={!!selectedVideo}>
                            <List>{renderVideos()}</List>
                        </Container>
                    )}
                </React.Fragment>
            );
        }
    }
};

export default Videos;
