import type { ReleaseLinks } from "types/content";

/*
 * Display names for the services a release links to.
 *
 * One map, because there used to be two and they drifted. The markdown twins
 * carried their own list of nine, of which two named services no release has
 * ever had (amazon, bandcamp) while nine that do exist were missing - so a twin
 * printed "[amazonMusic](url)" where the page beside it said "Amazon Music".
 * The fallback to the raw key hid it: nothing broke, the labels just quietly
 * got worse as services were added to the data.
 *
 * Keyed by ReleaseLinks so adding a destination to the data without naming it
 * here is a type error rather than a camelCase label in the published markdown.
 */
export const STREAMING_SERVICE_NAMES: Record<keyof ReleaseLinks, string> = {
    amazonMusic: "Amazon Music",
    amazonStore: "Amazon",
    anghami: "Anghami",
    appleMusic: "Apple Music",
    audiomack: "Audiomack",
    boomplay: "Boomplay",
    deezer: "Deezer",
    itunes: "iTunes",
    napster: "Napster",
    pandora: "Pandora",
    soundcloud: "SoundCloud",
    spotify: "Spotify",
    tidal: "Tidal",
    yandex: "Yandex",
    youtube: "YouTube",
    youtubeMusic: "YouTube Music"
};

/*
 * Services no release links to any more, kept because the release page still
 * ships their icons and would otherwise label a returning link with its raw
 * key. Held apart from the map above so that one stays exhaustive over the
 * data: adding these to ReleaseLinks would claim the data carries them.
 */
const RETIRED_SERVICE_NAMES: Record<string, string> = {
    google: "Google Play Music",
    googleStore: "Google Play"
};

/** The display name for a link key, falling back to the key itself. */
export const getStreamingServiceName = (linkKey: string): string =>
    STREAMING_SERVICE_NAMES[linkKey as keyof ReleaseLinks] ?? RETIRED_SERVICE_NAMES[linkKey] ?? linkKey;
