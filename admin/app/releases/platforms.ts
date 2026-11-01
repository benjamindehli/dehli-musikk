import type { ReleaseLinks } from "types/content";

/*
 * The streaming and store links a release can carry, most common first. The
 * keys are the ones in the data and in Odesli's linksByPlatform, which is
 * where the old authoring app got them.
 */
export const RELEASE_PLATFORMS: { key: keyof ReleaseLinks; label: string }[] = [
    { key: "youtube", label: "YouTube" },
    { key: "youtubeMusic", label: "YouTube Music" },
    { key: "spotify", label: "Spotify" },
    { key: "tidal", label: "Tidal" },
    { key: "amazonMusic", label: "Amazon Music" },
    { key: "amazonStore", label: "Amazon Store" },
    { key: "appleMusic", label: "Apple Music" },
    { key: "itunes", label: "iTunes" },
    { key: "deezer", label: "Deezer" },
    { key: "soundcloud", label: "SoundCloud" },
    { key: "yandex", label: "Yandex" },
    { key: "napster", label: "Napster" },
    { key: "boomplay", label: "Boomplay" },
    { key: "pandora", label: "Pandora" },
    { key: "anghami", label: "Anghami" },
    { key: "audiomack", label: "Audiomack" }
];
