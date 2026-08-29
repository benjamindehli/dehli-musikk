// Dependencies
import JsonLd from 'components/JsonLd';
import React from "react";

// Components
import Button from "components/partials/Button";
import Release from "components/partials//Portfolio/Release";
import ListItem from "components/template/List/ListItem";
import ListItemActionButtons from "components/template/List/ListItem/ListItemActionButtons";
import ListItemContent from "components/template/List/ListItem/ListItemContent";
import ListItemContentBody from "components/template/List/ListItem/ListItemContent/ListItemContentBody";
import ListItemContentHeader from "components/template/List/ListItem/ListItemContent/ListItemContentHeader";
import ListItemThumbnail from "components/template/List/ListItem/ListItemThumbnail";
import ExpansionPanel from "components/template/ExpansionPanel";
import List from "components/template/List";

// Helpers
import { getPrettyDate } from "helpers/dateFormatter";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentWithReactLinks } from "helpers/contentFormatter";
import { convertStringToExcerpt } from "helpers/search";
import { generateProductSnippet } from "helpers/richSnippetsGenerators";
import { getProductReleases } from "helpers/instrumentReleases";

const Product = ({ product, fullscreen = false, compact = false, priority = false, lang, languageSlug }) => {
  // The first card on a list page is usually the LCP element, so it loads eagerly
  // with a priority hint rather than being lazy like the cards below the fold.
  const loadingAttributes = priority ? { fetchPriority: 'high' } : { loading: 'lazy' };

    const renderProductSnippet = (product) => {
        const productSnippet = generateProductSnippet(product, languageSlug, lang);
        return <JsonLd data={productSnippet} />;
    };

    const renderProductThumbnail = (image, altText, fullscreen, compact) => {
        if (compact) {
            return (<React.Fragment>
                <source srcSet={`${image.avif55} 1x, ${image.avif110} 2x`} type="image/avif" />
                <source srcSet={`${image.webp55} 1x, ${image.webp110} 2x`} type="image/webp" />
                <source srcSet={`${image.jpg55} 1x, ${image.jpg110} 2x`} type="image/jpeg" />
                <img {...loadingAttributes} src={image.jpg55} data-width="55" data-height="55" alt={altText} />
            </React.Fragment>);
        } else if (fullscreen){
            return (<React.Fragment>
                <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" media='(max-width: 407px)' />
                <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" media='(max-width: 407px)' />
                <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" media='(max-width: 407px)' />
                <source srcSet={`${image.avif540}`} type="image/avif" />
                <source srcSet={`${image.webp540}`} type="image/webp" />
                <source srcSet={`${image.jpg540}`} type="image/jpeg" />
                <img fetchPriority="high" src={image.jpg540} data-width="540" data-height="400" alt={altText} />
            </React.Fragment>);
        } else {
        return (<React.Fragment>
            <source srcSet={`${image.avif55} 1x, ${image.avif110} 2x`} type="image/avif" media='(max-width: 599px)' />
            <source srcSet={`${image.webp55} 1x, ${image.webp110} 2x`} type="image/webp" media='(max-width: 599px)' />
            <source srcSet={`${image.jpg55} 1x, ${image.jpg110} 2x`} type="image/jpeg" media='(max-width: 599px)' />
            <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" />
            <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" />
            <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" />
            <img {...loadingAttributes} src={image.jpg350} data-width="350" data-height="260" alt={altText} />
        </React.Fragment>);
        }
    };

    /*
     * link is where the product is bought or downloaded, documentationLink an
     * optional second button for a docs or info page. Both carry their own text
     * per language, so the button says whatever the product data says.
     */
    const renderActionLink = (actionLink) => {
        return (
            <a
                key={actionLink.url}
                href={actionLink.url}
                target="_blank"
                rel="noopener noreferrer"
                title={actionLink.text[lang]}
            >
                <Button buttontype="minimal">{actionLink.text[lang]}</Button>
            </a>
        );
    };

    const renderReleasesList = (releases, lang, product) => {
        const productId = convertToUrlFriendlyString(product.title);
        const elementId = `product-releases-${productId}`;
        if (releases && releases.length) {
            const listItems = releases.map((release) => {
                return (
                    <ListItem key={release.releaseId} compact={true}>
                        <Release release={release} compact={true} lang={lang} languageSlug={languageSlug} />
                    </ListItem>
                );
            });
            return (
                <ExpansionPanel
                    elementId={elementId}
                    panelTitle={
                        lang === "en"
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
    const image = {
        avif55: `/data/products/web/avif/${productId}_55.avif`,
    avif110: `/data/products/web/avif/${productId}_110.avif`,
        avif350: `/data/products/web/avif/${productId}_350.avif`,
        avif540: `/data/products/web/avif/${productId}_540.avif`,
        webp55: `/data/products/web/webp/${productId}_55.webp`,
    webp110: `/data/products/web/webp/${productId}_110.webp`,
        webp350: `/data/products/web/webp/${productId}_350.webp`,
        webp540: `/data/products/web/webp/${productId}_540.webp`,
        jpg55: `/data/products/web/jpg/${productId}_55.jpg`,
    jpg110: `/data/products/web/jpg/${productId}_110.jpg`,
        jpg350: `/data/products/web/jpg/${productId}_350.jpg`,
        jpg540: `/data/products/web/jpg/${productId}_540.jpg`
    };
    const productDate = new Date(product.timestamp);
    const productPath = `/${languageSlug}products/${productId}/`;
    const productDescription = fullscreen ? (
        formatContentWithReactLinks(product.content[lang], languageSlug)
    ) : (
        <p>{convertStringToExcerpt(product.content[lang])}</p>
    );

    const link = {
        to: productPath,
        title: product.title
    };

    // Ordered as the buttons appear: where to get it first, then where to read
    // about it. A product with neither renders no button row at all.
    const actionLinks = [product.link, product.documentationLink].filter(
        (actionLink) => actionLink?.url && actionLink?.text?.[lang]
    );

    return product && product.content && product.content[lang] ? (
        <React.Fragment>
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
                            {getPrettyDate(productDate, lang)}
                        </time>
                    )}
                </ListItemContentHeader>
                {!compact && <ListItemContentBody fullscreen={fullscreen}>{productDescription}</ListItemContentBody>}
                {actionLinks.length && fullscreen ? (
                    <ListItemActionButtons fullscreen={fullscreen}>
                        {actionLinks.map(renderActionLink)}
                    </ListItemActionButtons>
                ) : (
                    ""
                )}
            </ListItemContent>
            {fullscreen ? renderReleasesList(getProductReleases(productId), lang, product) : ""}
        </React.Fragment>
    ) : (
        ""
    );
};

export default Product;
