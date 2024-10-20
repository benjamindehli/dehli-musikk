function getArtistNamesFromArtistNameString(artistNameString) {
    return artistNameString.split(/[,&]/).map((artistName) => artistName.trim());
}

function getUniqueArtistNamesFromReleases(releases) {
    const artistNames = [];
    releases.forEach((release) => {
        getArtistNamesFromArtistNameString(release.artistName).forEach((artistName) => artistNames.push(artistName));
    });
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
