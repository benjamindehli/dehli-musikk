/*
 * The site's content model, as the JSON under src/data actually holds it.
 *
 * These describe data, not markup: a field is optional here only when records
 * in the data genuinely lack it, so `unreleased?: boolean` means 14 of the 81
 * releases carry the flag and the rest do not. Widening one of these to cover a
 * value the data never holds costs the null check that would have caught it.
 */
import type { Lang } from "lib/pageMetadata";

/** Text carried in both languages, which is how every content string is stored. */
export type Localized<T = string> = Record<Lang, T>;

/** A link whose label is translated but whose destination is not. */
export type ContentLink = {
    url: string;
    text: Localized;
};

/*
 * Posts link both outward and inward, and `internal` says which: an internal
 * url is a site-relative path per language rather than an absolute address.
 */
export type PostLink = {
    url: string | Localized;
    text: Localized;
    internal?: boolean;
};

/** Streaming destinations for a release. Not every release is on every service. */
export type ReleaseLinks = {
    spotify?: string;
    appleMusic?: string;
    tidal?: string;
    yandex?: string;
};

export type Release = {
    id: string;
    slug: string;
    artistName: string;
    title: string;
    /** Milliseconds. `durationISO` is the same value in ISO 8601. */
    duration: number;
    durationISO: string;
    isrcCode: string;
    genre: string;
    /** Epoch milliseconds. */
    releaseDate: number;
    spotifyThumbnailUrl: string;
    thumbnailFilename: string;
    links: ReleaseLinks;
    releaseId?: string;
    /*
     * Set where the JSON-LD @id must not be derived from the title - the three
     * external GitHub Pages projects reuse these ids, so they cannot drift.
     */
    jsonLdId?: string;
    producedByDehliMusikk?: boolean;
    composedByDehliMusikk?: boolean;
    unreleased?: boolean;
    /*
     * Read by the sitemap in preference to releaseDate. No release carries one
     * today - all 81 fall through - so it is here to be honoured if one ever
     * does, not because the data uses it.
     */
    lastmod?: number;
};

/** A release paired with the id the linked data referred to it by. */
export type LinkedRelease = Release & { releaseId: string };

export type Product = {
    /** Epoch milliseconds, and the sort key for "latest". */
    timestamp: number;
    title: string;
    content: Localized;
    thumbnailDescription: string;
    /*
     * A string, and the *minimum* a buyer can pay: everything in the store is
     * pay what you want. See helpers/productPricing for what zero means.
     */
    price: string;
    priceCurrency: string;
    link: ContentLink;
    sameAs: string[];
    productType: string[];
    mainImage: string;
    additionalImages?: string[];
    documentationLink?: ContentLink;
    /*
     * A demo video, on 15 of the 18 products. Becomes a VideoObject in the
     * product's JSON-LD, attached through `video` on the software products and
     * `subjectOf` on the patch libraries, which are Products but not
     * CreativeWorks.
     */
    video?: {
        name: Localized;
        description: Localized;
        /** Date only, e.g. "2026-03-01". The snippet appends a time. */
        uploadDate: string;
        contentUrl: string;
    };
    /*
     * As on Release: the sitemap prefers it over timestamp, and none of the 18
     * products has one.
     */
    lastmod?: number;
};

/** A named moment inside a video, in seconds from the start. */
export type VideoClip = {
    name: Localized;
    startOffset: number;
    endOffset: number;
};

export type Video = {
    timestamp: number;
    title: Localized;
    content: Localized;
    /** ISO 8601, as YouTube reports it (e.g. "PT4M13S"). */
    duration: string;
    thumbnailDescription: string;
    thumbnailFilename: string;
    youTubeId: string;
    youTubeUser: string;
    youTubeChannelId: string;
    copyright?: boolean;
    id?: string;
    lastmod?: number;
    clips?: VideoClip[];
    orderNumber?: number;
    metaDescription?: Localized;
};

export type Post = {
    id: string;
    orderNumber: number;
    timestamp: number;
    title: Localized;
    content: Localized;
    thumbnailDescription: string;
    thumbnailFilename: string;
    copyright?: boolean;
    link?: PostLink;
    lastmod?: number;
};

export type FaqItem = {
    question: Localized;
    answer: Localized;
};

/*
 * Joins a release to a piece of equipment or to a product. `isProduct`
 * distinguishes the two and is absent on equipment rows rather than false.
 */
export type ReleaseInstrumentLink = {
    releaseId: string;
    equipmentId: string;
    isProduct?: boolean;
};

/*
 * An album, keyed by the releases on it. Kept apart from the releases
 * themselves so one album's title cannot drift between its tracks.
 */
export type ReleaseAlbum = {
    id: string;
    title: string;
    releaseIds: string[];
    /** A MusicBrainz release-group URL. Absent albums fall back to a site fragment. */
    jsonLdId?: string;
};

export type ArtistJsonLdId = {
    name: string;
    jsonLdId: string;
};

/** A credit naming several artists, broken into its parts. */
export type ArtistCollaboration = {
    name: string;
    artistNames: string[];
};

/** A schema.org MusicGroup node as the release helpers emit it. */
export type ArtistJsonLd = {
    "@type": "MusicGroup";
    "@id": string;
    name: string;
};
