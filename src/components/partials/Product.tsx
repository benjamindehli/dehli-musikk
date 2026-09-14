import type { Lang } from "lib/pageMetadata";
import type { ResponsiveImage } from "types/image";
import type { ContentLink, LinkedRelease, Product as ProductData } from "types/content";
// Dependencies
import JsonLd from "components/JsonLd";
import React from "react";

// Components
import Button from "components/partials/Button";
import ProductGallery from "components/partials/ProductGallery";
import ProductSpecs from "components/partials/ProductSpecs";
import Release from "components/partials//Portfolio/Release";
import ListItem from "components/template/List/ListItem";
import ListItemActionButtons from "components/template/List/ListItem/ListItemActionButtons";
import ListItemContent from "components/template/List/ListItem/ListItemContent";
import ListItemContentBody from "components/template/List/ListItem/ListItemContent/ListItemContentBody";
import ListItemContentHeader from "components/template/List/ListItem/ListItemContent/ListItemContentHeader";
import ListItemThumbnail from "components/template/List/ListItem/ListItemThumbnail";
import ListItemVideo from "components/template/List/ListItem/ListItemVideo";
import ExpansionPanel from "components/template/ExpansionPanel";
import List from "components/template/List";

// Helpers
import { getPrettyDate } from "helpers/dateFormatter";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentWithReactLinks } from "helpers/contentFormatter";
import { convertStringToExcerpt } from "helpers/search";
import { generateProductSnippet } from "helpers/richSnippetsGenerators";
import { getProductReleases } from "helpers/instrumentReleases";
import { getYouTubeId } from "helpers/youTube";

const Product = ({
    product,
    fullscreen = false,
    compact = false,
    priority = false,
    lang,
    languageSlug
}: {
    product: ProductData;
    fullscreen?: boolean;
    compact?: boolean;
    priority?: boolean;
    lang: Lang;
    languageSlug: string;
}) => {
    // The first card on a list page is usually the LCP element, so it loads eagerly
    // with a priority hint rather than being lazy like the cards below the fold.
    const loadingAttributes = priority ? ({ fetchPriority: "high" } as const) : ({ loading: "lazy" } as const);

    const renderProductSnippet = (product: ProductData) => {
        const productSnippet = generateProductSnippet(product, languageSlug, lang);
        return <JsonLd data={productSnippet} />;
    };

    const renderProductThumbnail = (image: ResponsiveImage, altText: string, fullscreen: boolean, compact: boolean) => {
        if (compact) {
            return (
                <React.Fragment>
                    <source srcSet={`${image.avif55} 1x, ${image.avif110} 2x`} type="image/avif" />
                    <source srcSet={`${image.webp55} 1x, ${image.webp110} 2x`} type="image/webp" />
                    <source srcSet={`${image.jpg55} 1x, ${image.jpg110} 2x`} type="image/jpeg" />
                    <img {...loadingAttributes} src={image.jpg55 as string} data-width="55" data-height="55" alt={altText} />
                </React.Fragment>
            );
        } else if (fullscreen) {
            return (
                <React.Fragment>
                    <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" media="(max-width: 407px)" />
                    <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" media="(max-width: 407px)" />
                    <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" media="(max-width: 407px)" />
                    <source srcSet={`${image.avif540}`} type="image/avif" />
                    <source srcSet={`${image.webp540}`} type="image/webp" />
                    <source srcSet={`${image.jpg540}`} type="image/jpeg" />
                    <img fetchPriority="high" src={image.jpg540 as string} data-width="540" data-height="400" alt={altText} />
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    <source srcSet={`${image.avif55} 1x, ${image.avif110} 2x`} type="image/avif" media="(max-width: 599px)" />
                    <source srcSet={`${image.webp55} 1x, ${image.webp110} 2x`} type="image/webp" media="(max-width: 599px)" />
                    <source srcSet={`${image.jpg55} 1x, ${image.jpg110} 2x`} type="image/jpeg" media="(max-width: 599px)" />
                    <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" />
                    <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" />
                    <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" />
                    <img {...loadingAttributes} src={image.jpg350 as string} data-width="350" data-height="260" alt={altText} />
                </React.Fragment>
            );
        }
    };

    /*
     * link is where the product is bought or downloaded, documentationLink an
     * optional second button for a docs or info page. Both carry their own text
     * per language, so the button says whatever the product data says.
     */
    /*
     * Keyed by role, not by url: a product may point both buttons at the same
     * page, which the free plugins do, and duplicate keys are an error React
     * only warns about before behaving unpredictably.
     */
    const renderActionLink = ({ role, actionLink }: { role: string; actionLink: ContentLink }) => {
        return (
            <a key={role} href={actionLink.url} target="_blank" rel="noopener noreferrer" title={actionLink.text[lang]}>
                <Button buttontype="minimal">{actionLink.text[lang]}</Button>
            </a>
        );
    };

    /*
     * The demo video, which 15 of the 18 products have and none of them showed:
     * it went into the product's JSON-LD as a VideoObject and nowhere else, so
     * the only way to reach it from a product page was to already know it
     * existed. For a sampled instrument it is the thing that actually sells the
     * product, so it sits directly under the buttons.
     *
     * ListItemVideo is the same facade the video pages use, so nothing is
     * requested from YouTube until the visitor presses play.
     *
     * The poster is the product's own photo rather than YouTube's thumbnail,
     * for the same reason: fetching the thumbnail would put a request to
     * i.ytimg.com on every product page, which is exactly what the facade
     * exists to avoid. It also costs nothing, because the candidate the browser
     * picks here is the one the main image above has already loaded.
     */
    const renderVideo = (product: ProductData, image: ResponsiveImage) => {
        const youTubeId = getYouTubeId(product.video?.contentUrl);
        if (!youTubeId) return null;
        return (
            <ListItemVideo
                videoTitle={product.video?.name?.[lang] ?? product.title}
                thumbnailDescription={product.thumbnailDescription}
                youTubeId={youTubeId}
                image={image}
                lang={lang}
            />
        );
    };

    const renderReleasesList = (releases: LinkedRelease[], lang: Lang, product: ProductData) => {
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
                    panelTitle={lang === "en" ? `Recordings with the ${product.title}` : `Utgivelser med ${product.title}`}
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
    // The cast states what the filter below guarantees: documentationLink is
    // optional, and the entries without one do not survive it.
    const actionLinks = (
        [
            { role: "primary", actionLink: product.link },
            { role: "documentation", actionLink: product.documentationLink }
        ] as { role: string; actionLink: ContentLink }[]
    ).filter(({ actionLink }) => actionLink?.url && actionLink?.text?.[lang]);

    return product && product.content && product.content[lang] ? (
        <React.Fragment>
            {fullscreen ? renderProductSnippet(product) : ""}
            <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
                {renderProductThumbnail(image, product.thumbnailDescription, fullscreen, compact)}
            </ListItemThumbnail>
            <ListItemContent fullscreen={fullscreen}>
                <ListItemContentHeader fullscreen={fullscreen} link={link}>
                    {fullscreen ? <h1>{product.title}</h1> : <h2>{product.title}</h2>}
                    {!compact && <time dateTime={productDate.toISOString()}>{getPrettyDate(productDate, lang)}</time>}
                </ListItemContentHeader>
                {!compact && <ListItemContentBody fullscreen={fullscreen}>{productDescription}</ListItemContentBody>}
                {actionLinks.length && fullscreen ? (
                    <ListItemActionButtons fullscreen={fullscreen}>{actionLinks.map(renderActionLink)}</ListItemActionButtons>
                ) : (
                    ""
                )}
                {/* Above the demo and the gallery: someone deciding whether
                    this runs on their machine should not have to scroll past
                    ten screenshots to find out. */}
                {fullscreen ? <ProductSpecs product={product} lang={lang} /> : ""}
                {fullscreen ? renderVideo(product, image) : ""}
                {fullscreen ? <ProductGallery filenames={product.additionalImages ?? []} productTitle={product.title} lang={lang} /> : ""}
            </ListItemContent>
            {fullscreen ? renderReleasesList(getProductReleases(productId), lang, product) : ""}
        </React.Fragment>
    ) : (
        ""
    );
};

export default Product;
