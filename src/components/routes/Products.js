// Dependencies
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import { Navigate, useNavigate, useParams } from "react-router";

// Components
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";
import List from "components/template/List";
import ListItem from "components/template/List/ListItem";
import Modal from "components/template/Modal";
import Product from "components/partials/Product";

// Actions
import { updateMultilingualRoutes, updateSelectedLanguageKey } from "actions/LanguageActions";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentAsString, formatContentWithReactLinks } from "helpers/contentFormatter";

// Data
import products from "data/products";

const Products = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();
    const selectedProductId = params?.productId || null;

    // State
    const [selectedProduct, setSelectedProduct] = useState();

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
        setSelectedProduct(
            !!languageIsInitialized && !!selectedProductId
                ? getSelectedProduct(selectedProductId, selectedLanguageKey)
                : undefined
        );
    }, [params.selectedLanguage, selectedLanguageKey, selectedProductId]);

    useEffect(() => {
        const multilingualIds = {
            en: selectedProduct ? convertToUrlFriendlyString(selectedProduct.title) : "",
            no: selectedProduct ? convertToUrlFriendlyString(selectedProduct.title) : ""
        };
        const multilingualPaths = {
            no: `products/${selectedProduct ? multilingualIds.no + "/" : ""}`,
            en: `products/${selectedProduct ? multilingualIds.en + "/" : ""}`
        };
        dispatch(updateMultilingualRoutes(multilingualPaths, availableLanguages));
    }, [availableLanguages, dispatch, selectedProduct]);

    const renderSummarySnippet = (products) => {
        const productItems = products.map((product, index) => {
            return {
                "@type": "ListItem",
                position: index + 1,
                url: `https://www.dehlimusikk.no/${languageSlug}products/${selectedProductId}/`
            };
        });
        const snippet = {
            "@context": "http://schema.org",
            "@type": "ItemList",
            itemListElement: productItems
        };
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
            </Helmet>
        );
    };

    const renderProducts = () => {
        return products && products.length
            ? products.map((product) => {
                  const productId = convertToUrlFriendlyString(product.title);
                  return (
                      <ListItem key={productId}>
                          <Product product={product} />
                      </ListItem>
                  );
              })
            : "";
    };

    const renderSelectedProduct = (selectedProduct) => {
        const handleClickOutside = () => {
            navigate(`/${languageSlug}products/`);
        };
        const arrowLeftLink =
            selectedProduct && selectedProduct.previousProductId
                ? `/${languageSlug}products/${selectedProduct.previousProductId}/`
                : null;
        const arrowRightLink =
            selectedProduct && selectedProduct.nextProductId
                ? `/${languageSlug}products/${selectedProduct.nextProductId}/`
                : null;
        return selectedProduct ? (
            <Modal
                onClickOutside={handleClickOutside}
                maxWidth="540px"
                arrowLeftLink={arrowLeftLink}
                arrowRightLink={arrowRightLink}
                selectedLanguageKey={selectedLanguageKey}
            >
                <Product product={selectedProduct} fullscreen={true} />
            </Modal>
        ) : (
            ""
        );
    };

    const getSelectedProduct = (selectedProductId, selectedLanguageKey) => {
        let selectedProduct = null;
        products.forEach((product, index) => {
            const productId = convertToUrlFriendlyString(product.title);
            if (productId === selectedProductId) {
                selectedProduct = {
                    ...product,
                    previousProductId: index > 0 ? convertToUrlFriendlyString(products[index - 1].title) : null,
                    nextProductId:
                        index < products.length - 1 ? convertToUrlFriendlyString(products[index + 1].title) : null
                };
            }
        });
        return selectedProduct;
    };

    const languageIsInitialized = !params.selectedLanguage || params.selectedLanguage === selectedLanguageKey;
    const languageIsValid = !params.selectedLanguage || params.selectedLanguage === "en";

    if (!languageIsInitialized) {
        return "";
    } else {
        if (!languageIsValid) {
            return <Navigate to="/404" />;
        } else {
            if (selectedProductId && selectedProduct === null) {
                return <Navigate to="/404" />;
            }

            const listPage = {
                title: {
                    en: "Products | Dehli Musikk",
                    no: "Produkter | Dehli Musikk"
                },
                heading: {
                    en: "Products",
                    no: "Produkter"
                },
                description: {
                    en: "Products from Dehli Musikk",
                    no: "Produkter fra Dehli Musikk"
                }
            };

            const detailsPage = {
                title: {
                    en: `${selectedProduct ? selectedProduct.title : ""} - Products | Dehli Musikk`,
                    no: `${selectedProduct ? selectedProduct.title : ""} - Produkter | Dehli Musikk`
                },
                heading: {
                    en: selectedProduct ? selectedProduct.title : "",
                    no: selectedProduct ? selectedProduct.title : ""
                },
                description: {
                    en: selectedProduct ? formatContentAsString(selectedProduct.content.en) : "",
                    no: selectedProduct ? formatContentAsString(selectedProduct.content.no) : ""
                }
            };

            let breadcrumbs = [
                {
                    name: listPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}products/`
                }
            ];
            if (selectedProduct) {
                breadcrumbs.push({
                    name: detailsPage.heading[selectedLanguageKey],
                    path: `/${languageSlug}products/${selectedProductId}/`
                });
            }

            const metaTitle = selectedProduct
                ? detailsPage.title[selectedLanguageKey]
                : listPage.title[selectedLanguageKey];
            const contentTitle = selectedProduct
                ? detailsPage.heading[selectedLanguageKey]
                : listPage.heading[selectedLanguageKey];
            const metaDescription = selectedProduct
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
                            content={`https://www.dehlimusikk.no/${languageSlug}products/${
                                selectedProduct ? selectedProductId + "/" : ""
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
                    <Container blur={!!selectedProduct}>
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                        <h1>{contentTitle}</h1>
                        {selectedProduct ? (
                            formatContentWithReactLinks(selectedProduct.content[selectedLanguageKey], languageSlug)
                        ) : (
                            <p>
                                {selectedLanguageKey === "en"
                                    ? "Products from Dehli Musikk"
                                    : "Produkter fra Dehli Musikk"}
                            </p>
                        )}
                    </Container>
                    {selectedProduct ? renderSelectedProduct(selectedProduct) : renderSummarySnippet(products)}
                    <Container blur={!!selectedProduct}>
                        <List>{renderProducts()}</List>
                    </Container>
                </React.Fragment>
            );
        }
    }
};

export default Products;
