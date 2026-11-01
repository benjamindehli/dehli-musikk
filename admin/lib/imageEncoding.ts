import sharp from "sharp";
import { withCredit, withIptc } from "./imageCredit.ts";
import type { IMAGE_FORMATS as Formats } from "./imageSpecs.ts";

type SharpImage = ReturnType<typeof sharp>;

export type ImageFormat = (typeof Formats)[number];

/*
 * Quality 80 for jpeg is what the hand-exported sets used. webp matches it,
 * and avif at 55 lands at about the same apparent quality in far fewer bytes,
 * which is the trade the product gallery script makes too.
 */
const ENCODERS = {
    avif: (image: SharpImage) => image.avif({ quality: 55, effort: 4 }),
    webp: (image: SharpImage) => image.webp({ quality: 80 }),
    // Flattened because a jpeg cannot carry the alpha a PNG screenshot may
    // have, and sharp would otherwise composite it onto black.
    jpg: (image: SharpImage) => image.flatten({ background: "#ffffff" }).jpeg({ quality: 80, mozjpeg: true })
};

/**
 * One file of a thumbnail set. With a credit year, a jpeg gets the copyright
 * credit in its metadata; the other formats never carry it.
 *
 * Plain sharp and no Next.js imports, so a one-off script can use it too.
 */
export async function encodeImage(image: SharpImage, format: ImageFormat, creditYear?: number): Promise<Buffer> {
    if (format === "jpg" && creditYear) return withIptc(await withCredit(ENCODERS.jpg(image), creditYear).toBuffer(), creditYear);
    return ENCODERS[format](image).toBuffer();
}
