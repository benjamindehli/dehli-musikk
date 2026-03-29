// Global functions
import { convertToUrlFriendlyString } from "./urlFormatter";

// Data
import artistJsonLdIds from "data/artists/jsonLdIds";
import collaborations from "data/artists/collaborations";

function getArtistNamesFromArtistNameString(artistNameString) {
    return artistNameString.split(/[,&]/).map((artistName) => artistName.trim());
}

function getUniqueArtistNamesFromReleases(releases) {
    const artistNames = [];
    for (const release of releases) {
        for (const artistName of getArtistNamesFromArtistNameString(release.artistName)) {
            artistNames.push(artistName);
        }
    }
    return Array.from(new Set(artistNames)).sort();
}

export function getArtistNamesStringFromReleases(releases, languageKey) {
    const uniqueArtistNames = getUniqueArtistNamesFromReleases(releases).filter(
        (artistName) => artistName !== "Benjamin Dehli"
    );
    const locales = {
        en: "en-GB",
        no: "nb-NO"
    };
    const formatter = new Intl.ListFormat(locales[languageKey], { style: "long", type: "conjunction" });
    return formatter.format(uniqueArtistNames);
}

export function getJsonLdIdForArtist(artistName) {
    const artistJsonLdId = artistJsonLdIds.find((artist) => artist.name === artistName);
    if (artistJsonLdId) {
        return artistJsonLdId.jsonLdId;
    } else {
        const formattedArtistName = convertToUrlFriendlyString(artistName);
        return `https://www.dehlimusikk.no/#artist-${formattedArtistName}`;
    }
}

export function getArtistNamesForCollaboration(collaborationName) {
    const collaboration = collaborations.find((collaboration) => collaboration.name === collaborationName);
    if (collaboration) {
        return collaboration.artistNames;
    } else {
        return null;
    }
}

export function getJsonLdForArtist(artistName) {
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

export function getJsonLdIdForRelease(release) {
    if (release?.jsonLdId?.length > 0) {
        return release.jsonLdId;
    } else {
        const formattedReleaseTitle = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
        return `https://www.dehlimusikk.no/#release-${formattedReleaseTitle}`;
    }
}
