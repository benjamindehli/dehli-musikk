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
