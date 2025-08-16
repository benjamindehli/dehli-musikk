// Dependencies
import React from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

// Components
import Button from "components/partials/Button";
import ListItemActionButtons from "components/template/List/ListItem/ListItemActionButtons";
import ListItemContent from "components/template/List/ListItem/ListItemContent";
import ListItemContentBody from "components/template/List/ListItem/ListItemContent/ListItemContentBody";
import ListItemContentHeader from "components/template/List/ListItem/ListItemContent/ListItemContentHeader";
import ListItemThumbnail from "components/template/List/ListItem/ListItemThumbnail";

// Selectors
import { getLanguageSlug } from "reducers/AvailableLanguagesReducer";

// Helpers
import { getPrettyDate } from "helpers/dateFormatter";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentWithReactLinks } from "helpers/contentFormatter";
import { convertStringToExcerpt } from "helpers/search";
import { generateProductSnippet, generateSoftwareApplicationSnippet } from "helpers/richSnippetsGenerators";

const Product = ({ product, fullscreen }) => {
    // Redux store
    const selectedLanguageKey = useSelector((state) => state.selectedLanguageKey);
    const languageSlug = useSelector((state) => getLanguageSlug(state));

    const renderProductSnippet = (product) => {
        const productSnippet = generateProductSnippet(product, languageSlug, selectedLanguageKey);
        const softwareApplicationSnippet = generateSoftwareApplicationSnippet(product, languageSlug);
        return (
            <Helmet>
                <script type="application/ld+json">{`${JSON.stringify(productSnippet)}`}</script>
                <script type="application/ld+json">{`${JSON.stringify(softwareApplicationSnippet)}`}</script>
            </Helmet>
        );
    };

    const renderProductThumbnail = (image, altText, fullscreen) => {
        const imageSize = fullscreen ? "540px" : "350px";

        const srcSets = {
            avif: `${image.avif55} 55w, ${image.avif350} 350w ${fullscreen ? `, ${image.avif540} 540w` : ""}`,
            webp: `${image.webp55} 55w, ${image.webp350} 350w ${fullscreen ? `, ${image.webp540} 540w` : ""}`,
            jpg: `${image.jpg55} 55w, ${image.jpg350} 350w ${fullscreen ? `, ${image.jpg540} 540w` : ""}`
        };

        return (
            <React.Fragment>
                <source sizes={imageSize} srcSet={srcSets.avif} type="image/avif" />
                <source sizes={imageSize} srcSet={srcSets.webp} type="image/webp" />
                <source sizes={imageSize} srcSet={srcSets.jpg} type="image/jpg" />
                <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} />
            </React.Fragment>
        );
    };

    const renderShopLink = (link) => {
        return (
            <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[selectedLanguageKey]}>
                <Button buttontype="minimal">{link.text[selectedLanguageKey]}</Button>
            </a>
        );
    };

    const productId = convertToUrlFriendlyString(product.title);
    const imagePathAvif = `data/products/thumbnails/web/avif/${productId}`;
    const imagePathWebp = `data/products/thumbnails/web/webp/${productId}`;
    const imagePathJpg = `data/products/thumbnails/web/jpg/${productId}`;
    const image = {
        avif55: require(`../../${imagePathAvif}_55.avif`),
        avif350: require(`../../${imagePathAvif}_350.avif`),
        avif540: require(`../../${imagePathAvif}_540.avif`),
        webp55: require(`../../${imagePathWebp}_55.webp`),
        webp350: require(`../../${imagePathWebp}_350.webp`),
        webp540: require(`../../${imagePathWebp}_540.webp`),
        jpg55: require(`../../${imagePathJpg}_55.jpg`),
        jpg350: require(`../../${imagePathJpg}_350.jpg`),
        jpg540: require(`../../${imagePathJpg}_540.jpg`)
    };
    const productDate = new Date(product.timestamp);
    const productPath = `/${languageSlug}products/${productId}/`;
    const productDescription = fullscreen ? (
        formatContentWithReactLinks(product.content[selectedLanguageKey], languageSlug)
    ) : (
        <p>{convertStringToExcerpt(product.content[selectedLanguageKey])}</p>
    );

    const link = {
        to: productPath,
        title: product.title
    };

    return product && product.content && product.content[selectedLanguageKey] ? (
        <React.Fragment>
            {fullscreen ? renderProductSnippet(product) : ""}
            <ListItemThumbnail fullscreen={fullscreen} link={link}>
                {renderProductThumbnail(image, product.thumbnailDescription, fullscreen)}
            </ListItemThumbnail>
            <ListItemContent fullscreen={fullscreen}>
                <ListItemContentHeader fullscreen={fullscreen} link={link}>
                    <h2>{product.title}</h2>
                    <time dateTime={productDate.toISOString()}>{getPrettyDate(productDate, selectedLanguageKey)}</time>
                </ListItemContentHeader>
                <ListItemContentBody fullscreen={fullscreen}>{productDescription}</ListItemContentBody>
                {product.link && fullscreen ? (
                    <ListItemActionButtons fullscreen={fullscreen}>
                        {renderShopLink(product.link)}
                    </ListItemActionButtons>
                ) : (
                    ""
                )}
            </ListItemContent>
        </React.Fragment>
    ) : (
        ""
    );
};

export default Product;
