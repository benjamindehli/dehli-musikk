// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentAsString } from "helpers/contentFormatter";

const websiteUrl = "https://www.dehlimusikk.no";
const feedPostCount = 20;

const channelInfo = {
    no: {
        title: "Dehli Musikk nyheter",
        description: "Siste nytt fra Dehli Musikk",
        feedFilename: "feed-no.rss",
        languageSlug: ""
    },
    en: {
        title: "Dehli Musikk news",
        description: "Latest news from Dehli Musikk",
        feedFilename: "feed-en.rss",
        languageSlug: "en/"
    }
};

const escapeXml = (value) =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");

const renderFeedItem = (post, lang, languageSlug) => {
    const postUrl = `${websiteUrl}/${languageSlug}posts/${convertToUrlFriendlyString(post.title[lang])}/`;
    const description = post.content[lang] ? formatContentAsString(post.content[lang]) : "";
    return [
        "<item>",
        `<title>${escapeXml(post.title[lang])}</title>`,
        `<description>${escapeXml(description)}</description>`,
        `<pubDate>${new Date(post.timestamp).toUTCString()}</pubDate>`,
        `<link>${postUrl}</link>`,
        `<guid>${postUrl}</guid>`,
        "<dc:creator>Benjamin Dehli</dc:creator>",
        "</item>"
    ].join("\n");
};

const STORE_CODE = "04516683628261596954";

const getProductId = (product) => convertToUrlFriendlyString(product.title);

/*
 * Merchant Center rejects an item priced at zero, for both Shopping ads and free
 * listings, so submitting one costs a standing disapproval and gains nothing.
 * The products priced at 0.00 are the free ones released on GitHub rather than
 * sold through the store, so there is no offer to submit for them in the first
 * place; they stay on the site and out of the feeds.
 *
 * Keyed on the price rather than on where the product is hosted because the
 * price is what Google actually validates: make one of these paid, or a paid one
 * free, and it enters or leaves the feed on its own.
 */
const isSellable = (product) => Number.parseFloat(product.price) > 0 && !!product.priceCurrency?.length;

const getSellableProducts = (products) => (products || []).filter(isSellable);

/*
 * Merchant Center caps g:description at 5000 characters and disapproves the item
 * that runs over. The longest product copy already sits within a hundred
 * characters of that, so cut here rather than wait for the next paragraph added
 * to a product page to take the item down with it.
 *
 * Applied to the text before escapeXml: an entity stands for the one character
 * it encodes, so it is the unescaped length the limit is about.
 */
const MAX_DESCRIPTION_LENGTH = 5000;

/*
 * Ending mid-sentence reads like the feed is broken, so back up to the last
 * sentence that fits. Only within this window though: dropping a trailing
 * paragraph is worth it, dropping most of the description to reach an early
 * full stop is not, and a description written without sentence breaks would
 * otherwise be cut to almost nothing.
 */
const SENTENCE_SEARCH_WINDOW = 500;

const capDescription = (description) => {
    if (description.length <= MAX_DESCRIPTION_LENGTH) return description;

    const head = description.slice(0, MAX_DESCRIPTION_LENGTH);
    const sentenceEnd = Math.max(head.lastIndexOf(". "), head.lastIndexOf("! "), head.lastIndexOf("? "));
    if (sentenceEnd >= MAX_DESCRIPTION_LENGTH - SENTENCE_SEARCH_WINDOW) {
        // Keeps the punctuation mark, drops the space that followed it
        return head.slice(0, sentenceEnd + 1);
    }

    // The ellipsis counts against the limit as well, so it needs its own room.
    // Falls back to the hard cut for text with no whitespace to break on, where
    // trimming the trailing word would leave nothing at all.
    const hardCut = head.slice(0, MAX_DESCRIPTION_LENGTH - 1);
    const atWordBoundary = hardCut.replace(/\s+\S*$/, "");
    return `${atWordBoundary || hardCut}…`;
};

const renderMerchantItem = (product, lang, languageSlug) => {
    const productId = getProductId(product);
    const description = product.content[lang] ? capDescription(formatContentAsString(product.content[lang])) : "";
    const additionalImageLinks = (product.additionalImages || []).map(
        (image) => `<g:additional_image_link>${websiteUrl}/product-images/${image}</g:additional_image_link>`
    );
    return [
        "<item>",
        `<g:id>${lang}-${productId}</g:id>`,
        `<g:title>${escapeXml(product.title)}</g:title>`,
        `<g:description>${escapeXml(description)}</g:description>`,
        `<g:link>${websiteUrl}/${languageSlug}products/${productId}/</g:link>`,
        `<g:image_link>${websiteUrl}/product-images/${product.mainImage}</g:image_link>`,
        ...additionalImageLinks,
        "<g:condition>new</g:condition>",
        "<g:availability>in stock</g:availability>",
        `<g:price>${product.price} ${product.priceCurrency}</g:price>`,
        "<g:google_product_category>313</g:google_product_category>",
        "<g:identifier_exists>no</g:identifier_exists>",
        "<g:adult>no</g:adult>",
        "<g:included_destination>Free listings</g:included_destination>",
        "<g:included_destination>Shopping ads</g:included_destination>",
        "<g:included_destination>Free local listings</g:included_destination>",
        "<g:brand>Dehli Musikk</g:brand>",
        `<g:product_type>${escapeXml(product.productType.join(" > "))}</g:product_type>`,
        "</item>"
    ].join("\n");
};

const renderLocalInventoryItem = (product, lang) => {
    return [
        "<item>",
        `<g:id>${lang}-${getProductId(product)}</g:id>`,
        `<g:store_code>${STORE_CODE}</g:store_code>`,
        "<g:availability>in stock</g:availability>",
        `<g:price>${product.price} ${product.priceCurrency}</g:price>`,
        "</item>"
    ].join("\n");
};

const merchantFeedHeader = [
    '<?xml version="1.0" encoding="UTF-8"?>\n',
    '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n',
    "<channel>\n",
    "<title>Products - Dehli Musikk</title>\n",
    `<link>${websiteUrl}/</link>\n`,
    "<description>Products from Dehli Musikk</description>\n"
].join("");

export function getMerchantFeedXML(products, lang) {
    const { languageSlug } = channelInfo[lang];
    return [
        merchantFeedHeader,
        getSellableProducts(products)
            .map((product) => renderMerchantItem(product, lang, languageSlug))
            .join("\n"),
        "\n</channel>\n</rss>"
    ].join("");
}

export function getLocalInventoryFeedXML(products, lang) {
    return [
        merchantFeedHeader,
        getSellableProducts(products)
            .map((product) => renderLocalInventoryItem(product, lang))
            .join("\n"),
        "\n</channel>\n</rss>"
    ].join("");
}

export function getRssFeedXML(posts, lang) {
    const { title, description, feedFilename, languageSlug } = channelInfo[lang];
    const latestPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp).slice(0, feedPostCount);
    return [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n',
        "<channel>\n",
        `<title>${title}</title>\n`,
        `<link>${websiteUrl}/${languageSlug}</link>\n`,
        `<atom:link href="${websiteUrl}/${feedFilename}" rel="self" type="application/rss+xml" />\n`,
        `<description>${description}</description>\n`,
        `<language>${lang}</language>\n`,
        latestPosts.map((post) => renderFeedItem(post, lang, languageSlug)).join("\n"),
        "\n</channel>\n</rss>"
    ].join("");
}
