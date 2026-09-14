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

/*
 * Streaming and store destinations for a release. All optional: no release is
 * on every service, and the counts below are how many of the 81 carry each.
 * Amazon appears as two separate links, and Apple as both appleMusic and
 * itunes, because they are different destinations rather than aliases.
 */
export type ReleaseLinks = {
    youtube?: string; // 76
    youtubeMusic?: string; // 76
    spotify?: string; // 67
    tidal?: string; // 66
    amazonMusic?: string; // 61
    amazonStore?: string; // 61
    appleMusic?: string; // 59
    itunes?: string; // 58
    deezer?: string; // 46
    soundcloud?: string; // 35
    yandex?: string; // 31
    napster?: string; // 25
    boomplay?: string; // 18
    pandora?: string; // 17
    anghami?: string; // 12
    audiomack?: string; // 1
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
    /*
     * Which systems the product runs on, as free text for schema.org's
     * operatingSystem.
     *
     * Lived in a lookup keyed by slug in richSnippetsGenerators until it moved
     * here. That map had to be edited whenever a product was added, and a
     * product missing from it silently got no operatingSystem at all - the kind
     * of omission nothing fails on and nobody notices. Absent here means the
     * same thing, but at least it is absent in the place the fact belongs.
     *
     * Only the software categories carry one. A patch library is data for a
     * hardware synth and has no operating system to speak of.
     */
    operatingSystem?: string;
    /*
     * The formats the product is delivered in, each with the systems that
     * format runs on - which are not always the product's own. The sample
     * instruments are the reason it is a list of pairs rather than a list of
     * names: their VST3, AU and Standalone builds are macOS only, and it is the
     * Decent Sampler version that reaches Windows and Linux.
     */
    formats?: { name: string; operatingSystem?: string }[];
    /** A licence URL, on the products that are open source. */
    license?: string;
    /** The current release, when there is a number worth stating. */
    softwareVersion?: string;
    /** Download size as authored text, e.g. "637.8 MB". */
    fileSize?: string;
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
 * Joins a product to a piece of equipment, by what the equipment did for it.
 *
 * `sampled` is the instrument whose sound is in the library, `effect` is gear
 * the sound was recorded through, and `controls` is hardware the product drives
 * or supplies patches for without sampling it at all - SidStation ASID plays a
 * SidStation, DXtraterrestrial is programs for a DX7. Keeping them apart is the
 * whole point of the file: an equipment page that listed all three under one
 * heading would claim a reverb pedal had been sampled.
 */
export type ProductEquipmentRelation = "sampled" | "effect" | "controls";

export type ProductEquipmentLink = {
    productId: string;
    equipmentId: string;
    relation: ProductEquipmentRelation;
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

/*
 * The pair almost every page-level component takes. languageSlug is derivable
 * from lang via getLanguageSlug, but it is threaded through as a prop because
 * these render on the server where there is no context to read it from, and
 * recomputing it in each component invites the two to disagree.
 */
export type LangProps = {
    lang: Lang;
    languageSlug: string;
};

/*
 * A schema.org ImageObject as the page components build it.
 *
 * The copyright fields are filled in afterwards, and only where the site holds
 * the copyright: several videos were published by the artist or label rather
 * than by Dehli Musikk, so claiming a licence on their thumbnails would be
 * wrong. They are optional here for that reason, not because they are
 * incidental.
 */
export type JsonLdImageObject = {
    "@type": "ImageObject";
    url: string;
    contentUrl: string;
    caption?: string;
    description?: string;
    uploadDate?: string;
    license?: string;
    acquireLicensePage?: string;
    copyrightNotice?: string;
    creditText?: string;
    creator?: { "@type"?: string; "@id"?: string; name?: string };
};
