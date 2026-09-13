/*
 * Pulls the video id out of a YouTube URL.
 *
 * The videos collection stores a bare youTubeId, but a product's demo video
 * stores contentUrl instead, because that field goes into the VideoObject in
 * the product's JSON-LD, where schema.org wants a URL. The player needs the id,
 * so one of the two has to be derived from the other, and deriving the id from
 * the URL is the direction that leaves the structured data authoritative.
 *
 * Both forms in the data today are watch?v= links, but shorts, youtu.be and
 * /embed/ are accepted too: these URLs are pasted in by hand from whatever the
 * browser was showing.
 *
 * Not new URL(): this runs while the static export is being built, and one
 * malformed string in the data should cost a product its demo video rather than
 * take the whole build down. A miss returns null and the caller renders nothing.
 */
const YOUTUBE_ID = /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/;

export const getYouTubeId = (url?: string | null): string | null => {
    if (!url) return null;
    return YOUTUBE_ID.exec(url)?.[1] ?? null;
};
