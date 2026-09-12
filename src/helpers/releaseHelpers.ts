import type { Lang } from "lib/pageMetadata";
import type { ArtistCollaboration, ArtistJsonLd, ArtistJsonLdId, Release } from "types/content";
// Global functions
import { convertToUrlFriendlyString } from "./urlFormatter";

// Data
import artistJsonLdIds from "data/artists/jsonLdIds";
import collaborations from "data/artists/collaborations";

function getArtistNamesFromArtistNameString(artistNameString: string): string[] {
    return artistNameString.split(/[,&]/).map((artistName) => artistName.trim());
}

function getUniqueArtistNamesFromReleases(releases: Release[]): string[] {
    const artistNames: string[] = [];
    for (const release of releases) {
        for (const artistName of getArtistNamesFromArtistNameString(release.artistName)) {
            artistNames.push(artistName);
        }
    }
    return Array.from(new Set(artistNames)).sort();
}

export function getArtistNamesStringFromReleases(releases: Release[], languageKey: Lang): string {
    const uniqueArtistNames = getUniqueArtistNamesFromReleases(releases).filter((artistName) => artistName !== "Benjamin Dehli");
    const locales: Record<Lang, string> = {
        en: "en-GB",
        no: "nb-NO"
    };
    const formatter = new Intl.ListFormat(locales[languageKey], { style: "long", type: "conjunction" });
    return formatter.format(uniqueArtistNames);
}

export function getJsonLdIdForArtist(artistName: string): string {
    const artistJsonLdId = (artistJsonLdIds as ArtistJsonLdId[]).find((artist) => artist.name === artistName);
    if (artistJsonLdId) {
        return artistJsonLdId.jsonLdId;
    } else {
        const formattedArtistName = convertToUrlFriendlyString(artistName);
        return `https://www.dehlimusikk.no/#artist-${formattedArtistName}`;
    }
}

export function getArtistNamesForCollaboration(collaborationName: string): string[] | null {
    const collaboration = (collaborations as ArtistCollaboration[]).find((collaboration) => collaboration.name === collaborationName);
    if (collaboration) {
        return collaboration.artistNames;
    } else {
        return null;
    }
}

export function getJsonLdForArtist(artistName: string): ArtistJsonLd | ArtistJsonLd[] {
    const artistNamesForCollaboration = getArtistNamesForCollaboration(artistName);
    if (artistNamesForCollaboration) {
        return artistNamesForCollaboration.map((artistName) => {
            return {
                "@type": "MusicGroup",
                "@id": getJsonLdIdForArtist(artistName),
                name: artistName
            };
        });
    } else {
        return {
            "@type": "MusicGroup",
            "@id": getJsonLdIdForArtist(artistName),
            name: artistName
        };
    }
}

export function getJsonLdIdForRelease(release: Release): string {
    if ((release?.jsonLdId?.length as number) > 0) {
        // The length check above already establishes this, but comparing through
        // an optional chain does not narrow the property for the compiler.
        return release.jsonLdId as string;
    } else {
        const formattedReleaseTitle = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
        return `https://www.dehlimusikk.no/#release-${formattedReleaseTitle}`;
    }
}
