// Dependencies
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Navigate, useParams } from "react-router";

// Components
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentAsString, formatContentWithReactLinks } from "helpers/contentFormatter";

// Data
import frequentlyAskedQuestions from "data/frequentlyAskedQuestions.js";
import ExpansionPanel from "components/template/ExpansionPanel";

// Stylesheets
import style from "components/routes/Faq.module.scss";

const FrequentlyAskedQuestions = () => {
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
            no: `frequently-asked-questions/`,
            en: `frequently-asked-questions/`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch]);

    const renderSummarySnippet = (faqs) => {
        const faqItems = faqs.map((faq, index) => {
            return {
                "@type": "Question",
                name: faq.question[selectedLanguageKey],
                acceptedAnswer: {
                    "@type": "Answer",
                    text: formatContentAsString(faq.answer[selectedLanguageKey])
                }
            };
        });
        const snippet = {
            "@context": "http://schema.org",
            "@type": "FAQPage",
            mainEntity: faqItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderFrequentlyAskedQuestion = (faq, index) => {
        const question = faq.question[selectedLanguageKey];
        const answer = faq.answer[selectedLanguageKey];
        const id = convertToUrlFriendlyString(question);
        return (
            <ExpansionPanel elementId={id} panelTitle={question} key={index}>
                <div className={style.faqItem}>{formatContentWithReactLinks(answer, languageSlug)}</div>
            </ExpansionPanel>
        );
    };

    const renderFrequentlyAskedQuestions = () => {
        return frequentlyAskedQuestions.map((faq, index) => {
            return renderFrequentlyAskedQuestion(faq, index);
        });
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
                title: {
                    en: "Frequently Asked Questions | Dehli Musikk",
                    no: "Ofte stilte spørsmål | Dehli Musikk"
                },
                heading: {
                    en: "Frequently Asked Questions",
                    no: "Ofte stilte spørsmål"
                },
                description: {
                    en: "Frequently asked questions about Dehli Musikk, products, and services.",
                    no: "Ofte stilte spørsmål om Dehli Musikk, produkter og tjenester."
                }
            };

            let breadcrumbs = [
                {
                    name: listPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}frequently-asked-questions/`
                }
            ];

            const metaTitle = listPage.title[selectedLanguageKey];
            const contentTitle = listPage.heading[selectedLanguageKey];
            const metaDescription = listPage.description[selectedLanguageKey];

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
                            content={`https://www.dehlimusikk.no/${languageSlug}frequently-asked-questions/`}
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
                                ? "Here are some frequently asked questions about Dehli Musikk, my products, and services"
                                : "Her er noen ofte stilte spørsmål om Dehli Musikk, mine produkter og tjenester"}
                            .
                        </p>
                    </Container>
                    {renderSummarySnippet(frequentlyAskedQuestions)}
                    <Container>
                        <div className={style.listContainer}>{renderFrequentlyAskedQuestions()}</div></Container>
                </React.Fragment>
            );
        }
    }
};

export default FrequentlyAskedQuestions;
