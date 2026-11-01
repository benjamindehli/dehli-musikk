/*
 * The thumbnail sets the site serves, per section: where they live under
 * public/, and every size as width x height. Measured from the files already
 * there, which were cropped by hand to these shapes:
 *
 * - 55 and 110 are always square: the round list avatars, at 1x and 2x.
 * - Posts, products and equipment use 350x260 and 540x400; equipment adds a
 *   945x700 for its detail view.
 * - Releases are album art, so every size is square.
 * - Videos are 16:9 frames.
 *
 * 1200 is the share image for social cards and Google Discover, which want at
 * least 1200 pixels across. It keeps the section's large shape rather than
 * the 1.91:1 card shape, so nothing that was framed for the site gets cut
 * off; the platforms crop the middle of it themselves.
 */
export type ImageSize = { width: number; height: number };

export type ImageSection = {
    label: string;
    /** Site path of the web directory; files go in <dir>/<format>/<name>_<width>.<format>. */
    dir: string;
    sizes: ImageSize[];
};

const square = (side: number): ImageSize => ({ width: side, height: side });
const AVATARS = [square(55), square(110)];
const LANDSCAPE = [...AVATARS, { width: 350, height: 260 }, { width: 540, height: 400 }];
const LANDSCAPE_SHARE = { width: 1200, height: 889 };
const EQUIPMENT = [...LANDSCAPE, { width: 945, height: 700 }, LANDSCAPE_SHARE];

export const SHARE_WIDTH = 1200;

export const IMAGE_SECTIONS = {
    posts: { label: "Posts", dir: "/data/posts/web", sizes: [...LANDSCAPE, LANDSCAPE_SHARE] },
    products: { label: "Products", dir: "/data/products/web", sizes: [...LANDSCAPE, LANDSCAPE_SHARE] },
    videos: {
        label: "Videos",
        dir: "/data/videos/web",
        sizes: [...AVATARS, { width: 350, height: 197 }, { width: 540, height: 304 }, { width: 1200, height: 675 }]
    },
    releases: { label: "Releases", dir: "/data/releases/web", sizes: [...AVATARS, square(350), square(540), square(1200)] },
    instruments: { label: "Instruments", dir: "/data/equipment/instruments/web", sizes: EQUIPMENT },
    effects: { label: "Effects", dir: "/data/equipment/effects/web", sizes: EQUIPMENT },
    amplifiers: { label: "Amplifiers", dir: "/data/equipment/amplifiers/web", sizes: EQUIPMENT }
} as const satisfies Record<string, ImageSection>;

export type ImageSectionKey = keyof typeof IMAGE_SECTIONS;

export const IMAGE_FORMATS = ["avif", "webp", "jpg"] as const;

/*
 * Where the crop is taken from when the source is a different shape. "attention"
 * is sharp's saliency detection, which finds the busiest part of the picture -
 * usually right for a photo of one instrument, sometimes wrong for a screenshot.
 */
export const CROP_POSITIONS = {
    centre: "Centre",
    top: "Top",
    bottom: "Bottom",
    left: "Left",
    right: "Right",
    attention: "Most detailed area"
} as const;

export type CropPosition = keyof typeof CROP_POSITIONS;

/*
 * What the studio's own images are marked with, as the hand-exported sets
 * were: a watermark on the sizes from 540 up, and a copyright credit in the
 * jpegs' metadata. Neither goes on anything the site does not hold the
 * copyright to: product screenshots, covers, other people's videos.
 */
export type ImageMarks = { watermark: boolean; credit: boolean; year: number };

/**
 * The starting choice for an item's thumbnail panel. A set already carrying
 * a credit keeps it, with its year; otherwise the section decides: equipment
 * photos are always ours, posts and videos are when marked as copyright, and
 * the rest only by choice.
 */
export function defaultImageMarks(
    section: ImageSectionKey,
    existing: { creditYear?: number },
    item: { copyright?: boolean; timestamp?: number | string } = {}
): ImageMarks {
    const itemYear = item.timestamp === undefined ? undefined : new Date(item.timestamp).getFullYear();
    const year = existing.creditYear ?? itemYear ?? new Date().getFullYear();
    const equipment = section === "instruments" || section === "effects" || section === "amplifiers";
    const owned = equipment || section === "products" || Boolean(item.copyright) || existing.creditYear !== undefined;
    return { watermark: equipment || (section === "posts" && Boolean(item.copyright)), credit: owned, year };
}
