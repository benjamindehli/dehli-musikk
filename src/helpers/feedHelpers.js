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

const renderMerchantItem = (product, lang, languageSlug) => {
    const productId = getProductId(product);
    const description = product.content[lang] ? formatContentAsString(product.content[lang]) : "";
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
        products.map((product) => renderMerchantItem(product, lang, languageSlug)).join("\n"),
        "\n</channel>\n</rss>"
    ].join("");
}

export function getLocalInventoryFeedXML(products, lang) {
    return [
        merchantFeedHeader,
        products.map((product) => renderLocalInventoryItem(product, lang)).join("\n"),
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
