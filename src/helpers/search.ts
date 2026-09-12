import type { Lang } from "lib/pageMetadata";
import type { EquipmentItemData } from "data/equipment";
import type { Localized } from "types/content";

/*
 * The trimmed shapes the search box downloads, as helpers/searchDataHelpers
 * builds them. They are narrower than the content model in types/content: only
 * the fields scored or rendered here survive the trip to the browser.
 */
type SearchableRelease = {
    artistName: string;
    title: string;
    genre: string;
    releaseDate: number;
    duration: number;
    thumbnailFilename: string;
    unreleased?: boolean;
};

type SearchablePost = {
    title: Localized;
    content: Localized;
    thumbnailFilename: string;
    thumbnailDescription: string;
};

type SearchableVideo = SearchablePost;

type SearchableProduct = {
    title: string;
    content: Localized;
};

type SearchableEquipmentType = {
    equipmentType: string;
    name: Localized;
    items: EquipmentItemData[];
};

type SearchableFaq = {
    question: Localized;
    answer: Localized;
};

/*
 * Thumbnails at 55px with a 2x companion, in three formats. An unreleased
 * release has no cover art and falls back to the shared "coming soon"
 * placeholder, which is png rather than jpeg - hence both being optional.
 */
type ThumbnailPaths = {
    avif: string;
    avif110: string;
    webp: string;
    webp110: string;
    jpg?: string;
    jpg110?: string;
    png?: string;
    png110?: string;
};

/*
 * One scored hit. `type` doubles as the category key, so an equipment hit
 * carries its equipment type rather than "equipment". `hash` is FAQ-only: those
 * link to a panel on the FAQ page instead of a page of their own.
 */
export type SearchResult = {
    type: string;
    text: string;
    label: string;
    excerpt?: string;
    thumbnailPaths: ThumbnailPaths;
    thumbnailDescription: string;
    points: number;
    link: string;
    linkTitle?: string;
    hash?: string;
};

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
// From contentText, not contentFormatter: this module is plain string work and
// pulling JSX in behind it makes it impossible to exercise outside a bundler.
import { formatContentAsString } from "./contentText";

// Get from /public/data
const getJsonData = async (fileName: string) => {
    try {
        const response = await fetch(`/data/${fileName}.json`);
        return await response.json();
    } catch (error) {
        console.error(`Error loading ${fileName} data:`, error);
        return null;
    }
};

let releases: SearchableRelease[] | null;
let posts: SearchablePost[] | null;
let videos: SearchableVideo[] | null;
let products: SearchableProduct[] | null;
let equipmentTypes: Record<string, SearchableEquipmentType> | null;
let frequentlyAskedQuestions: SearchableFaq[] | null;

const getLanguageSlug = (selectedLanguageKey: Lang) => {
    return selectedLanguageKey === "en" ? "en/" : "";
};

export const convertStringToExcerpt = (string: string | null | undefined): string => {
    if (!string?.trim().length) {
        return "";
    }
    string = formatContentAsString(string);
    string = string.replace(/[\s]+/g, " ");
    const trimmedString = string.length > 158 ? `${string.substring(0, 158)}...` : string;
    return trimmedString;
};

// Get search points
const getSearchPointsFromRelease = (release: SearchableRelease, searchStringWords: string[], selectedLanguageKey: Lang): SearchResult => {
    const id = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const link = `/${getLanguageSlug(selectedLanguageKey)}portfolio/${id}/`;
    const linkTitle = `${selectedLanguageKey === "en" ? "Listen to" : "Lytt til"} ${release.title}`;

    let artistNamePoints = 0;
    let titlePoints = 0;
    let genrePoints = 0;

    searchStringWords.forEach((searchStringWord) => {
        const regex = new RegExp(searchStringWord, "gi");

        const artistNameMatch = release.artistName.match(regex);
        const titleMatch = release.title.match(regex);
        const genreMatch = release.genre.match(regex);

        artistNamePoints += artistNameMatch ? artistNameMatch.length * 15 : 0;
        titlePoints += titleMatch ? titleMatch.length * 15 : 0;
        genrePoints += genreMatch ? genreMatch.length * 5 : 0;
    });

    const points = (artistNamePoints + titlePoints + genrePoints) / searchStringWords.length;

    const thumbnailPaths = !release.unreleased
        ? {
              avif: `/data/releases/web/avif/${release.thumbnailFilename}_55.avif`,
              avif110: `/data/releases/web/avif/${release.thumbnailFilename}_110.avif`,
              webp: `/data/releases/web/webp/${release.thumbnailFilename}_55.webp`,
              webp110: `/data/releases/web/webp/${release.thumbnailFilename}_110.webp`,
              jpg: `/data/releases/web/jpg/${release.thumbnailFilename}_55.jpg`,
              jpg110: `/data/releases/web/jpg/${release.thumbnailFilename}_110.jpg`
          }
        : {
              avif: `/images/comingSoon_${selectedLanguageKey}_55.avif`,
              avif110: `/images/comingSoon_${selectedLanguageKey}_110.avif`,
              webp: `/images/comingSoon_${selectedLanguageKey}_55.webp`,
              webp110: `/images/comingSoon_${selectedLanguageKey}_110.webp`,
              png: `/images/comingSoon_${selectedLanguageKey}_55.png`,
              png110: `/images/comingSoon_${selectedLanguageKey}_110.png`
          };
    const thumbnailDescription =
        selectedLanguageKey === "en"
            ? `Cover image for ${release.title} by ${release.artistName}`
            : `Coverbilde til ${release.title} av ${release.artistName}`;

    const durationString = `${new Date(release.duration).getMinutes()}:${
        new Date(release.duration).getSeconds() > 9 ? new Date(release.duration).getSeconds() : "0" + new Date(release.duration).getSeconds()
    }`;

    const releaseYearString = `${new Date(release.releaseDate).getFullYear()}`;

    const excerpt = `${selectedLanguageKey === "en" ? "Released" : "Utgitt"}: ${releaseYearString}, ${selectedLanguageKey === "en" ? "duration" : "lengde"}: ${durationString}, ${selectedLanguageKey === "en" ? "genre" : "sjanger"}: ${release.genre}`;

    return {
        type: "release",
        text: `${release.artistName} - ${release.title} (${release.genre})`,
        label: selectedLanguageKey === "en" ? "Releases" : "Utgivelser",
        excerpt,
        thumbnailPaths,
        thumbnailDescription,
        points,
        link,
        linkTitle
    };
};

const getSearchPointsFromPost = (post: SearchablePost, searchStringWords: string[], selectedLanguageKey: Lang): SearchResult => {
    const id = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
    const link = `/${getLanguageSlug(selectedLanguageKey)}posts/${id}/`;
    const linkTitle = post.title[selectedLanguageKey];

    let titlePoints = 0;
    let contentPoints = 0;

    searchStringWords.forEach((searchStringWord) => {
        const regex = new RegExp(searchStringWord, "gi");

        const titleMatch = post.title[selectedLanguageKey]?.match(regex);
        const contentMatch = post.content[selectedLanguageKey]?.match(regex);

        titlePoints += titleMatch ? titleMatch.length * 5 : 0;
        contentPoints += contentMatch ? contentMatch.length : 0;
    });

    const points = (titlePoints + contentPoints) / searchStringWords.length;

    const thumbnailPaths = {
        avif: `/data/posts/web/avif/${post.thumbnailFilename}_55.avif`,
        avif110: `/data/posts/web/avif/${post.thumbnailFilename}_110.avif`,
        webp: `/data/posts/web/webp/${post.thumbnailFilename}_55.webp`,
        webp110: `/data/posts/web/webp/${post.thumbnailFilename}_110.webp`,
        jpg: `/data/posts/web/jpg/${post.thumbnailFilename}_55.jpg`,
        jpg110: `/data/posts/web/jpg/${post.thumbnailFilename}_110.jpg`
    };
    const thumbnailDescription = post.thumbnailDescription;

    return {
        type: "post",
        text: post.title[selectedLanguageKey],
        label: selectedLanguageKey === "en" ? "Posts" : "Innlegg",
        excerpt: convertStringToExcerpt(post.content[selectedLanguageKey]),
        thumbnailPaths,
        thumbnailDescription,
        points,
        link,
        linkTitle
    };
};

const getSearchPointsFromVideos = (video: SearchableVideo, searchStringWords: string[], selectedLanguageKey: Lang): SearchResult => {
    const id = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
    const link = `/${getLanguageSlug(selectedLanguageKey)}videos/${id}/`;
    const linkTitle = video.title[selectedLanguageKey];

    let titlePoints = 0;
    let contentPoints = 0;

    searchStringWords.forEach((searchStringWord) => {
        const regex = new RegExp(searchStringWord, "gi");

        const titleMatch = video.title[selectedLanguageKey]?.match(regex);
        const contentMatch = video.content[selectedLanguageKey]?.match(regex);

        titlePoints += titleMatch ? titleMatch.length * 5 : 0;
        contentPoints += contentMatch ? contentMatch.length : 0;
    });

    const points = (titlePoints + contentPoints) / searchStringWords.length;

    const thumbnailPaths = {
        avif: `/data/videos/web/avif/${video.thumbnailFilename}_55.avif`,
        avif110: `/data/videos/web/avif/${video.thumbnailFilename}_110.avif`,
        webp: `/data/videos/web/webp/${video.thumbnailFilename}_55.webp`,
        webp110: `/data/videos/web/webp/${video.thumbnailFilename}_110.webp`,
        jpg: `/data/videos/web/jpg/${video.thumbnailFilename}_55.jpg`,
        jpg110: `/data/videos/web/jpg/${video.thumbnailFilename}_110.jpg`
    };
    const thumbnailDescription = video.thumbnailDescription;

    return {
        type: "video",
        text: video.title[selectedLanguageKey],
        label: selectedLanguageKey === "en" ? "Videos" : "Videoer",
        excerpt: convertStringToExcerpt(video.content[selectedLanguageKey]),
        thumbnailPaths,
        thumbnailDescription,
        points,
        link,
        linkTitle
    };
};

const getSearchPointsFromProduct = (product: SearchableProduct, searchStringWords: string[], selectedLanguageKey: Lang): SearchResult => {
    const id = convertToUrlFriendlyString(product.title);
    const link = `/${getLanguageSlug(selectedLanguageKey)}products/${id}/`;
    const linkTitle = product.title;

    let titlePoints = 0;
    let contentPoints = 0;

    searchStringWords.forEach((searchStringWord) => {
        const regex = new RegExp(searchStringWord, "gi");

        const titleMatch = product.title.match(regex);
        const contentMatch = product.content[selectedLanguageKey]?.match(regex);

        titlePoints += titleMatch ? titleMatch.length * 10 : 0;
        contentPoints += contentMatch ? contentMatch.length * 2 : 0;
    });

    const points = (titlePoints + contentPoints) / searchStringWords.length;

    const thumbnailPaths = {
        avif: `/data/products/web/avif/${id}_55.avif`,
        avif110: `/data/products/web/avif/${id}_110.avif`,
        webp: `/data/products/web/webp/${id}_55.webp`,
        webp110: `/data/products/web/webp/${id}_110.webp`,
        jpg: `/data/products/web/jpg/${id}_55.jpg`,
        jpg110: `/data/products/web/jpg/${id}_110.jpg`
    };
    const thumbnailDescription = linkTitle;

    return {
        type: "product",
        text: product.title,
        label: selectedLanguageKey === "en" ? "Products" : "Produkter",
        excerpt: convertStringToExcerpt(product.content[selectedLanguageKey]),
        thumbnailPaths,
        thumbnailDescription,
        points,
        link,
        linkTitle
    };
};

const getSearchPointsFromEquipmentItems = (
    item: EquipmentItemData,
    equipmentType: SearchableEquipmentType,
    equipmentTypeKey: string,
    searchStringWords: string[],
    selectedLanguageKey: Lang
): SearchResult => {
    const id = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
    const link = `/${getLanguageSlug(selectedLanguageKey)}equipment/${equipmentTypeKey}/${id}/`;
    const linkTitle = `${item.brand} ${item.model}`;

    let brandPoints = 0;
    let modelPoints = 0;
    let equipmentTypePoints = 0;

    searchStringWords.forEach((searchStringWord) => {
        const regex = new RegExp(searchStringWord, "gi");

        const brandMatch = item.brand.match(regex);
        const modelMatch = item.model.match(regex);
        const equipmentTypeMatch = equipmentType.name[selectedLanguageKey]?.match(regex);

        brandPoints += brandMatch ? brandMatch.length * 7 : 0;
        modelPoints += modelMatch ? modelMatch.length * 7 : 0;
        equipmentTypePoints += equipmentTypeMatch ? equipmentTypeMatch.length * 1 : 0;
    });

    const points = (brandPoints + modelPoints + equipmentTypePoints) / searchStringWords.length;

    const thumbnailPaths = {
        avif: `/data/equipment/${equipmentTypeKey}/web/avif/${id}_55.avif`,
        avif110: `/data/equipment/${equipmentTypeKey}/web/avif/${id}_110.avif`,
        webp: `/data/equipment/${equipmentTypeKey}/web/webp/${id}_55.webp`,
        webp110: `/data/equipment/${equipmentTypeKey}/web/webp/${id}_110.webp`,
        jpg: `/data/equipment/${equipmentTypeKey}/web/jpg/${id}_55.jpg`,
        jpg110: `/data/equipment/${equipmentTypeKey}/web/jpg/${id}_110.jpg`
    };
    const thumbnailDescription = `${item.brand} ${item.model}`;

    return {
        type: equipmentTypeKey,
        text: `${item.brand} ${item.model}`,
        label: equipmentType.name[selectedLanguageKey],
        thumbnailPaths,
        thumbnailDescription,
        points,
        link,
        linkTitle
    };
};

const getSearchPointsFromFrequentlyAskedQuestions = (faq: SearchableFaq, searchStringWords: string[], selectedLanguageKey: Lang): SearchResult => {
    const question = faq.question[selectedLanguageKey];
    const answer = faq.answer[selectedLanguageKey];
    const link = `/${getLanguageSlug(selectedLanguageKey)}frequently-asked-questions/`;
    const hash = convertToUrlFriendlyString(question);
    const linkTitle = question;

    let questionPoints = 0;
    let answerPoints = 0;
    searchStringWords.forEach((searchStringWord) => {
        const regex = new RegExp(searchStringWord, "gi");

        const questionMatch = question.match(regex);
        const answerMatch = answer.match(regex);

        questionPoints += questionMatch ? questionMatch.length * 5 : 0;
        answerPoints += answerMatch ? answerMatch.length * 2 : 0;
    });
    const points = (questionPoints + answerPoints) / searchStringWords.length;

    const thumbnailPaths = {
        avif: `/data/frequentlyAskedQuestions/web/avif/thumbnail_55.avif`,
        avif110: `/data/frequentlyAskedQuestions/web/avif/thumbnail_110.avif`,
        webp: `/data/frequentlyAskedQuestions/web/webp/thumbnail_55.webp`,
        webp110: `/data/frequentlyAskedQuestions/web/webp/thumbnail_110.webp`,
        jpg: `/data/frequentlyAskedQuestions/web/jpg/thumbnail_55.jpg`,
        jpg110: `/data/frequentlyAskedQuestions/web/jpg/thumbnail_110.jpg`
    };
    const thumbnailDescription = `Speach bubble icon for frequently asked questions`;

    return {
        type: "faq",
        text: question,
        label: selectedLanguageKey === "en" ? "FAQ" : "FAQ",
        excerpt: convertStringToExcerpt(answer),
        thumbnailPaths,
        thumbnailDescription,
        points,
        link,
        hash,
        linkTitle
    };
};

// Get search results
const getSearchResultsFromReleases = (releases: SearchableRelease[] | null, searchStringWords: string[], selectedLanguageKey: Lang) => {
    if (!releases?.length) {
        return null;
    }
    const searchResultsFromReleases = releases?.map((release) => {
        return getSearchPointsFromRelease(release, searchStringWords, selectedLanguageKey);
    });
    return searchResultsFromReleases?.filter((result) => {
        return result.points && result.points >= 1;
    });
};

const getSearchResultsFromPosts = (posts: SearchablePost[] | null, searchStringWords: string[], selectedLanguageKey: Lang) => {
    if (!posts?.length) {
        return null;
    }
    const searchResultsFromPosts = posts?.map((post) => {
        return getSearchPointsFromPost(post, searchStringWords, selectedLanguageKey);
    });
    return searchResultsFromPosts?.filter((result) => {
        return result.points && result.points >= 1;
    });
};

const getSearchResultsFromVideos = (videos: SearchableVideo[] | null, searchStringWords: string[], selectedLanguageKey: Lang) => {
    if (!videos?.length) {
        return null;
    }
    const searchResultsFromVideos = videos?.map((video) => {
        return getSearchPointsFromVideos(video, searchStringWords, selectedLanguageKey);
    });
    return searchResultsFromVideos?.filter((result) => {
        return result.points && result.points >= 1;
    });
};

const getSearchResultsFromProducts = (products: SearchableProduct[] | null, searchStringWords: string[], selectedLanguageKey: Lang) => {
    if (!products?.length) {
        return null;
    }
    const searchResultsFromProducts = products?.map((product) => {
        return getSearchPointsFromProduct(product, searchStringWords, selectedLanguageKey);
    });
    return searchResultsFromProducts?.filter((result) => {
        return result.points && result.points >= 1;
    });
};

const getSearchResultsFromEquipmentTypes = (
    equipmentTypes: Record<string, SearchableEquipmentType> | null,
    searchStringWords: string[],
    selectedLanguageKey: Lang,
    searchCategory: string
) => {
    /*
     * Keyed by type - instruments, effects, amplifiers - rather than an array, so
     * the .length test this used to do always read undefined and returned early.
     * Equipment never reached the search results at all, which is also how
     * public/data/equipment.json went a whole item out of date unnoticed.
     */
    if (!equipmentTypes || !Object.keys(equipmentTypes).length) {
        return null;
    }
    let searchResultsFromEquipmentTypes: SearchResult[] = [];
    if (searchCategory === "all") {
        Object.keys(equipmentTypes).forEach((equipmentTypeKey) => {
            const equipmentType = equipmentTypes[equipmentTypeKey];
            const searchResultsFromEquipmentType = getSearchResultsFromEquipmentType(
                equipmentType,
                equipmentTypeKey,
                searchStringWords,
                selectedLanguageKey
            );
            searchResultsFromEquipmentTypes = searchResultsFromEquipmentTypes.concat(searchResultsFromEquipmentType as SearchResult[]);
        });
    } else if (["amplifiers", "effects", "instruments"].includes(searchCategory)) {
        const equipmentType = equipmentTypes[searchCategory];
        const searchResultsFromEquipmentType = getSearchResultsFromEquipmentType(
            equipmentType,
            searchCategory,
            searchStringWords,
            selectedLanguageKey
        );
        searchResultsFromEquipmentTypes = searchResultsFromEquipmentTypes.concat(searchResultsFromEquipmentType as SearchResult[]);
    } else {
        return [];
    }
    return searchResultsFromEquipmentTypes;
};

const getSearchResultsFromEquipmentType = (
    equipmentType: SearchableEquipmentType,
    equipmentTypeKey: string,
    searchStringWords: string[],
    selectedLanguageKey: Lang
) => {
    if (!equipmentType?.items?.length) {
        return null;
    }
    const searchResultsFromEquipmentItems = equipmentType?.items.map((item) => {
        return getSearchPointsFromEquipmentItems(item, equipmentType, equipmentTypeKey, searchStringWords, selectedLanguageKey);
    });
    return searchResultsFromEquipmentItems?.filter((result) => {
        return result.points && result.points >= 1;
    });
};

const getSearchResultsFromFrequentlyAskedQuestions = (faqs: SearchableFaq[] | null, searchStringWords: string[], selectedLanguageKey: Lang) => {
    if (!faqs?.length) {
        return null;
    }
    const searchResultsFromFrequentlyAskedQuestions = faqs?.map((faq) => {
        return getSearchPointsFromFrequentlyAskedQuestions(faq, searchStringWords, selectedLanguageKey);
    });
    return searchResultsFromFrequentlyAskedQuestions?.filter((result) => {
        return result.points && result.points >= 1;
    });
};

export const getSearchResults = async (
    query: string,
    selectedLanguageKey: Lang,
    searchCategory = "all"
): Promise<SearchResult[] | null | undefined> => {
    let searchString = query.replace(/[^a-å0-9- ]+/gi, ""); // Removes unwanted characters
    searchString = searchString.replace(/\s\s+/g, " "); // Remove redundant whitespace
    const searchStringWords = searchString.split(" ").filter((searchStringWord) => {
        return searchStringWord.length > 1;
    });
    if (searchString.length > 1) {
        releases = releases || (await getJsonData("releases"));
        posts = posts || (await getJsonData("posts"));
        videos = videos || (await getJsonData("videos"));
        products = products || (await getJsonData("products"));
        equipmentTypes = equipmentTypes || (await getJsonData("equipment"));
        frequentlyAskedQuestions = frequentlyAskedQuestions || (await getJsonData("frequentlyAskedQuestions"));

        const searchResultsFromReleases =
            searchCategory === "release" || searchCategory === "all"
                ? getSearchResultsFromReleases(releases, searchStringWords, selectedLanguageKey)
                : [];
        const searchResultsFromPosts =
            searchCategory === "post" || searchCategory === "all" ? getSearchResultsFromPosts(posts, searchStringWords, selectedLanguageKey) : [];
        const searchResultsFromVideos =
            searchCategory === "video" || searchCategory === "all" ? getSearchResultsFromVideos(videos, searchStringWords, selectedLanguageKey) : [];
        const searchResultsFromProducts =
            searchCategory === "product" || searchCategory === "all"
                ? getSearchResultsFromProducts(products, searchStringWords, selectedLanguageKey)
                : [];
        const searchResultsFromEquipmentTypes = getSearchResultsFromEquipmentTypes(
            equipmentTypes,
            searchStringWords,
            selectedLanguageKey,
            searchCategory
        );
        const searchResultsFromFrequentlyAskedQuestions =
            searchCategory === "faq" || searchCategory === "all"
                ? getSearchResultsFromFrequentlyAskedQuestions(frequentlyAskedQuestions, searchStringWords, selectedLanguageKey)
                : [];
        /*
         * Each of these is null when its category had no data, and concat splices
         * a null in as an element rather than skipping it. The filter below drops
         * those again, which is why the casts state the array type rather than
         * the code guarding each argument.
         */
        const results = searchResultsFromReleases?.concat(
            searchResultsFromPosts as SearchResult[],
            searchResultsFromVideos as SearchResult[],
            searchResultsFromProducts as SearchResult[],
            searchResultsFromEquipmentTypes as SearchResult[],
            searchResultsFromFrequentlyAskedQuestions as SearchResult[]
        );
        return results?.filter((result) => result).sort((a, b) => b.points - a.points);
    } else {
        return null;
    }
};
