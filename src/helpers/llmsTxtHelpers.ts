import type { EquipmentItemData, EquipmentType } from "data/equipment";
import type { FaqItem, Post, Product, Release, Video } from "types/content";
import type { Lang } from "lib/pageMetadata";

type LlmsTxtInput = {
    posts: Post[];
    products: Product[];
    releases: Release[];
    videos: Video[];
    lang: Lang;
};

type LlmsFullTxtInput = LlmsTxtInput & {
    equipmentTypes: Record<string, EquipmentType>;
    frequentlyAskedQuestions: FaqItem[];
};

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
// From contentText, not contentFormatter: this module produces plain text and
// has no business pulling JSX in behind it.
import { formatContentAsString } from "helpers/contentText";
import { getEquipmentItemDescription } from "helpers/equipmentDescription";
import { getInstrumentReleases } from "helpers/instrumentReleases";
import { getVideosForEquipmentItem } from "helpers/equipmentUsage";
import { getAdditionalProductLinks } from "helpers/productLinks";
import { getPriceCurrency, hasPrice } from "helpers/productPricing";
import { getLanguageSlug } from "lib/i18n";

const websiteUrl = "https://www.dehlimusikk.no";

const latestPostCount = 15;
const latestReleaseCount = 15;
const latestVideoCount = 10;

/*
 * Both files exist per language, and the English pair keeps the bare names it
 * has always had.
 *
 * Tempting to make the unsuffixed /llms.txt the Norwegian one, since Norwegian
 * is what the site root serves and English is what lives under a prefix. It is
 * not worth it: /llms.txt has been English since it shipped, the Worker's MCP
 * server reads /llms-full.txt as its search corpus, and anything that has
 * already fetched either would silently change language under it.
 */
const llmsFileNames = (lang: Lang) => ({
    index: lang === "en" ? "llms.txt" : "llms-no.txt",
    full: lang === "en" ? "llms-full.txt" : "llms-full-no.txt"
});

/*
 * The prose around the data. Everything here was English string literals before
 * the files were generated per language, which is precisely why the Norwegian
 * half of the site - the half with the least competition on the queries it
 * answers - was invisible to anything reading llms.txt.
 *
 * The meta labels are translated along with the headings. A reader answering a
 * Norwegian question from a Norwegian document should not have to cross a
 * language boundary in the middle of an entry to learn what a price is.
 * "URL" and "ISRC" stay as they are, being the same token in both.
 */
const copy = {
    no: {
        summary:
            "> Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli i Bø i Telemark. Foretaket tilbyr spilling av tangentinstrumenter på låter for artister og band, og selger virtuelle samplede instrumenter og patch-bibliotek.",
        /*
         * The path segments are English in both languages - the Norwegian
         * product list is /products/, not /produkter/ - so this says so
         * outright. Writing the plausible-looking /produkter/ here sent a
         * reader to a URL that has never existed, which is a worse failure
         * than saying nothing: it looks authoritative and 404s.
         */
        languageNote:
            "Norske sider ligger på rota av nettstedet; engelske versjoner av de samme sidene ligger under /en/ (for eksempel /products/ mot /en/products/). Stinavnene er de samme på begge språk - bare /en/-prefikset skiller dem.",
        markdownNote:
            'Hver side er også publisert som markdown, som index.md ved siden av siden selv: https://www.dehlimusikk.no/products/ har https://www.dehlimusikk.no/products/index.md. HTML-en til hver side lenker til sin egen med <link rel="alternate" type="text/markdown">. Et kall på side-URL-en med headeren Accept: text/markdown gir markdown tilbake.',
        fullTextNote: (indexUrl: string) =>
            `Dette er fullteksten til de norske sidene. Engelske versjoner av hver side ligger under /en/. For en oversikt med lenker i stedet, se ${indexUrl}.`,
        products: "Produkter",
        releases: "Utgivelser",
        posts: "Innlegg",
        videos: "Videoer",
        equipment: "Utstyr",
        faq: "Ofte stilte spørsmål",
        optional: "Valgfritt",
        productsIntro: (listUrl: string) =>
            `Virtuelle instrumenter og patch-bibliotek fra Dehli Musikk (full liste: ${listUrl}). Kjøp håndteres i den eksterne butikken på https://store.dehlimusikk.no/.`,
        releasesIntro: (count: number, total: number, listUrl: string) =>
            `De ${count} nyeste av ${total} utgivelser Dehli Musikk har bidratt på (hele porteføljen: ${listUrl}).`,
        postsIntro: (count: number, total: number, listUrl: string) => `De ${count} nyeste av ${total} innlegg (alle innlegg: ${listUrl}).`,
        videosIntro: (count: number, total: number, listUrl: string) => `De ${count} nyeste av ${total} videoer (alle videoer: ${listUrl}).`,
        equipmentLinks: {
            instruments: "Instrumenter brukt under innspilling",
            effects: "Effektpedaler og prosessorer brukt under innspilling",
            amplifiers: "Forsterkere brukt under innspilling"
        },
        equipmentLinkNames: { instruments: "Instrumenter", effects: "Effekter", amplifiers: "Forsterkere" },
        faqLink: "Spørsmål og svar om Dehli Musikk, produkter og tjenester",
        fullTextLink: "Hele teksten til hver side i én fil, i stedet for lenker til den",
        otherLanguageName: "Engelsk versjon",
        otherLanguageLink: "Samme oversikt for de engelske sidene under /en/",
        feedLink: (otherUrl: string) => `RSS-feed med de siste innleggene (engelsk: ${otherUrl})`,
        sitemapLink: "Alle sider på begge språk",
        price: "Pris",
        free: "gratis",
        from: "fra",
        type: "Type",
        store: "Butikk",
        documentation: "Dokumentasjon",
        alsoAt: "Finnes også på",
        published: "Publisert",
        watch: "Se",
        artist: "Artist",
        genre: "Sjanger",
        released: "Utgitt",
        listen: "Lytt",
        heardIn: (titles: string) => `Høres i: ${titles}.`,
        heardOn: (titles: string) => `Høres på: ${titles}.`
    },
    en: {
        summary:
            "> Dehli Musikk is a sole proprietorship run by Benjamin Dehli in Bø i Telemark, Norway. It offers keyboard instrument tracks on recordings for artists and bands, and sells virtual sample-based instruments and patch libraries.",
        languageNote: "English pages live under /en/; Norwegian versions of the same pages live at the site root (e.g. /products/ vs /en/products/).",
        markdownNote:
            'Every page is also published as markdown, at index.md beside the page itself: https://www.dehlimusikk.no/en/products/ has https://www.dehlimusikk.no/en/products/index.md. Each page\'s HTML links to its own with <link rel="alternate" type="text/markdown">. Requesting the page URL with an Accept: text/markdown header returns the markdown too.',
        fullTextNote: (indexUrl: string) =>
            `This is the full text of the English pages. Norwegian versions of every page live at the site root rather than under /en/. For a linked overview instead, see ${indexUrl}.`,
        products: "Products",
        releases: "Releases",
        posts: "Posts",
        videos: "Videos",
        equipment: "Equipment",
        faq: "Frequently asked questions",
        optional: "Optional",
        productsIntro: (listUrl: string) =>
            `Virtual instruments and patch libraries by Dehli Musikk (full list: ${listUrl}). Purchases are handled on the external store at https://store.dehlimusikk.no/.`,
        releasesIntro: (count: number, total: number, listUrl: string) =>
            `The ${count} most recent of ${total} releases Dehli Musikk has contributed to (full portfolio: ${listUrl}).`,
        postsIntro: (count: number, total: number, listUrl: string) => `The ${count} most recent of ${total} posts (all posts: ${listUrl}).`,
        videosIntro: (count: number, total: number, listUrl: string) => `The ${count} most recent of ${total} videos (all videos: ${listUrl}).`,
        equipmentLinks: {
            instruments: "Instruments used during recording",
            effects: "Effect pedals and processors used during recording",
            amplifiers: "Amplifiers used during recording"
        },
        equipmentLinkNames: { instruments: "Instruments", effects: "Effects", amplifiers: "Amplifiers" },
        faqLink: "Questions and answers about Dehli Musikk, products, and services",
        fullTextLink: "Every page's complete text in one file, rather than links to it",
        otherLanguageName: "Norwegian version",
        otherLanguageLink: "The same overview for the Norwegian pages at the site root",
        feedLink: (otherUrl: string) => `RSS feed with the latest posts (Norwegian: ${otherUrl})`,
        sitemapLink: "All pages in both languages",
        price: "Price",
        free: "free",
        from: "from",
        type: "Type",
        store: "Store",
        documentation: "Documentation",
        alsoAt: "Also at",
        published: "Published",
        watch: "Watch",
        artist: "Artist",
        genre: "Genre",
        released: "Released",
        listen: "Listen",
        heardIn: (titles: string) => `Heard in: ${titles}.`,
        heardOn: (titles: string) => `Heard on: ${titles}.`
    }
} as const;

const truncate = (text: string, maxLength = 160): string => {
    if (!text) return "";
    const flattened = text.replace(/\s+/g, " ").trim();
    if (flattened.length <= maxLength) return flattened;
    return `${flattened.slice(0, maxLength).replace(/[,;:\s]+\S*$/, "")}…`;
};

const isoDate = (timestamp: number) => new Date(timestamp).toISOString().slice(0, 10);

/*
 * Products and releases carry one title across both languages, so their slugs
 * match. Posts and videos are titled per language and slugged from that title,
 * so theirs do not - which is why every slug below is derived from the language
 * being rendered rather than from a single canonical one.
 */
const renderProductLine = (product: Product, lang: Lang, slug: string) => {
    const productId = convertToUrlFriendlyString(product.title);
    const description = product.content[lang] ? truncate(formatContentAsString(product.content[lang])) : "";
    return `- [${product.title}](${websiteUrl}/${slug}products/${productId}/): ${description}`;
};

const renderPostLine = (post: Post, lang: Lang, slug: string) => {
    const postId = convertToUrlFriendlyString(post.title[lang]);
    const description = post.content[lang] ? truncate(formatContentAsString(post.content[lang]), 120) : "";
    return `- [${post.title[lang]}](${websiteUrl}/${slug}posts/${postId}/) (${isoDate(post.timestamp)}): ${description}`;
};

const renderReleaseLine = (release: Release, lang: Lang, slug: string) => {
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const genre = release.genre ? `${release.genre}, ` : "";
    const by = lang === "en" ? "by" : "av";
    return `- [${release.title} ${by} ${release.artistName}](${websiteUrl}/${slug}portfolio/${releaseId}/) (${genre}${isoDate(release.releaseDate)})`;
};

const renderVideoLine = (video: Video, lang: Lang, slug: string) => {
    const videoId = convertToUrlFriendlyString(video.title[lang]);
    const description = video.content[lang] ? truncate(formatContentAsString(video.content[lang]), 120) : "";
    // The /video/ URL is the canonical one: the bare video page canonicalises to it
    return `- [${video.title[lang]}](${websiteUrl}/${slug}videos/${videoId}/video/) (${isoDate(video.timestamp)}): ${description}`;
};

export function getLlmsTxt({ posts, products, releases, videos, lang }: LlmsTxtInput) {
    const t = copy[lang];
    const slug = getLanguageSlug(lang);
    const files = llmsFileNames(lang);
    const otherLang: Lang = lang === "en" ? "no" : "en";

    const latestPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp).slice(0, latestPostCount);
    const latestReleases = [...releases].sort((a, b) => b.releaseDate - a.releaseDate).slice(0, latestReleaseCount);
    const latestVideos = [...videos].sort((a, b) => b.timestamp - a.timestamp).slice(0, latestVideoCount);

    const equipmentLink = (key: "instruments" | "effects" | "amplifiers") =>
        `- [${t.equipmentLinkNames[key]}](${websiteUrl}/${slug}equipment/${key}/): ${t.equipmentLinks[key]}`;

    return [
        "# Dehli Musikk",
        "",
        t.summary,
        "",
        t.languageNote,
        "",
        t.markdownNote,
        "",
        `## ${t.products}`,
        "",
        t.productsIntro(`${websiteUrl}/${slug}products/`),
        "",
        products.map((product) => renderProductLine(product, lang, slug)).join("\n"),
        "",
        `## ${t.releases}`,
        "",
        t.releasesIntro(latestReleaseCount, releases.length, `${websiteUrl}/${slug}portfolio/`),
        "",
        latestReleases.map((release) => renderReleaseLine(release, lang, slug)).join("\n"),
        "",
        `## ${t.posts}`,
        "",
        t.postsIntro(latestPostCount, posts.length, `${websiteUrl}/${slug}posts/`),
        "",
        latestPosts.map((post) => renderPostLine(post, lang, slug)).join("\n"),
        "",
        `## ${t.videos}`,
        "",
        t.videosIntro(latestVideoCount, videos.length, `${websiteUrl}/${slug}videos/`),
        "",
        latestVideos.map((video) => renderVideoLine(video, lang, slug)).join("\n"),
        "",
        `## ${t.equipment}`,
        "",
        equipmentLink("instruments"),
        equipmentLink("effects"),
        equipmentLink("amplifiers"),
        "",
        `## ${t.optional}`,
        "",
        `- [${t.faq}](${websiteUrl}/${slug}frequently-asked-questions/): ${t.faqLink}`,
        `- [${lang === "en" ? "Full text" : "Fulltekst"}](${websiteUrl}/${files.full}): ${t.fullTextLink}`,
        `- [${t.otherLanguageName}](${websiteUrl}/${llmsFileNames(otherLang).index}): ${t.otherLanguageLink}`,
        `- [${lang === "en" ? "News feed" : "Nyhetsfeed"}](${websiteUrl}/feed-${lang}.rss): ${t.feedLink(`${websiteUrl}/feed-${otherLang}.rss`)}`,
        `- [${lang === "en" ? "Sitemap" : "Nettstedskart"}](${websiteUrl}/sitemap.xml): ${t.sitemapLink}`,
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
const renderFullEntry = (heading: string, url: string, meta: string, body: string) =>
    [`### ${heading}`, "", `URL: ${url}`, ...(meta ? [meta, ""] : [""]), ...(body ? [body, ""] : [])].join("\n");

const renderFullProduct = (product: Product, lang: Lang, slug: string) => {
    const t = copy[lang];
    const productId = convertToUrlFriendlyString(product.title);
    /*
     * "from", because the price on a store product is a pay what you want
     * minimum. Zero reads as free rather than as "0.00 USD", which was both ugly
     * and easy to mistake for a missing value.
     */
    const price = hasPrice(product) ? `${t.from} ${product.price} ${getPriceCurrency(product)}` : t.free;
    // One line per key here, rather than the nested list the markdown twins use,
    // because every other line in this file is a single Key: value pair
    const additionalLinks = getAdditionalProductLinks(product);
    const meta = [
        `${t.price}: ${price}`,
        product.productType?.length ? `${t.type}: ${product.productType.join(" > ")}` : null,
        product.link?.url ? `${t.store}: ${product.link.url}` : null,
        product.documentationLink?.url ? `${t.documentation}: ${product.documentationLink.url}` : null,
        additionalLinks.length ? `${t.alsoAt}: ${additionalLinks.join(", ")}` : null
    ]
        .filter(Boolean)
        .join("\n");
    return renderFullEntry(
        product.title,
        `${websiteUrl}/${slug}products/${productId}/`,
        meta,
        product.content?.[lang] ? formatContentAsString(product.content[lang]) : ""
    );
};

const renderFullPost = (post: Post, lang: Lang, slug: string) => {
    const postId = convertToUrlFriendlyString(post.title[lang]);
    return renderFullEntry(
        post.title[lang],
        `${websiteUrl}/${slug}posts/${postId}/`,
        `${copy[lang].published}: ${isoDate(post.timestamp)}`,
        post.content?.[lang] ? formatContentAsString(post.content[lang]) : ""
    );
};

const renderFullVideo = (video: Video, lang: Lang, slug: string) => {
    const t = copy[lang];
    const videoId = convertToUrlFriendlyString(video.title[lang]);
    const meta = [`${t.published}: ${isoDate(video.timestamp)}`, `${t.watch}: https://www.youtube.com/watch?v=${video.youTubeId}`].join("\n");
    return renderFullEntry(
        video.title[lang],
        `${websiteUrl}/${slug}videos/${videoId}/video/`,
        meta,
        video.content?.[lang] ? formatContentAsString(video.content[lang]) : ""
    );
};

// Releases hold no prose, so they contribute their metadata instead
const renderFullRelease = (release: Release, lang: Lang, slug: string) => {
    const t = copy[lang];
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const meta = [
        `${t.artist}: ${release.artistName}`,
        release.genre ? `${t.genre}: ${release.genre}` : null,
        release.releaseDate ? `${t.released}: ${isoDate(release.releaseDate)}` : null,
        release.isrcCode ? `ISRC: ${release.isrcCode}` : null,
        release.links?.spotify ? `${t.listen}: ${release.links.spotify}` : null
    ]
        .filter(Boolean)
        .join("\n");
    const by = lang === "en" ? "by" : "av";
    return renderFullEntry(`${release.title} ${by} ${release.artistName}`, `${websiteUrl}/${slug}portfolio/${releaseId}/`, meta, "");
};

const renderFullFaq = (faq: FaqItem, lang: Lang) => [`### ${faq.question[lang]}`, "", formatContentAsString(faq.answer[lang]), ""].join("\n");

/*
 * Equipment holds only a brand and a model, so an entry that stopped at the name
 * would be findable by that name and nothing else. The videos and recordings an
 * item appears on are what people actually search by - "which organ is on that
 * track" - so they are named here rather than merely counted, the way the
 * equipment page itself lists them.
 */
const renderFullEquipmentItem = (item: EquipmentItemData, equipmentType: EquipmentType, equipmentTypeKey: string, lang: Lang, slug: string) => {
    const t = copy[lang];
    const itemName = `${item.brand} ${item.model}`;
    const itemId = convertToUrlFriendlyString(itemName);
    const itemVideos = getVideosForEquipmentItem(equipmentTypeKey, itemId);
    const itemReleases = getInstrumentReleases(itemId);

    const meta = [`${t.type}: ${equipmentType.name[lang]}`].join("\n");
    const body = [
        getEquipmentItemDescription(itemName, itemVideos.length, itemReleases.length, lang),
        itemVideos.length ? t.heardIn(itemVideos.map((video) => video.title[lang]).join(", ")) : null,
        itemReleases.length
            ? t.heardOn(itemReleases.map((release) => `${release.title} ${lang === "en" ? "by" : "av"} ${release.artistName}`).join(", "))
            : null
    ]
        .filter(Boolean)
        .join("\n");

    return renderFullEntry(itemName, `${websiteUrl}/${slug}equipment/${equipmentTypeKey}/${itemId}/`, meta, body);
};

export function getLlmsFullTxt({ posts, products, releases, videos, equipmentTypes, frequentlyAskedQuestions, lang }: LlmsFullTxtInput) {
    const t = copy[lang];
    const slug = getLanguageSlug(lang);
    const files = llmsFileNames(lang);

    const byNewest = <T>(items: T[], dateKey: keyof T & string = "timestamp" as keyof T & string): T[] =>
        [...items].sort((a, b) => (b[dateKey] as number) - (a[dateKey] as number));

    const equipmentKeys = Object.keys(equipmentTypes);
    const equipmentCount = equipmentKeys.reduce((total, key) => total + equipmentTypes[key].items.length, 0);
    const equipmentEntries = equipmentKeys
        .flatMap((key) => equipmentTypes[key].items.map((item) => renderFullEquipmentItem(item, equipmentTypes[key], key, lang, slug)))
        .join("\n");

    return [
        "# Dehli Musikk",
        "",
        t.summary,
        "",
        t.fullTextNote(`${websiteUrl}/${files.index}`),
        "",
        `## ${t.products} (${products.length})`,
        "",
        products.map((product) => renderFullProduct(product, lang, slug)).join("\n"),
        `## ${t.posts} (${posts.length})`,
        "",
        byNewest(posts)
            .map((post) => renderFullPost(post, lang, slug))
            .join("\n"),
        `## ${t.videos} (${videos.length})`,
        "",
        byNewest(videos)
            .map((video) => renderFullVideo(video, lang, slug))
            .join("\n"),
        `## ${t.releases} (${releases.length})`,
        "",
        byNewest(releases, "releaseDate")
            .map((release) => renderFullRelease(release, lang, slug))
            .join("\n"),
        `## ${t.equipment} (${equipmentCount})`,
        "",
        equipmentEntries,
        `## ${t.faq} (${frequentlyAskedQuestions.length})`,
        "",
        frequentlyAskedQuestions.map((faq) => renderFullFaq(faq, lang)).join("\n")
    ].join("\n");
}
