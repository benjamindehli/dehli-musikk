import type { Lang } from "lib/pageMetadata";
import type { EquipmentItemData, EquipmentType } from "data/equipment";
import type { Post, Product, Release, Video } from "types/content";

type EquipmentTypes = Record<string, EquipmentType>;

/*
 * One <image:image> entry. License and geo location are carried only by the
 * images the site holds the copyright to.
 */
type SitemapImage = {
    loc: string;
    caption: string;
    title: string;
    license?: string;
    geoLocation?: string;
};

/*
 * Anything a list page can take its lastmod from. The date field differs per
 * collection, which is why the key is passed in rather than assumed.
 */
type DatedItem = { lastmod?: number; [key: string]: unknown };

/* What renderMultilingualUrlObjects emits: the shape next-sitemap consumes. */
type SitemapUrlEntry = {
    url: string;
    lastModified: Date | undefined;
    alternates: { languages: Record<string, string> };
};

type SitemapInput = {
    equipmentTypes: EquipmentTypes;
    posts: Post[];
    products: Product[];
    releases: Release[];
    videos: Video[];
};

// Helpers
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { convertToXmlFriendlyString } from "helpers/xmlStringFormatter";
import { youTubeTimeToSeconds } from "helpers/timeFormatter";
import { formatContentAsString } from "helpers/contentFormatter";
import { SITE_ORIGIN } from "lib/constants";

// Redux store
const languageSlug: Record<Lang, string> = {
    no: "",
    en: "en/"
};

function absoluteUrl(url: string): string {
    return url?.startsWith("http") ? url : `${SITE_ORIGIN}${url}`;
}

function renderNewsUrlElement(url: string, post: Post, languageKey: Lang) {
    const date = new Date(post.timestamp);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    return `  <url>
    <loc>${SITE_ORIGIN}${url}</loc>
    <news:news>
      <news:publication><news:name>Dehli Musikk</news:name><news:language>${languageKey}</news:language></news:publication>
      <news:publication_date>${dateString}</news:publication_date>
      <news:title>${convertToXmlFriendlyString(post.title[languageKey])}</news:title>
    </news:news>
  </url>\n`;
}

function renderVideoUrlElement(url: string, video: Video, languageKey: Lang) {
    const date = new Date(video.timestamp);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
    const dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    const duration = youTubeTimeToSeconds(video.duration);
    const thumbnailLoc = `data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`;
    const absoluteThumbnailLoc = `${SITE_ORIGIN}${thumbnailLoc}`;
    const contentAsString = formatContentAsString(video.content[languageKey]);
    return `  <url>
    <loc>${SITE_ORIGIN}${url}</loc>
    <video:video>
      <video:title>${convertToXmlFriendlyString(video.title[languageKey])}</video:title>
      <video:description>${convertToXmlFriendlyString(contentAsString)}</video:description>
      <video:player_loc allow_embed="yes">https://www.youtube.com/embed/${video.youTubeId}</video:player_loc>
      <video:thumbnail_loc>${absoluteThumbnailLoc}</video:thumbnail_loc>
      <video:duration>${duration}</video:duration>
      <video:publication_date>${dateString}</video:publication_date>
      <video:uploader info="https://www.youtube.com/${video.youTubeChannelId}">${video.youTubeUser}</video:uploader>
      <video:live>no</video:live>
    </video:video>
  </url>\n`;
}

function renderImageUrlElement(image: SitemapImage) {
    const imageLicense = image.license ? `<image:license>${image.license}</image:license>` : "";
    const imageGeoLocation = image.geoLocation ? `<image:geo_location>${image.geoLocation}</image:geo_location>` : "";
    return `<image:image><image:loc>${SITE_ORIGIN}${image.loc}</image:loc><image:title>${image.title}</image:title><image:caption>${image.caption}</image:caption>${imageLicense}${imageGeoLocation}</image:image>`;
}

function renderImagePageUrlElement(url: string, images: SitemapImage[]) {
    let imageUrlElements = "";
    images.forEach((image) => {
        imageUrlElements += renderImageUrlElement(image);
    });
    return `  <url>
    <loc>${SITE_ORIGIN}${url}</loc>
    ${imageUrlElements}
  </url>\n`;
}

function renderMultilingualUrlObjects(norwegianUrl: string, englishUrl: string, timestamp?: number) {
    // Matches buildAlternates() in lib/pageMetadata: Norwegian is x-default.
    const languages = {
        no: absoluteUrl(norwegianUrl),
        en: absoluteUrl(englishUrl),
        "x-default": absoluteUrl(norwegianUrl)
    };
    return [
        {
            url: absoluteUrl(norwegianUrl),
            lastModified: timestamp ? new Date(timestamp) : undefined,
            alternates: { languages }
        },
        {
            url: absoluteUrl(englishUrl),
            lastModified: timestamp ? new Date(timestamp) : undefined,
            alternates: { languages }
        }
    ];
}

/*
 * A list page changes whenever its newest entry does, so it takes that entry's
 * date as its lastmod. Without one, the pages that change most often are the only
 * ones giving Google nothing to schedule a recrawl against.
 *
 * The date field differs per collection and mirrors the detail renderers below:
 * lastmod wins where present, then timestamp, except releases which use
 * releaseDate. Equipment and the FAQ carry no dates at all, so those list pages
 * are left without a lastmod rather than given an invented one.
 */
function getNewestTimestamp(items: DatedItem[], dateKey = "timestamp") {
    if (!items?.length) return undefined;
    const timestamps = items.map((item) => item?.lastmod || item?.[dateKey]).filter(Boolean) as number[];
    return timestamps.length ? Math.max(...timestamps) : undefined;
}

function renderHome(posts: Post[], videos: Video[], products: Product[], releases: Release[]) {
    const urlNorwegianPage = `${languageSlug.no}`;
    const urlEnglishPage = `${languageSlug.en}`;
    // The home page surfaces the latest of everything, so any of them can change it
    const newest = [
        getNewestTimestamp(posts),
        getNewestTimestamp(videos),
        getNewestTimestamp(products),
        getNewestTimestamp(releases, "releaseDate")
    ].filter(Boolean);
    return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, newest.length ? Math.max(...(newest as number[])) : undefined);
}

function renderPostsList(posts: Post[]) {
    const urlNorwegianPage = `${languageSlug.no}posts/`;
    const urlEnglishPage = `${languageSlug.en}posts/`;
    return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, getNewestTimestamp(posts));
}

function renderVideosList(videos: Video[]) {
    const urlNorwegianPage = `${languageSlug.no}videos/`;
    const urlEnglishPage = `${languageSlug.en}videos/`;
    return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, getNewestTimestamp(videos));
}

function renderProductsList(products: Product[]) {
    const urlNorwegianPage = `${languageSlug.no}products/`;
    const urlEnglishPage = `${languageSlug.en}products/`;
    return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, getNewestTimestamp(products));
}

function renderReleasesList(releases: Release[]) {
    const urlNorwegianPage = `${languageSlug.no}portfolio/`;
    const urlEnglishPage = `${languageSlug.en}portfolio/`;
    return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, getNewestTimestamp(releases, "releaseDate"));
}

function renderEquipmentTypesList(equipmentTypes: EquipmentTypes) {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;
    let equipmentTypeElements = renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage);
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
        Object.keys(equipmentTypes).forEach((equipmentTypeKey) => {
            const urlNorwegianTypePage = `${urlNorwegianPage}${equipmentTypeKey}/`;
            const urlEnglishTypePage = `${urlEnglishPage}${equipmentTypeKey}/`;
            equipmentTypeElements = [...equipmentTypeElements, ...renderMultilingualUrlObjects(urlNorwegianTypePage, urlEnglishTypePage)];
        });
    }
    return equipmentTypeElements;
}

function renderFaqList() {
    const urlNorwegianPage = `${languageSlug.no}frequently-asked-questions/`;
    const urlEnglishPage = `${languageSlug.en}frequently-asked-questions/`;
    return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage);
}

function renderPostsDetails(posts: Post[]) {
    return posts?.length
        ? posts.flatMap((post) => {
              const urlNorwegianPage = `${languageSlug.no}posts/${convertToUrlFriendlyString(post.title.no)}/`;
              const urlEnglishPage = `${languageSlug.en}posts/${convertToUrlFriendlyString(post.title.en)}/`;
              const timestamp = post?.lastmod ? post.lastmod : post?.timestamp;
              return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, timestamp);
          })
        : [];
}

// Only the /video/ URL is listed: /videos/{slug}/ serves the same content and
// canonicalises to it, so submitting both would offer Google a duplicate.
function renderVideosDetailsVideo(videos: Video[]) {
    return videos?.length
        ? videos.flatMap((video) => {
              const urlNorwegianPage = `${languageSlug.no}videos/${convertToUrlFriendlyString(video.title.no)}/video/`;
              const urlEnglishPage = `${languageSlug.en}videos/${convertToUrlFriendlyString(video.title.en)}/video/`;
              const timestamp = video?.lastmod ? video.lastmod : video?.timestamp;
              return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, timestamp);
          })
        : [];
}

function renderProductsDetails(products: Product[]) {
    return products?.length
        ? products.flatMap((product) => {
              const urlNorwegianPage = `${languageSlug.no}products/${convertToUrlFriendlyString(product.title)}/`;
              const urlEnglishPage = `${languageSlug.en}products/${convertToUrlFriendlyString(product.title)}/`;
              const timestamp = product?.lastmod ? product.lastmod : product?.timestamp;
              return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, timestamp);
          })
        : [];
}

function renderReleasesDetails(releases: Release[]) {
    return releases?.length
        ? releases.flatMap((release) => {
              const relaseId = `${release.artistName} ${release.title}`;
              const urlNorwegianPage = `${languageSlug.no}portfolio/${convertToUrlFriendlyString(relaseId)}/`;
              const urlEnglishPage = `${languageSlug.en}portfolio/${convertToUrlFriendlyString(relaseId)}/`;
              const timestamp = release?.lastmod ? release.lastmod : release?.releaseDate;
              return renderMultilingualUrlObjects(urlNorwegianPage, urlEnglishPage, timestamp);
          })
        : [];
}

function renderEquipmentDetails(equipmentTypes: EquipmentTypes) {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;
    let equipmentDetailsElements: SitemapUrlEntry[] = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
        Object.keys(equipmentTypes).forEach((equipmentTypeKey) => {
            const equipmentItems = equipmentTypes[equipmentTypeKey].items;
            equipmentItems.forEach((item) => {
                const itemId = `${item.brand} ${item.model}`;
                const urlNorwegianItemPage = `${urlNorwegianPage}${equipmentTypeKey}/${convertToUrlFriendlyString(itemId)}/`;
                const urlEnglishItemPage = `${urlEnglishPage}${equipmentTypeKey}/${convertToUrlFriendlyString(itemId)}/`;
                equipmentDetailsElements = [...equipmentDetailsElements, ...renderMultilingualUrlObjects(urlNorwegianItemPage, urlEnglishItemPage)];
            });
        });
    }
    return equipmentDetailsElements;
}

function getImagesFromPost(post: Post, languageKey: Lang) {
    const images: SitemapImage[] = [];
    const formats = ["avif", "webp", "jpg"];
    const sizes = [55, 350, 540];
    formats.forEach((format) => {
        const imagePath = `data/posts/web/${format}/${post.thumbnailFilename}`;
        sizes.forEach((size) => {
            const imageLoc = `${imagePath}_${size}.${format}`;
            const image: SitemapImage = {
                loc: imageLoc,
                caption: convertToXmlFriendlyString(post.thumbnailDescription),
                title: convertToXmlFriendlyString(post.title[languageKey])
            };
            if (post.copyright) {
                image.license = "https://creativecommons.org/licenses/by-sa/4.0/";
                image.geoLocation = "Bø i Telemark, Norway";
            }
            images.push(image);
        });
    });
    return images;
}

function getImagesFromVideo(video: Video, languageKey: Lang) {
    const images: SitemapImage[] = [];
    const formats = ["avif", "webp", "jpg"];
    const sizes = [55, 350, 540];
    formats.forEach((format) => {
        const imagePath = `data/videos/web/${format}/${video.thumbnailFilename}`;
        sizes.forEach((size) => {
            const imageLoc = `${imagePath}_${size}.${format}`;
            const image: SitemapImage = {
                loc: imageLoc,
                caption: convertToXmlFriendlyString(video.thumbnailDescription),
                title: convertToXmlFriendlyString(video.title[languageKey])
            };
            if (video.copyright) {
                image.license = "https://creativecommons.org/licenses/by-sa/4.0/";
                image.geoLocation = "Bø i Telemark, Norway";
            }
            images.push(image);
        });
    });
    return images;
}

function getImagesFromProduct(product: Product) {
    const images: SitemapImage[] = [];
    const formats = ["avif", "webp", "jpg"];
    const sizes = [55, 350, 540];
    formats.forEach((format) => {
        const imagePath = `data/products/web/${format}/${convertToUrlFriendlyString(product.title)}`;
        sizes.forEach((size) => {
            const imageLoc = `${imagePath}_${size}.${format}`;
            const image: SitemapImage = {
                loc: imageLoc,
                caption: convertToXmlFriendlyString(product.thumbnailDescription),
                title: convertToXmlFriendlyString(product.title),
                license: "https://creativecommons.org/licenses/by-sa/4.0/",
                geoLocation: "Bø i Telemark, Norway"
            };
            images.push(image);
        });
    });
    return images;
}

function getImagesFromRelease(release: Release, languageKey: Lang) {
    // Unreleased entries show a shared "coming soon" placeholder rather than
    // cover art, so there is nothing release-specific to submit.
    if (release.unreleased) return [];

    const images: SitemapImage[] = [];
    const formats = ["avif", "webp", "jpg"];
    const sizes = [55, 350, 540];
    const connector = languageKey === "en" ? "by" : "av";
    formats.forEach((format) => {
        const imagePath = `data/releases/web/${format}/${release.thumbnailFilename}`;
        sizes.forEach((size) => {
            // No license or geoLocation here, unlike the other image types:
            // cover art belongs to the artists and labels, not Dehli Musikk.
            images.push({
                loc: `${imagePath}_${size}.${format}`,
                caption: convertToXmlFriendlyString(`${release.title} ${connector} ${release.artistName}`),
                title: convertToXmlFriendlyString(release.title)
            });
        });
    });
    return images;
}

function getImagesFromEquipmentType(equipmentType: EquipmentType, languageKey: Lang) {
    const images: SitemapImage[] = [];
    const formats = ["avif", "webp", "jpg"];
    const sizes = [55, 350, 540, 945];

    formats.forEach((format) => {
        const imagePath = `data/equipment/web/${format}/${equipmentType.equipmentType}`;
        sizes.forEach((size) => {
            const imageLoc = `${imagePath}_${size}.${format}`;
            const image: SitemapImage = {
                loc: imageLoc,
                caption: convertToXmlFriendlyString(equipmentType.name[languageKey]),
                title: convertToXmlFriendlyString(equipmentType.name[languageKey]),
                license: "https://creativecommons.org/licenses/by-sa/4.0/",
                geoLocation: "Bø i Telemark, Norway"
            };
            images.push(image);
        });
    });
    return images;
}

function getImagesFromEquipmentItem(equipmentItem: EquipmentItemData, equipmentType: string) {
    const images: SitemapImage[] = [];
    const formats = ["avif", "webp", "jpg"];
    const sizes = [55, 350, 540, 945];

    const imageFileName = convertToUrlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`);
    formats.forEach((format) => {
        const imagePath = `data/equipment/${equipmentType}/web/${format}/${imageFileName}`;
        sizes.forEach((size) => {
            const imageLoc = `${imagePath}_${size}.${format}`;
            const image: SitemapImage = {
                loc: imageLoc,
                caption: convertToXmlFriendlyString(`${equipmentItem.model} by ${equipmentItem.brand}`),
                title: convertToXmlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`),
                license: "https://creativecommons.org/licenses/by-sa/4.0/",
                geoLocation: "Bø i Telemark, Norway"
            };
            images.push(image);
        });
    });
    return images;
}

function renderPostsListImages(posts: Post[]) {
    const urlNorwegianPage = `${languageSlug.no}posts/`;
    const urlEnglishPage = `${languageSlug.en}posts/`;
    let norwegianImages: SitemapImage[] = [];
    let englishImages: SitemapImage[] = [];
    if (posts?.length) {
        posts.forEach((post) => {
            norwegianImages = norwegianImages.concat(getImagesFromPost(post, "no"));
            englishImages = englishImages.concat(getImagesFromPost(post, "en"));
        });
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join("");
}

function renderVideosListImages(videos: Video[]) {
    const urlNorwegianPage = `${languageSlug.no}videos/`;
    const urlEnglishPage = `${languageSlug.en}videos/`;
    let norwegianImages: SitemapImage[] = [];
    let englishImages: SitemapImage[] = [];
    if (videos?.length) {
        videos.forEach((video) => {
            norwegianImages = norwegianImages.concat(getImagesFromVideo(video, "no"));
            englishImages = englishImages.concat(getImagesFromVideo(video, "en"));
        });
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join("");
}

function renderProductsListImages(products: Product[]) {
    const urlNorwegianPage = `${languageSlug.no}products/`;
    const urlEnglishPage = `${languageSlug.en}products/`;
    let norwegianImages: SitemapImage[] = [];
    let englishImages: SitemapImage[] = [];
    if (products?.length) {
        products.forEach((product) => {
            norwegianImages = norwegianImages.concat(getImagesFromProduct(product));
            englishImages = englishImages.concat(getImagesFromProduct(product));
        });
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join("");
}

function renderReleasesListImages(releases: Release[]) {
    const urlNorwegianPage = `${languageSlug.no}portfolio/`;
    const urlEnglishPage = `${languageSlug.en}portfolio/`;
    let norwegianImages: SitemapImage[] = [];
    let englishImages: SitemapImage[] = [];
    if (releases?.length) {
        releases.forEach((release) => {
            norwegianImages = norwegianImages.concat(getImagesFromRelease(release, "no"));
            englishImages = englishImages.concat(getImagesFromRelease(release, "en"));
        });
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join("");
}

function renderReleasesDetailsImages(releases: Release[]) {
    return releases?.length
        ? releases
              .map((release) => {
                  const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
                  const norwegianImages = getImagesFromRelease(release, "no");
                  const englishImages = getImagesFromRelease(release, "en");
                  if (!norwegianImages.length) return "";
                  return [
                      renderImagePageUrlElement(`${languageSlug.no}portfolio/${releaseId}/`, norwegianImages),
                      renderImagePageUrlElement(`${languageSlug.en}portfolio/${releaseId}/`, englishImages)
                  ].join("");
              })
              .join("")
        : "";
}

function renderEquipmentTypesListImages(equipmentTypes: EquipmentTypes) {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;
    let norwegianImages: SitemapImage[] = [];
    let englishImages: SitemapImage[] = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
        Object.keys(equipmentTypes).forEach((equipmentTypeKey) => {
            const equipmentType = equipmentTypes[equipmentTypeKey];
            norwegianImages = norwegianImages.concat(getImagesFromEquipmentType(equipmentType, "no"));
            englishImages = englishImages.concat(getImagesFromEquipmentType(equipmentType, "en"));
        });
    }
    return [renderImagePageUrlElement(urlNorwegianPage, norwegianImages), renderImagePageUrlElement(urlEnglishPage, englishImages)].join("");
}

function renderEquipmentListImages(equipmentTypes: EquipmentTypes) {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;
    const equipmentDetailsElements: string[] = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
        Object.keys(equipmentTypes).forEach((equipmentTypeKey) => {
            const equipmentItems = equipmentTypes[equipmentTypeKey].items;
            const urlNorwegianItemListPage = `${urlNorwegianPage}${equipmentTypeKey}/`;
            const urlEnglishItemListPage = `${urlEnglishPage}${equipmentTypeKey}/`;
            let images: SitemapImage[] = [];
            equipmentItems.forEach((item) => {
                images = images.concat(getImagesFromEquipmentItem(item, equipmentTypeKey));
            });
            equipmentDetailsElements.push(
                renderImagePageUrlElement(urlNorwegianItemListPage, images),
                renderImagePageUrlElement(urlEnglishItemListPage, images)
            );
        });
    }
    return equipmentDetailsElements.join("");
}

function renderPostsDetailsImages(posts: Post[]) {
    return posts?.length
        ? posts
              .map((post) => {
                  const norwegianImages = getImagesFromPost(post, "no");
                  const englishImages = getImagesFromPost(post, "en");
                  const urlNorwegianPage = `${languageSlug.no}posts/${convertToUrlFriendlyString(post.title.no)}/`;
                  const urlEnglishPage = `${languageSlug.en}posts/${convertToUrlFriendlyString(post.title.en)}/`;
                  return [
                      renderImagePageUrlElement(urlNorwegianPage, norwegianImages),
                      renderImagePageUrlElement(urlEnglishPage, englishImages)
                  ].join("");
              })
              .join("")
        : "";
}

function renderProductsDetailsImages(products: Product[]) {
    return products?.length
        ? products
              .map((product) => {
                  const norwegianImages = getImagesFromProduct(product);
                  const englishImages = getImagesFromProduct(product);
                  const urlNorwegianPage = `${languageSlug.no}products/${convertToUrlFriendlyString(product.title)}/`;
                  const urlEnglishPage = `${languageSlug.en}products/${convertToUrlFriendlyString(product.title)}/`;
                  return [
                      renderImagePageUrlElement(urlNorwegianPage, norwegianImages),
                      renderImagePageUrlElement(urlEnglishPage, englishImages)
                  ].join("");
              })
              .join("")
        : "";
}

function renderEquipmentDetailsImages(equipmentTypes: EquipmentTypes) {
    const urlNorwegianPage = `${languageSlug.no}equipment/`;
    const urlEnglishPage = `${languageSlug.en}equipment/`;

    const equipmentDetailsElements: string[] = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length) {
        Object.keys(equipmentTypes).forEach((equipmentTypeKey) => {
            const equipmentItems = equipmentTypes[equipmentTypeKey].items;
            equipmentItems.forEach((item) => {
                const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
                const urlNorwegianItemPage = `${urlNorwegianPage}${equipmentTypeKey}/${itemId}/`;
                const urlEnglishItemPage = `${urlEnglishPage}${equipmentTypeKey}/${itemId}/`;
                const images = getImagesFromEquipmentItem(item, equipmentTypeKey);
                equipmentDetailsElements.push(
                    renderImagePageUrlElement(urlNorwegianItemPage, images),
                    renderImagePageUrlElement(urlEnglishItemPage, images)
                );
            });
        });
    }
    return equipmentDetailsElements.join("");
}

// Google only looks at articles published in the last two days, but this site is
// built statically on release and publishes a handful of posts a year, so a
// build-time date window would leave the file empty on most builds. Capping to
// the newest posts keeps it small and always populated; Google ignores the
// entries that have aged out.
const NEWS_SITEMAP_POST_LIMIT = 10;

function renderNewsPostsDetails(posts: Post[]) {
    return posts?.length
        ? [...posts]
              .sort((postA, postB) => postB.timestamp - postA.timestamp)
              .slice(0, NEWS_SITEMAP_POST_LIMIT)
              .map((post) => {
                  const urlNorwegianPage = `${languageSlug.no}posts/${convertToUrlFriendlyString(post.title.no)}/`;
                  const urlEnglishPage = `${languageSlug.en}posts/${convertToUrlFriendlyString(post.title.en)}/`;
                  return [renderNewsUrlElement(urlNorwegianPage, post, "no"), renderNewsUrlElement(urlEnglishPage, post, "en")].join("");
              })
              .join("")
        : "";
}

function renderVideoSitemapDetails(videos: Video[]) {
    return videos?.length
        ? videos
              .map((video) => {
                  const urlNorwegianPage = `${languageSlug.no}videos/${convertToUrlFriendlyString(video.title.no)}/video/`;
                  const urlEnglishPage = `${languageSlug.en}videos/${convertToUrlFriendlyString(video.title.en)}/video/`;
                  return [renderVideoUrlElement(urlNorwegianPage, video, "no"), renderVideoUrlElement(urlEnglishPage, video, "en")].join("");
              })
              .join("")
        : "";
}

export function getSitemapXML({ equipmentTypes, posts, products, releases, videos }: SitemapInput) {
    return [
        ...renderHome(posts, videos, products, releases),
        ...renderPostsList(posts),
        ...renderVideosList(videos),
        ...renderProductsList(products),
        ...renderReleasesList(releases),
        ...renderEquipmentTypesList(equipmentTypes),
        ...renderFaqList(),
        ...renderPostsDetails(posts),
        ...renderVideosDetailsVideo(videos),
        ...renderProductsDetails(products),
        ...renderReleasesDetails(releases),
        ...renderEquipmentDetails(equipmentTypes)
    ];
}

export function getNewsSitemapXML(posts: Post[]) {
    return [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n',
        renderNewsPostsDetails(posts),
        "</urlset>"
    ].join("");
}

export function getImageSitemapXML({ equipmentTypes, posts, products, releases, videos }: SitemapInput) {
    return [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n',
        renderPostsListImages(posts),
        renderPostsDetailsImages(posts),
        renderVideosListImages(videos),
        renderReleasesListImages(releases),
        renderReleasesDetailsImages(releases),
        renderEquipmentTypesListImages(equipmentTypes),
        renderEquipmentListImages(equipmentTypes),
        renderEquipmentDetailsImages(equipmentTypes),
        renderProductsListImages(products),
        renderProductsDetailsImages(products),
        "</urlset>"
    ].join("");
}

export function getVideoSitemapXML(videos: Video[]) {
    return [
        '<?xml version="1.0" encoding="UTF-8"?>\n',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n',
        renderVideoSitemapDetails(videos),
        "</urlset>"
    ].join("");
}
