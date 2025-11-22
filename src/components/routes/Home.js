// Dependencies
import React, { useEffect } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { Navigate, useParams } from "react-router";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Components
import Button from "components/partials/Button";
import Container from "components/template/Container";
import IntroContent from "components/partials/IntroContent";
import LatestPosts from "components/partials/LatestPosts";
import LatestProducts from "components/partials/LatestProducts";
import LatestReleases from "components/partials/LatestReleases";
import LatestVideos from "components/partials/LatestVideos";
import SocialMediaLinks from "components/partials/SocialMediaLinks";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Assets
import DehliMusikkLogo from "assets/svg/DehliMusikkLogoInverse.svg";

// Stylesheets
import style from "components/routes/Home.module.scss";

const Home = () => {
    const dispatch = useDispatch();
    const params = useParams();

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
        const multilingualPaths = {
            no: ``,
            en: ``
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch]);

    const renderHeaderImage = () => {
        const imagePath = `assets/images/header`;
        const headerImage = {
            avif: {
                480: require(`../../${imagePath}_480.avif`),
                640: require(`../../${imagePath}_640.avif`),
                800: require(`../../${imagePath}_800.avif`),
                1024: require(`../../${imagePath}_1024.avif`),
                1260: require(`../../${imagePath}_1260.avif`),
                1440: require(`../../${imagePath}_1440.avif`),
                1680: require(`../../${imagePath}_1680.avif`)
            },
            webp: {
                480: require(`../../${imagePath}_480.webp`),
                640: require(`../../${imagePath}_640.webp`),
                800: require(`../../${imagePath}_800.webp`),
                1024: require(`../../${imagePath}_1024.webp`),
                1260: require(`../../${imagePath}_1260.webp`),
                1440: require(`../../${imagePath}_1440.webp`),
                1680: require(`../../${imagePath}_1680.webp`)
            },
            jpg: {
                480: require(`../../${imagePath}_480.jpg`),
                640: require(`../../${imagePath}_640.jpg`),
                800: require(`../../${imagePath}_800.jpg`),
                1024: require(`../../${imagePath}_1024.jpg`),
                1260: require(`../../${imagePath}_1260.jpg`),
                1440: require(`../../${imagePath}_1440.jpg`),
                1680: require(`../../${imagePath}_1680.jpg`)
            }
        };
        const srcSets = Object.keys(headerImage).map((fileType) => {
            const srcSet = Object.keys(headerImage[fileType]).map((imageSize) => {
                return `${headerImage[fileType][imageSize]} ${imageSize}w`;
            });
            const sizes = "100vw";
            return <source sizes={sizes} key={fileType} srcSet={srcSet} type={`image/${fileType}`} />;
        });
        return (
            <picture className={style.backgroundsImage}>
                {srcSets}
                <img src={headerImage.jpg[1024]} alt="A Korg MS-20 with a cassette and tape recorder" />
            </picture>
        );
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            const metaDescription =
                selectedLanguageKey === "en"
                    ? "Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands"
                    : "Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band";

            return (
                <React.Fragment>
                    <Helmet htmlAttributes={{ lang: selectedLanguageKey }}>
                        <title>Dehli Musikk</title>
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
                        <meta property="og:title" content="Dehli Musikk" />
                        <meta property="og:url" content={`https://www.dehlimusikk.no/${languageSlug}`} />
                        <meta property="og:description" content={metaDescription} />
                        <meta property="og:locale" content={selectedLanguageKey === "en" ? "en_US" : "no_NO"} />
                        <meta
                            property="og:locale:alternate"
                            content={selectedLanguageKey === "en" ? "nb_NO" : "en_US"}
                        />
                        <meta property="twitter:title" content="Dehli Musikk" />
                        <meta property="twitter:description" content={metaDescription} />
                    </Helmet>
                    <div className={style.header} style={{ minHeight: "135px" }}>
                        {renderHeaderImage()}
                        <div className={style.overlay}>
                            <span className={style.logo}>
                                <img src={DehliMusikkLogo} alt="Logo for Dehli Musikk" width="350" height="207" />
                            </span>
                        </div>
                    </div>

                    <div className={style.contentSection} style={{ minHeight: "468px" }}>
                        <header>
                            <h1>Dehli Musikk</h1>
                        </header>
                        <IntroContent />
                    </div>

                    <div className={style.mutedSection} style={{ minHeight: "650px" }}>
                        <Container>
                            <h2 className={style.sectionHeader}>
                                {selectedLanguageKey === "en" ? "Latest updates" : "Siste oppdateringer"}
                            </h2>
                            <LatestPosts />
                            <div className={style.callToActionButtonContainer}>
                                {selectedLanguageKey === "en" ? (
                                    <Link to={`/${languageSlug}posts/`} title="See all posts">
                                        <Button>Show all posts</Button>
                                    </Link>
                                ) : (
                                    <Link to={`/${languageSlug}posts/`} title="Se alle innlegg">
                                        <Button>Vis alle innlegg</Button>
                                    </Link>
                                )}
                            </div>
                        </Container>
                    </div>

                    <div style={{ minHeight: "650px" }}>
                        <Container>
                            <h2 className={style.sectionHeader}>
                                {selectedLanguageKey === "en" ? "Latest releases" : "Siste utgivelser"}
                            </h2>
                            <LatestReleases />
                            <div className={style.callToActionButtonContainer}>
                                {selectedLanguageKey === "en" ? (
                                    <Link to={`/${languageSlug}portfolio/`} title="See all releases">
                                        <Button>Show all releases</Button>
                                    </Link>
                                ) : (
                                    <Link to={`/${languageSlug}portfolio/`} title="Se alle utgivelser">
                                        <Button>Vis alle utgivelser</Button>
                                    </Link>
                                )}
                            </div>
                        </Container>
                    </div>

                    <div className={style.mutedSection} style={{ minHeight: "650px" }}>
                        <Container>
                            <h2 className={style.sectionHeader}>
                                {selectedLanguageKey === "en" ? "Latest videos" : "Siste videoer"}
                            </h2>
                            <LatestVideos />
                            <div className={style.callToActionButtonContainer}>
                                {selectedLanguageKey === "en" ? (
                                    <Link to={`/${languageSlug}videos/`} title="See all videos">
                                        <Button>Show all videos</Button>
                                    </Link>
                                ) : (
                                    <Link to={`/${languageSlug}videos/`} title="Se alle videoer">
                                        <Button>Vis alle videoer</Button>
                                    </Link>
                                )}
                            </div>
                        </Container>
                    </div>

                    <div style={{ minHeight: "650px" }}>
                        <Container>
                            <h2 className={style.sectionHeader}>
                                {selectedLanguageKey === "en" ? "Newest products" : "Nyeste produkter"}
                            </h2>
                            <LatestProducts />
                            <div className={style.callToActionButtonContainer}>
                                {selectedLanguageKey === "en" ? (
                                    <Link to={`/${languageSlug}products/`} title="See all products">
                                        <Button>See all products</Button>
                                    </Link>
                                ) : (
                                    <Link to={`/${languageSlug}products/`} title="Se alle produkter">
                                        <Button>Se alle produkter</Button>
                                    </Link>
                                )}
                            </div>
                        </Container>
                    </div>

                    <div className={style.socialMediaSection} style={{ minHeight: "297px" }}>
                        <div className={style.contentSection}>
                            <h2>
                                {selectedLanguageKey === "en"
                                    ? "Follow Dehli Musikk on social media"
                                    : "Følg Dehli Musikk på sosiale medier"}
                            </h2>
                            <SocialMediaLinks />
                        </div>
                    </div>
                </React.Fragment>
            );
        }
    }
};

export default connect(null, null)(Home);
