// Helpers
import { getArtistNamesForCollaboration, getJsonLdForArtist } from "helpers/releaseHelpers";

// Data
import releaseAlbums from "data/releaseAlbums";
import releases from "data/portfolio";

const websiteUrl = "https://www.dehlimusikk.no";

/*
 * Albums live in their own file keyed by release, the same way
 * releasesInstruments links equipment to releases, because one album covers many
 * releases and repeating its title on each of them would let them drift apart.
 *
 * Only releases that belong to an album get one. A single is not an album named
 * after itself, so leaving a release out of the file is the correct way to say it
 * stands alone.
 */
function getAlbums(releaseId) {
    // Every match, not the first: a track can legitimately appear on more than one
    // album, such as the original plus a compilation, a deluxe edition or a
    // remaster. Taking only the first would silently drop the rest in file order.
    return releaseAlbums.filter((album) => album.releaseIds?.includes(releaseId));
}

/*
 * MusicBrainz models an album as a release-group, so that is what a jsonLdId here
 * should point at. A /recording/ URL identifies a single track and several
 * releases already use one as their own @id: reusing it for the album would give
 * two nodes the same identity with different types, which merges them into one
 * contradictory entity. Albums without a MusicBrainz entry fall back to a site
 * fragment, matching how releaseHelpers handles artists and releases.
 */
export function getAlbumJsonLdId(album) {
    return album?.jsonLdId?.length ? album.jsonLdId : `${websiteUrl}/#album-${album.id}`;
}

// A credit naming several artists is already broken down in the collaborations
// data, which handles names that themselves contain a separator
function getArtistNamesForRelease(artistName) {
    return getArtistNamesForCollaboration(artistName) || [artistName];
}

/*
 * The album is credited to the artist every one of its tracks shares, not to the
 * artist of whichever release is being rendered. A guest feature makes one track's
 * credit longer, so using the release's own artist would put the guest on the
 * album: the Selkie track is credited to Haunted By Silhouettes & Bjorn "Speed"
 * Strid, but the album No Man Isle is by Haunted By Silhouettes alone.
 */
function getAlbumByArtist(album) {
    const namesPerTrack = (album.releaseIds || [])
        .map((releaseId) => releases.find((release) => release.slug === releaseId)?.artistName)
        .filter(Boolean)
        .map(getArtistNamesForRelease);

    if (!namesPerTrack.length) return null;

    const sharedNames = namesPerTrack.reduce((shared, names) => shared.filter((name) => names.includes(name)));
    if (!sharedNames.length) return null;

    const byArtist = sharedNames.flatMap((name) => getJsonLdForArtist(name));
    return byArtist.length === 1 ? byArtist[0] : byArtist;
}

/**
 * The album or albums a release belongs to, or null when it stands alone. Returns
 * a single object for one album and an array for several, which is what inAlbum
 * accepts either way.
 *
 * numTracks and track are deliberately absent: Dehli Musikk only knows the tracks
 * it played on, so counting or listing them would describe the album wrongly.
 */
export function getAlbumJsonLdForRelease(releaseId) {
    const albums = getAlbums(releaseId)
        // Both fields are required so a half-filled entry emits nothing: without a
        // title the album would have no name, and without an id every fallback @id
        // would be "#album-", collapsing separate albums into one node.
        .filter((album) => album?.title?.length && album?.id?.length)
        .map((album) => {
            const byArtist = getAlbumByArtist(album);
            return {
                "@type": "MusicAlbum",
                "@id": getAlbumJsonLdId(album),
                name: album.title,
                ...(byArtist ? { byArtist } : {})
            };
        });

    if (!albums.length) return null;
    return albums.length === 1 ? albums[0] : albums;
}
