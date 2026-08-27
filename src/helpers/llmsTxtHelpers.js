// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { formatContentAsString } from "helpers/contentFormatter";
import { getPriceCurrency, hasPrice } from "helpers/productPricing";

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
    // The /video/ URL is the canonical one: /en/videos/{slug}/ canonicalises to it
    return `- [${video.title.en}](${websiteUrl}/en/videos/${videoId}/video/) (${isoDate(video.timestamp)}): ${description}`;
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
        `- [Full text](${websiteUrl}/llms-full.txt): Every page's complete text in one file, rather than links to it`,
        `- [News feed](${websiteUrl}/feed-en.rss): RSS feed with the latest posts (Norwegian: ${websiteUrl}/feed-no.rss)`,
        `- [Sitemap](${websiteUrl}/sitemap.xml): All pages in both languages`,
        ""
    ].join("\n");
}

/*
 * The companion to llms.txt: the same material with each page's text inlined
 * instead of linked, so a reader needs one request rather than sixty. Unlike
 * llms.txt this covers every item rather than the most recent handful, and does
 * not truncate.
 *
 * llms-full.txt is a widely followed convention rather than part of the llms.txt
 * specification, so it is kept deliberately plain: headings, then prose.
 */
const renderFullEntry = (heading, url, meta, body) =>
    [`### ${heading}`, "", `URL: ${url}`, ...(meta ? [meta, ""] : [""]), ...(body ? [body, ""] : [])].join("\n");

const renderFullProduct = (product) => {
    const productId = convertToUrlFriendlyString(product.title);
    /*
     * "from", because the price on a store product is a pay what you want
     * minimum. Zero reads as free rather than as "0.00 USD", which was both ugly
     * and easy to mistake for a missing value.
     */
    const price = hasPrice(product) ? `from ${product.price} ${getPriceCurrency(product)}` : "free";
    const meta = [`Price: ${price}`, product.productType?.length ? `Type: ${product.productType.join(" > ")}` : null, product.link?.url ? `Store: ${product.link.url}` : null]
        .filter(Boolean)
        .join("\n");
    return renderFullEntry(product.title, `${websiteUrl}/en/products/${productId}/`, meta, product.content?.en ? formatContentAsString(product.content.en) : "");
};

const renderFullPost = (post) => {
    const postId = convertToUrlFriendlyString(post.title.en);
    return renderFullEntry(post.title.en, `${websiteUrl}/en/posts/${postId}/`, `Published: ${isoDate(post.timestamp)}`, post.content?.en ? formatContentAsString(post.content.en) : "");
};

const renderFullVideo = (video) => {
    const videoId = convertToUrlFriendlyString(video.title.en);
    const meta = [`Published: ${isoDate(video.timestamp)}`, `Watch: https://www.youtube.com/watch?v=${video.youTubeId}`].join("\n");
    return renderFullEntry(video.title.en, `${websiteUrl}/en/videos/${videoId}/video/`, meta, video.content?.en ? formatContentAsString(video.content.en) : "");
};

// Releases hold no prose, so they contribute their metadata instead
const renderFullRelease = (release) => {
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const meta = [
        `Artist: ${release.artistName}`,
        release.genre ? `Genre: ${release.genre}` : null,
        release.releaseDate ? `Released: ${isoDate(release.releaseDate)}` : null,
        release.isrcCode ? `ISRC: ${release.isrcCode}` : null,
        release.links?.spotify ? `Listen: ${release.links.spotify}` : null
    ]
        .filter(Boolean)
        .join("\n");
    return renderFullEntry(`${release.title} by ${release.artistName}`, `${websiteUrl}/en/portfolio/${releaseId}/`, meta, "");
};

const renderFullFaq = (faq) => [`### ${faq.question.en}`, "", formatContentAsString(faq.answer.en), ""].join("\n");

export function getLlmsFullTxt({ posts, products, releases, videos, frequentlyAskedQuestions }) {
    const byNewest = (items, dateKey = "timestamp") => [...items].sort((a, b) => b[dateKey] - a[dateKey]);

    return [
        "# Dehli Musikk",
        "",
        "> Dehli Musikk is a sole proprietorship run by Benjamin Dehli in Bø i Telemark, Norway. It offers keyboard instrument tracks on recordings for artists and bands, and sells virtual sample-based instruments and patch libraries.",
        "",
        `This is the full text of the English pages. Norwegian versions of every page live at the site root rather than under /en/. For a linked overview instead, see ${websiteUrl}/llms.txt.`,
        "",
        `## Products (${products.length})`,
        "",
        products.map(renderFullProduct).join("\n"),
        `## Posts (${posts.length})`,
        "",
        byNewest(posts).map(renderFullPost).join("\n"),
        `## Videos (${videos.length})`,
        "",
        byNewest(videos).map(renderFullVideo).join("\n"),
        `## Releases (${releases.length})`,
        "",
        byNewest(releases, "releaseDate").map(renderFullRelease).join("\n"),
        `## Frequently asked questions (${frequentlyAskedQuestions.length})`,
        "",
        frequentlyAskedQuestions.map(renderFullFaq).join("\n")
    ].join("\n");
}
