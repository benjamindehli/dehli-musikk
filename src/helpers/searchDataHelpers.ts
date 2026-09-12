import type { EquipmentItemData, EquipmentType } from "data/equipment";
import type { FaqItem, Post, Product, Release, Video } from "types/content";
/*
 * The JSON the search box fetches at runtime, built from src/data at build time.
 *
 * These files used to live in public/data/ as hand-maintained copies of the same
 * content, which meant every item existed twice in the repo and stayed correct
 * only as long as nobody forgot. Something had already been forgotten:
 * public/data/equipment.json was missing the Roland VP-550 that src/data has.
 *
 * Each payload carries only the fields helpers/search.js actually reads. Nothing
 * else reaches the browser, so a field added for authoring - orderNumber, say -
 * stays out of the search download without anyone having to remember.
 *
 * The shapes below are deliberately identical to what search.js received before,
 * including equipment staying an object keyed by type rather than an array.
 */

const searchablePost = ({ title, content, thumbnailFilename, thumbnailDescription }: Post) => ({
    title,
    content,
    thumbnailFilename,
    thumbnailDescription
});

const searchableVideo = ({ title, content, thumbnailFilename, thumbnailDescription }: Video) => ({
    title,
    content,
    thumbnailFilename,
    thumbnailDescription
});

// Products need no thumbnail fields: search derives both the image paths and the
// alt text from the title.
const searchableProduct = ({ title, content }: Product) => ({ title, content });

/*
 * genre is read without a guard in search.js (release.genre.match(...)), so it
 * is passed through as-is rather than defaulted; a release without one should
 * fail loudly here rather than silently score zero.
 */
const searchableRelease = ({ artistName, title, genre, releaseDate, duration, thumbnailFilename, unreleased }: Release) => ({
    artistName,
    title,
    genre,
    releaseDate,
    duration,
    thumbnailFilename,
    unreleased
});

const searchableEquipmentItem = ({ brand, model }: EquipmentItemData) => ({ brand, model });

const searchableFaq = ({ question, answer }: FaqItem) => ({ question, answer });

export const getSearchablePosts = (posts: Post[]) => posts.map(searchablePost);
export const getSearchableVideos = (videos: Video[]) => videos.map(searchableVideo);
export const getSearchableProducts = (products: Product[]) => products.map(searchableProduct);
export const getSearchableReleases = (releases: Release[]) => releases.map(searchableRelease);
export const getSearchableFrequentlyAskedQuestions = (faqs: FaqItem[]) => faqs.map(searchableFaq);

export const getSearchableEquipment = (equipmentTypes: Record<string, EquipmentType>) =>
    Object.fromEntries(
        Object.keys(equipmentTypes).map((key) => [
            key,
            {
                equipmentType: equipmentTypes[key].equipmentType,
                name: equipmentTypes[key].name,
                items: equipmentTypes[key].items.map(searchableEquipmentItem)
            }
        ])
    );

/*
 * Shared by all six route handlers. The cache header matches what Firebase
 * applied to these paths when they were static files, so nothing about how they
 * are cached changes with the move.
 */
export const searchDataResponse = (payload: unknown) =>
    new Response(JSON.stringify(payload), {
        headers: { "Content-Type": "application/json; charset=utf-8" }
    });
