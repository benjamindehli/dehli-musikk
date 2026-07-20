// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentAsString } from "helpers/contentFormatter";

const websiteUrl = "https://www.dehlimusikk.no";

const latestPostCount = 15;
const latestReleaseCount = 15;
const latestVideoCount = 10;

const truncate = (text, maxLength = 160) => {
    if (!text) return "";
    const flattened = text.replace(/\s+/g, " ").trim();
    if (flattened.length <= maxLength) return flattened;
    return `${flattened.slice(0, maxLength).replace(/[,;:\s]+\S*$/, "")}…`;
};

const isoDate = (timestamp) => new Date(timestamp).toISOString().slice(0, 10);

const renderProductLine = (product) => {
    const productId = convertToUrlFriendlyString(product.title);
    const description = product.content.en ? truncate(formatContentAsString(product.content.en)) : "";
    return `- [${product.title}](${websiteUrl}/en/products/${productId}/): ${description}`;
};

const renderPostLine = (post) => {
    const postId = convertToUrlFriendlyString(post.title.en);
    const description = post.content.en ? truncate(formatContentAsString(post.content.en), 120) : "";
    return `- [${post.title.en}](${websiteUrl}/en/posts/${postId}/) (${isoDate(post.timestamp)}): ${description}`;
};

const renderReleaseLine = (release) => {
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const genre = release.genre ? `${release.genre}, ` : "";
    return `- [${release.title} by ${release.artistName}](${websiteUrl}/en/portfolio/${releaseId}/) (${genre}${isoDate(release.releaseDate)})`;
};

const renderVideoLine = (video) => {
    const videoId = convertToUrlFriendlyString(video.title.en);
    const description = video.content.en ? truncate(formatContentAsString(video.content.en), 120) : "";
    return `- [${video.title.en}](${websiteUrl}/en/videos/${videoId}/) (${isoDate(video.timestamp)}): ${description}`;
};

export function getLlmsTxt({ posts, products, releases, videos }) {
    const latestPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp).slice(0, latestPostCount);
    const latestReleases = [...releases].sort((a, b) => b.releaseDate - a.releaseDate).slice(0, latestReleaseCount);
    const latestVideos = [...videos].sort((a, b) => b.timestamp - a.timestamp).slice(0, latestVideoCount);

    return [
        "# Dehli Musikk",
        "",
        "> Dehli Musikk is a sole proprietorship run by Benjamin Dehli in Bø i Telemark, Norway. It offers keyboard instrument tracks on recordings for artists and bands, and sells virtual sample-based instruments and patch libraries.",
        "",
        "English pages live under /en/; Norwegian versions of the same pages live at the site root (e.g. /products/ vs /en/products/).",
        "",
        "## Products",
        "",
        `Virtual instruments and patch libraries by Dehli Musikk (full list: ${websiteUrl}/en/products/). Purchases are handled on the external store at https://store.dehlimusikk.no/.`,
        "",
        products.map(renderProductLine).join("\n"),
        "",
        "## Releases",
        "",
        `The ${latestReleaseCount} most recent of ${releases.length} releases Dehli Musikk has contributed to (full portfolio: ${websiteUrl}/en/portfolio/).`,
        "",
        latestReleases.map(renderReleaseLine).join("\n"),
        "",
        "## Posts",
        "",
        `The ${latestPostCount} most recent of ${posts.length} posts (all posts: ${websiteUrl}/en/posts/).`,
        "",
        latestPosts.map(renderPostLine).join("\n"),
        "",
        "## Videos",
        "",
        `The ${latestVideoCount} most recent of ${videos.length} videos (all videos: ${websiteUrl}/en/videos/).`,
        "",
        latestVideos.map(renderVideoLine).join("\n"),
        "",
        "## Equipment",
        "",
        `- [Instruments](${websiteUrl}/en/equipment/instruments/): Instruments used during recording`,
        `- [Effects](${websiteUrl}/en/equipment/effects/): Effect pedals and processors used during recording`,
        `- [Amplifiers](${websiteUrl}/en/equipment/amplifiers/): Amplifiers used during recording`,
        "",
        "## Optional",
        "",
        `- [Frequently asked questions](${websiteUrl}/en/frequently-asked-questions/): Questions and answers about Dehli Musikk, products, and services`,
        `- [News feed](${websiteUrl}/feed-en.rss): RSS feed with the latest posts (Norwegian: ${websiteUrl}/feed-no.rss)`,
        `- [Sitemap](${websiteUrl}/sitemap.xml): All pages in both languages`,
        ""
    ].join("\n");
}
