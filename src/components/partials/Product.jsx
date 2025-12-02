// Dependencies
import React from "react";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

// Components
import Button from "./Button";
import Release from "./Portfolio/Release";
import ListItem from "../template/List/ListItem";
import ListItemActionButtons from "../template/List/ListItem/ListItemActionButtons";
import ListItemContent from "../template/List/ListItem/ListItemContent";
import ListItemContentBody from "../template/List/ListItem/ListItemContent/ListItemContentBody";
import ListItemContentHeader from "../template/List/ListItem/ListItemContent/ListItemContentHeader";
import ListItemThumbnail from "../template/List/ListItem/ListItemThumbnail";
import ExpansionPanel from "../template/ExpansionPanel";
import List from "../template/List";

// Selectors
import { getLanguageSlug } from "../../reducers/AvailableLanguagesReducer";

// Helpers
import { getPrettyDate } from "../../helpers/dateFormatter";
import { convertToUrlFriendlyString } from "../../helpers/urlFormatter";
import { formatContentWithReactLinks } from "../../helpers/contentFormatter";
import { convertStringToExcerpt } from "../../helpers/search";
import { generateProductSnippet, generateSoftwareApplicationSnippet } from "../../helpers/richSnippetsGenerators";
import { getProductReleases } from "../../helpers/instrumentReleases";

const Product = ({ product, fullscreen, compact }) => {
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

    const renderProductThumbnail = (image, altText, fullscreen, compact) => {
        if (compact) {
            return (<React.Fragment>
                <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" />
                <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" />
                <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" />
                <img loading="lazy" src={image.jpg55} data-width="55" data-height="55" alt={altText} />
            </React.Fragment>);
        } else if (fullscreen){
            return (<React.Fragment>
                <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" media='(max-width: 407px)' />
                <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" media='(max-width: 407px)' />
                <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" media='(max-width: 407px)' />
                <source srcSet={`${image.avif540} 1x, ${image.avif540} 2x`} type="image/avif" />
                <source srcSet={`${image.webp540} 1x, ${image.webp540} 2x`} type="image/webp" />
                <source srcSet={`${image.jpg540} 1x, ${image.jpg540} 2x`} type="image/jpg" />
                <img fetchpriority="high" src={image.jpg540} data-width="540" data-height="400" alt={altText} />
            </React.Fragment>);
        } else {
        return (<React.Fragment>
            <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" media='(max-width: 599px)' />
            <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" media='(max-width: 599px)' />
            <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" media='(max-width: 599px)' />
            <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" />
            <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" />
            <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" />
            <img loading="lazy" src={image.jpg350} data-width="350" data-height="260" alt={altText} />
        </React.Fragment>);
        }
    };

    const renderShopLink = (link) => {
        return (
            <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[selectedLanguageKey]}>
                <Button buttontype="minimal">{link.text[selectedLanguageKey]}</Button>
            </a>
        );
    };

    const renderReleasesList = (releases, selectedLanguageKey, product) => {
        const productId = convertToUrlFriendlyString(product.title);
        const elementId = `product-releases-${productId}`;
        if (releases && releases.length) {
            const listItems = releases.map((release) => {
                return (
                    <ListItem key={release.releaseId} compact={true}>
                        <Release release={release} compact={true} />
                    </ListItem>
                );
            });
            return (
                <ExpansionPanel
                    elementId={elementId}
                    panelTitle={
                        selectedLanguageKey === "en"
                            ? `Recordings with the ${product.title}`
                            : `Utgivelser med ${product.title}`
                    }
                >
                    <List compact={true}>{listItems}</List>
                </ExpansionPanel>
            );
        } else {
            return "";
        }
    };

    const productId = convertToUrlFriendlyString(product.title);
    const imagePathAvif = `data/products/thumbnails/web/avif/${productId}`;
    const imagePathWebp = `data/products/thumbnails/web/webp/${productId}`;
    const imagePathJpg = `data/products/thumbnails/web/jpg/${productId}`;
    const image = {
        avif55: require(`../../${imagePathAvif}_55.avif`)?.default,
        avif350: require(`../../${imagePathAvif}_350.avif`)?.default,
        avif540: require(`../../${imagePathAvif}_540.avif`)?.default,
        webp55: require(`../../${imagePathWebp}_55.webp`)?.default,
        webp350: require(`../../${imagePathWebp}_350.webp`)?.default,
        webp540: require(`../../${imagePathWebp}_540.webp`)?.default,
        jpg55: require(`../../${imagePathJpg}_55.jpg`)?.default,
        jpg350: require(`../../${imagePathJpg}_350.jpg`)?.default,
        jpg540: require(`../../${imagePathJpg}_540.jpg`)?.default
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
            {
            fullscreen 
                ? <Helmet>
                    <link rel="preload" as="image" href={image.avif350} fetchpriority="high" type="image/avif" media='(max-width: 407px)'/>
                    <link rel="preload" as="image" href={image.avif540} fetchpriority="high" type="image/avif" media='(min-width: 408px)'/>
                </Helmet>
                : ""
            }
            {fullscreen ? renderProductSnippet(product) : ""}
            <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
                {renderProductThumbnail(image, product.thumbnailDescription, fullscreen, compact)}
            </ListItemThumbnail>
            <ListItemContent fullscreen={fullscreen}>
                <ListItemContentHeader fullscreen={fullscreen} link={link}>
                    {
                        fullscreen ? <h1>{product.title}</h1> : <h2>{product.title}</h2>
                    }
                    {!compact && (
                        <time dateTime={productDate.toISOString()}>
                            {getPrettyDate(productDate, selectedLanguageKey)}
                        </time>
                    )}
                </ListItemContentHeader>
                {!compact && <ListItemContentBody fullscreen={fullscreen}>{productDescription}</ListItemContentBody>}
                {product.link && fullscreen ? (
                    <ListItemActionButtons fullscreen={fullscreen}>
                        {renderShopLink(product.link)}
                    </ListItemActionButtons>
                ) : (
                    ""
                )}
            </ListItemContent>
            {fullscreen ? renderReleasesList(getProductReleases(productId), selectedLanguageKey, product) : ""}
        </React.Fragment>
    ) : (
        ""
    );
};

export default Product;
