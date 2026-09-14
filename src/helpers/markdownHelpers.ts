import type { Lang } from "lib/pageMetadata";
import type { EquipmentItemData, EquipmentTypeKey } from "data/equipment";
import type { ContentLink, Localized, Post, PostLink, Product, Release, Video } from "types/content";

/*
 * The user-facing strings, in both languages. The five function-valued members
 * take a value the sentence has to agree with grammatically, which is why they
 * are not plain strings: Norwegian lower-cases what English capitalises, and
 * the price line differs in word order.
 */
type Translations = {
    siteDescription: string;
    home: string;
    homeDescription: string;
    posts: string;
    postsDescription: string;
    products: string;
    productsDescription: string;
    videos: string;
    videosDescription: string;
    portfolio: string;
    portfolioDescription: string;
    equipment: string;
    equipmentDescription: string;
    equipmentTypeDescription: (typeName: string) => string;
    faq: string;
    faqDescription: string;
    latestPosts: string;
    latestReleases: string;
    latestVideos: string;
    latestProducts: string;
    artists: string;
    seeAll: (label: string) => string;
    byConnector: string;
    listenTo: (title: string, artistName: string) => string;
    published: string;
    price: string;
    free: string;
    priceFrom: (amount: string, currency: string) => string;
    productType: string;
    formats: string;
    operatingSystem: string;
    softwareVersion: string;
    fileSize: string;
    license: string;
    store: string;
    documentation: string;
    alsoAt: string;
    readMore: string;
    watch: string;
    duration: string;
    chapters: string;
    artist: string;
    genre: string;
    released: string;
    listen: string;
    sampledInProducts: string;
    recordedThroughInProducts: string;
    productsForItem: string;
    usedInVideos: string;
    heardOnReleases: string;
    alsoAvailableAs: (url: string) => string;
    translationLabel: string;
};

/* The head every markdown twin shares, plus the body the caller assembled. */
type MarkdownDocumentInput = {
    lang: Lang;
    type: string;
    title: string;
    description: string;
    paths: Localized;
    published?: number;
    modified?: number;
    body: string[];
};

/*
 * Markdown representations of the site's pages: one document per page URL,
 * published as an index.md sibling of the page it mirrors.
 *
 * Built from the same data the pages render rather than by converting the
 * exported HTML. Detail pages draw their sibling list behind the modal as a
 * backdrop, so the HTML of one product page also contains twelve other products;
 * converting that would hand a reader the backdrop as though it were the
 * content. Going back to the data also keeps the links intact, which an HTML
 * conversion would have to recover from markup.
 *
 * The headings and section labels below deliberately duplicate the ones in
 * components/pages/*. Importing those modules would pull JSX and stylesheets
 * into a route handler that emits plain text, and the strings are page titles
 * that change about as often as the routes themselves.
 */

// Helpers
import { formatContentAsMarkdown, formatContentAsString } from "helpers/contentText";
import { getEquipmentItemDescription } from "helpers/equipmentDescription";
import { getInstrumentReleases } from "helpers/instrumentReleases";
import { getVideosForEquipmentItem } from "helpers/equipmentUsage";
import { getProductsForEquipmentItem } from "helpers/productEquipment";
import { getArtistNamesStringFromReleases } from "helpers/releaseHelpers";
import { getAdditionalProductLinks } from "helpers/productLinks";
import { getPriceCurrency, hasPrice } from "helpers/productPricing";
import { formatProductFormats } from "helpers/productSpecs";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";

// Lib
import { getLanguageSlug } from "lib/i18n";
import { alternateUrls, otherLang, WEBSITE_URL } from "lib/pageMetadata";
import { getStreamingServiceName } from "lib/streamingServices";

// Data
import equipment from "data/equipment";
import frequentlyAskedQuestions from "data/frequentlyAskedQuestions";
import posts, { latestPosts } from "data/posts";
import products, { latestProducts } from "data/products";
import releases, { latestReleases } from "data/portfolio";
import videos, { latestVideos } from "data/videos";

const EQUIPMENT_TYPES: EquipmentTypeKey[] = ["instruments", "effects", "amplifiers"];

const translations: Record<Lang, Translations> = {
    no: {
        siteDescription:
            "Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli i Bø i Telemark som tilbyr spilling av tangentinstrumenter på låter for artister og band, og som selger virtuelle sample-baserte instrumenter og patch-biblioteker.",
        home: "Dehli Musikk",
        homeDescription:
            "Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band",
        posts: "Innlegg",
        postsDescription: "Siste oppdateringer fra Dehli Musikk",
        products: "Produkter",
        productsDescription: "Produkter fra Dehli Musikk",
        videos: "Videoer",
        videosDescription: "Videoer Dehli Musikk har laget eller bidratt på",
        portfolio: "Portefølje",
        portfolioDescription: "Utgivelser Dehli Musikk har bidratt på",
        equipment: "Utstyr",
        equipmentDescription: "Utstyr jeg bruker under innspilling",
        equipmentTypeDescription: (typeName: string) => `${typeName} jeg bruker under innspilling`,
        faq: "Ofte stilte spørsmål",
        faqDescription: "Ofte stilte spørsmål om Dehli Musikk, produkter og tjenester.",
        latestPosts: "Siste oppdateringer",
        latestReleases: "Siste utgivelser",
        latestVideos: "Siste videoer",
        latestProducts: "Nyeste produkter",
        artists: "Artister som Dehli Musikk har samarbeidet med",
        seeAll: (label: string) => `Se alle ${label.toLowerCase()}`,
        byConnector: "av",
        listenTo: (title: string, artistName: string) => `Lytt til låta ${title} av ${artistName}`,
        published: "Publisert",
        price: "Pris",
        free: "gratis",
        priceFrom: (amount: string, currency: string) => `fra ${amount} ${currency}`,
        productType: "Type",
        formats: "Formater",
        operatingSystem: "Operativsystem",
        softwareVersion: "Versjon",
        fileSize: "Størrelse",
        license: "Lisens",
        store: "Butikk",
        documentation: "Dokumentasjon",
        alsoAt: "Også på",
        readMore: "Les mer",
        watch: "Se video",
        duration: "Varighet",
        chapters: "Kapitler",
        artist: "Artist",
        genre: "Sjanger",
        released: "Utgitt",
        listen: "Lytt",
        sampledInProducts: "Samplet i produkter",
        recordedThroughInProducts: "Brukt som effekt på produkter",
        productsForItem: "Produkter for dette utstyret",
        usedInVideos: "Brukt i videoer",
        heardOnReleases: "Hørt på utgivelser",
        alsoAvailableAs: (url: string) => `Denne siden finnes også som HTML: ${url}`,
        translationLabel: "På engelsk"
    },
    en: {
        siteDescription:
            "Dehli Musikk is a sole proprietorship run by Benjamin Dehli in Bø i Telemark, Norway, offering keyboard instrument tracks on recordings for artists and bands, and selling virtual sample-based instruments and patch libraries.",
        home: "Dehli Musikk",
        homeDescription:
            "Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands",
        posts: "Posts",
        postsDescription: "Latest update from Dehli Musikk",
        products: "Products",
        productsDescription: "Products from Dehli Musikk",
        videos: "Videos",
        videosDescription: "Videos Dehli Musikk has created or contributed in",
        portfolio: "Portfolio",
        portfolioDescription: "Recordings where Dehli Musikk has contributed",
        equipment: "Equipment",
        equipmentDescription: "Equipment I use during recording",
        equipmentTypeDescription: (typeName: string) => `${typeName} I use during recording`,
        faq: "Frequently Asked Questions",
        faqDescription: "Frequently asked questions about Dehli Musikk, products, and services.",
        latestPosts: "Latest updates",
        latestReleases: "Latest releases",
        latestVideos: "Latest videos",
        latestProducts: "Newest products",
        artists: "Artists who have collaborated with Dehli Musikk",
        seeAll: (label: string) => `See all ${label.toLowerCase()}`,
        byConnector: "by",
        listenTo: (title: string, artistName: string) => `Listen to the track ${title} by ${artistName}`,
        published: "Published",
        price: "Price",
        free: "free",
        priceFrom: (amount: string, currency: string) => `from ${amount} ${currency}`,
        productType: "Type",
        formats: "Formats",
        operatingSystem: "Operating system",
        softwareVersion: "Version",
        fileSize: "Size",
        license: "Licence",
        store: "Store",
        documentation: "Documentation",
        alsoAt: "Also at",
        readMore: "Read more",
        watch: "Watch",
        duration: "Duration",
        chapters: "Chapters",
        artist: "Artist",
        genre: "Genre",
        released: "Released",
        listen: "Listen",
        sampledInProducts: "Sampled in products",
        recordedThroughInProducts: "Used as an effect on products",
        productsForItem: "Products for this equipment",
        usedInVideos: "Used in videos",
        heardOnReleases: "Heard on recordings",
        alsoAvailableAs: (url: string) => `This page is also available as HTML: ${url}`,
        translationLabel: "In Norwegian"
    }
};

/* --- formatting primitives ------------------------------------------------ */

const isoDate = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);

const truncate = (text: string | null | undefined, maxLength = 200): string => {
    if (!text) return "";
    const flattened = text.replace(/\s+/g, " ").trim();
    if (flattened.length <= maxLength) return flattened;
    return `${flattened.slice(0, maxLength).replace(/[,;:\s]+\S*$/, "")}…`;
};

/*
 * A JSON string is also a valid YAML string, so encoding every value this way
 * sidesteps the quoting rules for titles that contain a colon, a quote or a
 * leading character YAML treats as syntax. "microSAMPLER Editor / Librarian" and
 * "nanobox | lemondrop" are both real titles in the data.
 */
const frontMatter = (fields: Record<string, unknown>) =>
    [
        "---",
        ...Object.entries(fields)
            .filter(([, value]) => value !== null && value !== undefined && value !== "")
            .map(([key, value]) => `${key}: ${JSON.stringify(String(value))}`),
        "---"
    ].join("\n");

const absoluteUrl = (lang: Lang, path: string) => `${WEBSITE_URL}/${getLanguageSlug(lang)}${path}`;

const contentToMarkdown = (content: string | null | undefined, lang: Lang) => formatContentAsMarkdown(content, WEBSITE_URL, getLanguageSlug(lang));

/*
 * Only emits the heading when the section has something under it, so an
 * equipment item that appears in no videos does not get an empty "Used in
 * videos" heading.
 */
const section = (heading: string, lines: string[]) => (lines && lines.length ? [`## ${heading}`, "", ...lines, ""] : []);

/*
 * A link on a post is either external, where url is a plain string, or internal,
 * where url is a site-relative path per language that still needs the language
 * slug in front of it. Product links are always the external shape. Post.js
 * branches on link.internal the same way.
 */
const linkTo = (link: PostLink | ContentLink | undefined, lang: Lang): string | null => {
    if (!link?.url) return null;
    // Only a PostLink carries `internal`; a ContentLink is always external.
    const url = (link as PostLink).internal ? absoluteUrl(lang, (link.url as Localized)[lang]) : (link.url as string);
    return `[${link.text[lang]}](${url})`;
};

/*
 * An array value becomes a nested list under its label rather than a comma run,
 * so that a label carrying several URLs stays one item of the same list as the
 * single-value labels around it.
 */
const metaList = (entries: [string, unknown][]) => {
    const lines = entries
        .filter(([, value]) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && !value.length))
        .map(([label, value]) =>
            Array.isArray(value) ? [`- ${label}:`, ...value.map((item) => `    - ${item}`)].join("\n") : `- ${label}: ${value}`
        );
    return lines.length ? [...lines, ""] : [];
};

/**
 * Assembles one markdown document. Every page's markdown gets the same head:
 * front matter a parser can read, then the page's own heading.
 */
function markdownDocument({ lang, type, title, description, paths, published, modified, body }: MarkdownDocumentInput) {
    const urls = alternateUrls(paths);
    const t = translations[lang];
    return [
        frontMatter({
            title,
            description,
            url: urls[lang],
            language: lang,
            translation: urls[otherLang(lang)],
            type,
            published: published ? isoDate(published) : null,
            modified: modified ? isoDate(modified) : null
        }),
        "",
        `# ${title}`,
        "",
        ...body,
        "---",
        "",
        t.alsoAvailableAs(urls[lang]),
        ""
    ].join("\n");
}

/*
 * The route handlers all end the same way. The Content-Type matters only to
 * `next dev`: the static export writes the body straight to a .md file and the
 * host types it from the extension.
 *
 * A generator returns null when nothing matches the id. generateStaticParams
 * only ever produces ids that do match, so this is a guard against a params list
 * and a lookup drifting apart rather than something the build hits.
 */
export function markdownResponse(body: string) {
    if (body === null) {
        return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
    }
    return new Response(body, { headers: { "Content-Type": "text/markdown; charset=utf-8" } });
}

/* --- identifiers ---------------------------------------------------------- */

const productId = (product: Product) => convertToUrlFriendlyString(product.title);
const postId = (post: Post, lang: Lang) => convertToUrlFriendlyString(post.title[lang]);
const videoId = (video: Video, lang: Lang) => convertToUrlFriendlyString(video.title[lang]);
const releaseId = (release: Release) => convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
const equipmentItemId = (item: EquipmentItemData) => convertToUrlFriendlyString(`${item.brand} ${item.model}`);

const productPaths = (product: Product) => ({ no: `products/${productId(product)}/`, en: `products/${productId(product)}/` });
const postPaths = (post: Post) => ({ no: `posts/${postId(post, "no")}/`, en: `posts/${postId(post, "en")}/` });
const releasePaths = (release: Release) => ({ no: `portfolio/${releaseId(release)}/`, en: `portfolio/${releaseId(release)}/` });
// The modal URL and the theater URL hold the same video; only the theater one is
// canonical, but both are real pages so both get a markdown sibling.
const videoPaths = (video: Video, theater: boolean) => {
    const suffix = theater ? "video/" : "";
    return { no: `videos/${videoId(video, "no")}/${suffix}`, en: `videos/${videoId(video, "en")}/${suffix}` };
};

/* --- list item lines ------------------------------------------------------ */

const productLine = (product: Product, lang: Lang) =>
    `- [${product.title}](${absoluteUrl(lang, `products/${productId(product)}/`)}) (${isoDate(product.timestamp)}): ${truncate(formatContentAsString(product.content[lang]), 160)}`;

const postLine = (post: Post, lang: Lang) =>
    `- [${post.title[lang]}](${absoluteUrl(lang, `posts/${postId(post, lang)}/`)}) (${isoDate(post.timestamp)}): ${truncate(formatContentAsString(post.content[lang]), 160)}`;

const videoLine = (video: Video, lang: Lang) =>
    `- [${video.title[lang]}](${absoluteUrl(lang, `videos/${videoId(video, lang)}/video/`)}) (${isoDate(video.timestamp)}): ${truncate(formatContentAsString(video.content[lang]), 160)}`;

const releaseLine = (release: Release, lang: Lang) => {
    const genre = release.genre ? `${release.genre}, ` : "";
    return `- [${release.title} ${translations[lang].byConnector} ${release.artistName}](${absoluteUrl(lang, `portfolio/${releaseId(release)}/`)}) (${genre}${isoDate(release.releaseDate)})`;
};

const equipmentItemLine = (item: EquipmentItemData, equipmentType: string, lang: Lang) => {
    const itemName = `${item.brand} ${item.model}`;
    return `- [${itemName}](${absoluteUrl(lang, `equipment/${equipmentType}/${equipmentItemId(item)}/`)})`;
};

/* --- home ----------------------------------------------------------------- */

const homeIntro: Record<Lang, (languageSlug: string) => string[]> = {
    no: (languageSlug: string) => [
        "Dehli Musikk er et enkeltpersonsforetak drevet av keyboardist og produsent Benjamin Dehli og tilbyr spilling av tangentinstrumenter på låter for artister og band.",
        "",
        "Har du en låt som skal spilles inn og mangler tangenter, ta gjerne kontakt på [Facebook](https://www.facebook.com/DehliMusikk/) eller [e-post](mailto:superelg@gmail.com).",
        "",
        `Sjekk ut [porteføljen](${WEBSITE_URL}/${languageSlug}portfolio/) om du vil høre utgivelser Benjamin Dehli (Dehli Musikk) har bidratt på.`,
        ""
    ],
    en: (languageSlug: string) => [
        "Dehli Musikk is a sole proprietorship run by keyboard player and producer Benjamin Dehli and offers keyboard instrument tracks on recordings for artists and bands.",
        "",
        "If you're recording a song and want some keyboard instrument tracks, feel free to contact me on [Facebook](https://www.facebook.com/DehliMusikk/) or [email](mailto:superelg@gmail.com).",
        "",
        `Check out the [portfolio](${WEBSITE_URL}/${languageSlug}portfolio/) if you want to hear releases where Benjamin Dehli (Dehli Musikk) contributed.`,
        ""
    ]
};

export function getHomeMarkdown(lang: Lang) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const seeAll = (label: string, path: string) => [`[${t.seeAll(label)}](${absoluteUrl(lang, path)})`];

    return markdownDocument({
        lang,
        type: "website",
        title: t.home,
        description: t.homeDescription,
        paths: { no: "", en: "" },
        body: [
            ...homeIntro[lang](languageSlug),
            ...section(t.artists, [`${getArtistNamesStringFromReleases(releases, lang)}.`]),
            ...section(t.latestPosts, [...latestPosts.map((post) => postLine(post, lang)), "", ...seeAll(t.posts, "posts/")]),
            ...section(t.latestReleases, [...latestReleases.map((release) => releaseLine(release, lang)), "", ...seeAll(t.portfolio, "portfolio/")]),
            ...section(t.latestVideos, [...latestVideos.map((video) => videoLine(video, lang)), "", ...seeAll(t.videos, "videos/")]),
            ...section(t.latestProducts, [...latestProducts.map((product) => productLine(product, lang)), "", ...seeAll(t.products, "products/")])
        ]
    });
}

/* --- products ------------------------------------------------------------- */

export function getProductsMarkdown(lang: Lang) {
    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "list",
        title: t.products,
        description: t.productsDescription,
        paths: { no: "products/", en: "products/" },
        body: [t.productsDescription, "", ...products.map((product) => productLine(product, lang)), ""]
    });
}

export function getProductMarkdown(lang: Lang, id: string) {
    const product = products.find((candidate) => productId(candidate) === id);
    if (!product) return null;

    const t = translations[lang];
    // "from", because a store price is a pay-what-you-want minimum, and zero
    // reads as free rather than as "0.00 USD".
    const price = hasPrice(product) ? t.priceFrom(product.price, getPriceCurrency(product)) : t.free;

    return markdownDocument({
        lang,
        type: "product",
        title: product.title,
        description: truncate(formatContentAsString(product.content[lang])),
        paths: productPaths(product),
        published: product.timestamp,
        body: [
            `![${product.thumbnailDescription}](${WEBSITE_URL}/data/products/web/jpg/${id}_540.jpg)`,
            "",
            ...metaList([
                [t.published, isoDate(product.timestamp)],
                [t.price, price],
                [t.productType, product.productType?.length ? product.productType.join(" > ") : null],
                [t.formats, formatProductFormats(product) ?? null],
                [t.operatingSystem, product.operatingSystem ?? null],
                [t.softwareVersion, product.softwareVersion ?? null],
                [t.fileSize, product.fileSize ?? null],
                [t.license, product.license ?? null],
                [t.store, linkTo(product.link, lang)],
                [t.documentation, linkTo(product.documentationLink, lang)],
                [t.alsoAt, getAdditionalProductLinks(product)]
            ]),
            contentToMarkdown(product.content[lang], lang),
            ""
        ]
    });
}

export const getProductIds = () => products.map(productId);

/* --- posts ---------------------------------------------------------------- */

export function getPostsMarkdown(lang: Lang) {
    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "list",
        title: t.posts,
        description: t.postsDescription,
        paths: { no: "posts/", en: "posts/" },
        body: [t.postsDescription, "", ...posts.map((post) => postLine(post, lang)), ""]
    });
}

export function getPostMarkdown(lang: Lang, id: string) {
    const post = posts.find((candidate) => postId(candidate, lang) === id);
    if (!post) return null;

    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "article",
        title: post.title[lang],
        description: truncate(formatContentAsString(post.content[lang])),
        paths: postPaths(post),
        published: post.timestamp,
        modified: post.lastmod ?? post.timestamp,
        body: [
            `![${post.thumbnailDescription}](${WEBSITE_URL}/data/posts/web/jpg/${post.thumbnailFilename}_540.jpg)`,
            "",
            ...metaList([[t.published, isoDate(post.timestamp)]]),
            contentToMarkdown(post.content[lang], lang),
            "",
            // Stands on its own rather than sitting under a "Read more" label,
            // because the link's own text already says where it goes.
            ...(linkTo(post.link, lang) ? [linkTo(post.link, lang) as string, ""] : [])
        ]
    });
}

export const getPostIds = (lang: Lang) => (posts as Post[]).map((post) => postId(post, lang));

/* --- videos --------------------------------------------------------------- */

export function getVideosMarkdown(lang: Lang) {
    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "list",
        title: t.videos,
        description: t.videosDescription,
        paths: { no: "videos/", en: "videos/" },
        body: [t.videosDescription, "", ...videos.map((video) => videoLine(video, lang)), ""]
    });
}

/*
 * Chapter offsets are seconds from the start of the video. Rendered as the
 * timestamps a reader would see on YouTube rather than as raw offsets.
 */
const formatOffset = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

export function getVideoMarkdown(lang: Lang, id: string, { theater = false }: { theater?: boolean } = {}) {
    const video = videos.find((candidate) => videoId(candidate, lang) === id);
    if (!video) return null;

    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "video",
        title: video.title[lang],
        description: truncate(formatContentAsString(video.content[lang])),
        paths: videoPaths(video, theater),
        published: video.timestamp,
        modified: video.lastmod ?? video.timestamp,
        body: [
            `![${video.thumbnailDescription}](${WEBSITE_URL}/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg)`,
            "",
            ...metaList([
                [t.published, isoDate(video.timestamp)],
                [t.duration, video.duration],
                [t.watch, `https://www.youtube.com/watch?v=${video.youTubeId}`]
            ]),
            contentToMarkdown(video.content[lang], lang),
            "",
            ...section(t.chapters, video.clips?.length ? video.clips.map((clip) => `- ${formatOffset(clip.startOffset)} ${clip.name[lang]}`) : [])
        ]
    });
}

export const getVideoIds = (lang: Lang) => (videos as Video[]).map((video) => videoId(video, lang));

/* --- portfolio ------------------------------------------------------------ */

export function getPortfolioMarkdown(lang: Lang) {
    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "list",
        title: t.portfolio,
        description: t.portfolioDescription,
        paths: { no: "portfolio/", en: "portfolio/" },
        body: [t.portfolioDescription, "", ...releases.map((release) => releaseLine(release, lang)), ""]
    });
}

export function getReleaseMarkdown(lang: Lang, id: string) {
    const release = releases.find((candidate) => releaseId(candidate) === id);
    if (!release) return null;

    const t = translations[lang];
    const heading = `${release.title} ${t.byConnector} ${release.artistName}`;
    const listenLinks = Object.entries(release.links || {})
        .filter(([, url]) => url)
        .map(([service, url]) => `- [${getStreamingServiceName(service)}](${url})`);

    return markdownDocument({
        lang,
        type: "music-recording",
        title: heading,
        description: t.listenTo(release.title, release.artistName),
        paths: releasePaths(release),
        published: release.releaseDate,
        body: [
            `![${heading}](${WEBSITE_URL}/data/releases/web/jpg/${release.thumbnailFilename}_540.jpg)`,
            "",
            ...metaList([
                [t.artist, release.artistName],
                [t.genre, release.genre],
                [t.released, release.releaseDate ? isoDate(release.releaseDate) : null],
                ["ISRC", release.isrcCode]
            ]),
            ...section(t.listen, listenLinks)
        ]
    });
}

export const getReleaseIds = () => releases.map(releaseId);

/* --- equipment ------------------------------------------------------------ */

export function getEquipmentMarkdown(lang: Lang) {
    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "list",
        title: t.equipment,
        description: t.equipmentDescription,
        paths: { no: "equipment/", en: "equipment/" },
        body: [
            t.equipmentDescription,
            "",
            ...EQUIPMENT_TYPES.map(
                (equipmentType) =>
                    `- [${equipment[equipmentType].name[lang]}](${absoluteUrl(lang, `equipment/${equipmentType}/`)}) (${equipment[equipmentType].items.length})`
            ),
            ""
        ]
    });
}

export function getEquipmentTypeMarkdown(lang: Lang, equipmentType: string) {
    const equipmentTypeData = equipment[equipmentType as EquipmentTypeKey];
    if (!equipmentTypeData) return null;

    const t = translations[lang];
    const typeName = equipmentTypeData.name[lang];
    return markdownDocument({
        lang,
        type: "list",
        title: typeName,
        description: t.equipmentTypeDescription(typeName),
        paths: { no: `equipment/${equipmentType}/`, en: `equipment/${equipmentType}/` },
        body: [t.equipmentTypeDescription(typeName), "", ...equipmentTypeData.items.map((item) => equipmentItemLine(item, equipmentType, lang)), ""]
    });
}

export function getEquipmentItemMarkdown(lang: Lang, equipmentType: string, id: string) {
    const equipmentTypeData = equipment[equipmentType as EquipmentTypeKey];
    if (!equipmentTypeData) return null;
    const item = equipmentTypeData.items.find((candidate) => equipmentItemId(candidate) === id);
    if (!item) return null;

    const t = translations[lang];
    const itemName = `${item.brand} ${item.model}`;
    const itemVideos = getVideosForEquipmentItem(equipmentType, id);
    const itemReleases = getInstrumentReleases(id);
    const itemProducts = getProductsForEquipmentItem(id);

    return markdownDocument({
        lang,
        type: "equipment",
        title: itemName,
        description: getEquipmentItemDescription(itemName, itemVideos.length, itemReleases.length, lang),
        paths: { no: `equipment/${equipmentType}/${id}/`, en: `equipment/${equipmentType}/${id}/` },
        body: [
            `![${itemName}](${WEBSITE_URL}/data/equipment/${equipmentType}/web/jpg/${id}_945.jpg)`,
            "",
            getEquipmentItemDescription(itemName, itemVideos.length, itemReleases.length, lang),
            "",
            ...section(
                t.sampledInProducts,
                (itemProducts.sampled ?? []).map((product) => productLine(product, lang))
            ),
            ...section(
                t.recordedThroughInProducts,
                (itemProducts.effect ?? []).map((product) => productLine(product, lang))
            ),
            ...section(
                t.productsForItem,
                (itemProducts.controls ?? []).map((product) => productLine(product, lang))
            ),
            ...section(
                t.usedInVideos,
                itemVideos.map((video) => videoLine(video, lang))
            ),
            ...section(
                t.heardOnReleases,
                itemReleases.map((release) => releaseLine(release, lang))
            )
        ]
    });
}

export const getEquipmentTypes = () => EQUIPMENT_TYPES;

export const getEquipmentItemIds = () =>
    EQUIPMENT_TYPES.flatMap((equipmentType) => equipment[equipmentType].items.map((item) => ({ equipmentType, equipmentId: equipmentItemId(item) })));

/* --- frequently asked questions ------------------------------------------- */

export function getFaqMarkdown(lang: Lang) {
    const t = translations[lang];
    return markdownDocument({
        lang,
        type: "faq",
        title: t.faq,
        description: t.faqDescription,
        paths: { no: "frequently-asked-questions/", en: "frequently-asked-questions/" },
        body: [
            t.faqDescription,
            "",
            ...frequentlyAskedQuestions.flatMap((faq) => [`## ${faq.question[lang]}`, "", contentToMarkdown(faq.answer[lang], lang), ""])
        ]
    });
}
