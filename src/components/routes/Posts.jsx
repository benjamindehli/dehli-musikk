// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate, useParams } from "react-router";

// Components
import Breadcrumbs from "../partials/Breadcrumbs";
import Container from "../template/Container";
import List from "../template/List";
import ListItem from "../template/List/ListItem";
import Modal from "../template/Modal";
import Post from "../partials/Post";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "../../actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "../../reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "../../helpers/urlFormatter";
import { formatContentAsString } from "../../helpers/contentFormatter";

// Data
import posts from "../../data/posts";

const Posts = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const selectedPostId = params?.postId || null;

    // State
    const [selectedPost, setSelectedPost] = useState();

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
        setSelectedPost(
            !!languageIsInitialized && !!selectedPostId
                ? getSelectedPost(selectedPostId, selectedLanguageKey)
                : undefined
        );
    }, [params.selectedLanguage, selectedLanguageKey, selectedPostId]);

    useEffect(() => {
        const multilingualIds = {
            en: selectedPost ? convertToUrlFriendlyString(selectedPost.title.en) : "",
            no: selectedPost ? convertToUrlFriendlyString(selectedPost.title.no) : ""
        };
        const multilingualPaths = {
            no: `posts/${selectedPost ? multilingualIds.no + "/" : ""}`,
            en: `posts/${selectedPost ? multilingualIds.en + "/" : ""}`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch, selectedPost]);

    const renderSummarySnippet = (posts) => {
        const postItems = posts.map((post, index) => {
            const postId = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
            return {
                "@type": "ListItem",
                position: index + 1,
                url: `https://www.dehlimusikk.no/${languageSlug}posts/${postId}/`
            };
        });
        const snippet = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            itemListElement: postItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderPosts = () => {
        return posts && posts.length
            ? posts.map((post) => {
                  return (
                      <ListItem key={post.id} article>
                          <Post post={post} />
                      </ListItem>
                  );
              })
            : "";
    };

    const renderSelectedPost = (selectedPost) => {
        const handleClickOutside = () => {
            navigate(`/${languageSlug}posts/`);
        };
        const arrowLeftLink =
            selectedPost && selectedPost.previousPostId
                ? `/${languageSlug}posts/${selectedPost.previousPostId}/`
                : null;
        const arrowRightLink =
            selectedPost && selectedPost.nextPostId ? `/${languageSlug}posts/${selectedPost.nextPostId}/` : null;
        return selectedPost ? (
            <Modal
                onClickOutside={handleClickOutside}
                maxWidth="540px"
                arrowLeftLink={arrowLeftLink}
                arrowRightLink={arrowRightLink}
                selectedLanguageKey={selectedLanguageKey}
            >
                <Post post={selectedPost} fullscreen={true} />
            </Modal>
        ) : (
            ""
        );
    };

    const getSelectedPost = (selectedPostId, selectedLanguageKey) => {
        let selectedPost = null;
        posts.forEach((post, index) => {
            const postId = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
            if (postId === selectedPostId) {
                selectedPost = {
                    ...post,
                    previousPostId:
                        index > 0 ? convertToUrlFriendlyString(posts[index - 1].title[selectedLanguageKey]) : null,
                    nextPostId:
                        index < posts.length - 1
                            ? convertToUrlFriendlyString(posts[index + 1].title[selectedLanguageKey])
                            : null
                };
            }
        });
        return selectedPost;
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            if (selectedPostId && selectedPost === null) {
                return <Navigate to="/404" />;
            }

            const listPage = {
                title: {
                    en: "Posts | Dehli Musikk",
                    no: "Innlegg | Dehli Musikk"
                },
                heading: {
                    en: "Posts",
                    no: "Innlegg"
                },
                description: {
                    en: "Latest update from Dehli Musikk",
                    no: "Siste oppdateringer fra Dehli Musikk"
                }
            };

            const detailsPage = {
                title: {
                    en: `${selectedPost ? selectedPost.title.en : ""} - Posts | Dehli Musikk`,
                    no: `${selectedPost ? selectedPost.title.no : ""} - Innlegg | Dehli Musikk`
                },
                heading: {
                    en: selectedPost ? selectedPost.title.en : "",
                    no: selectedPost ? selectedPost.title.no : ""
                },
                description: {
                    en: selectedPost ? formatContentAsString(selectedPost.content.en) : "",
                    no: selectedPost ? formatContentAsString(selectedPost.content.no) : ""
                }
            };

            let breadcrumbs = [
                {
                    name: listPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}posts/`
                }
            ];
            if (selectedPost) {
                breadcrumbs.push({
                    name: detailsPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}posts/${selectedPostId}/`
                });
            }

            const metaTitle = selectedPost
                ? detailsPage.title[selectedLanguageKey]
                : listPage.title[selectedLanguageKey];
            const contentTitle = selectedPost
                ? detailsPage.heading[selectedLanguageKey]
                : listPage.heading[selectedLanguageKey];
            const metaDescription = selectedPost
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
                            content={`https://www.dehlimusikk.no/${languageSlug}posts/${
                                selectedPost ? selectedPostId + "/" : ""
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
                    <Container blur={!!selectedPost}>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </Container>
                    {selectedPost ? renderSelectedPost(selectedPost) : renderSummarySnippet(posts)}
                    <Container blur={!!selectedPost}>
                        {
                            selectedPost
                                ? <h2 data-size="h1">{listPage.heading[selectedLanguageKey]}</h2>
                                : <h1>{listPage.heading[selectedLanguageKey]}</h1>
                        }
                        <p>
                            {selectedLanguageKey === "en"
                                ? "Updates from Dehli Musikk"
                                : "Oppdateringer fra Dehli Musikk"}
                        </p>
                    </Container>
                    <Container blur={!!selectedPost}>
                        <List>{renderPosts()}</List>
                    </Container>
                </React.Fragment>
            );
        }
    }
};

export default Posts;
