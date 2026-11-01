import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { REPO_ROOT } from "@admin/lib/dataFiles";
import { IMAGE_FORMATS, IMAGE_SECTIONS, SHARE_WIDTH, type CropPosition, type ImageSectionKey, type ImageSize } from "@admin/lib/imageSpecs";
import { WATERMARK_MIN_WIDTH, watermarkLayers } from "@admin/lib/watermark";
import { creditYear, withCredit, withIptc } from "@admin/lib/imageCredit";

const PUBLIC_DIR = path.join(REPO_ROOT, "public");

type SharpImage = ReturnType<typeof sharp>;

/* The names the data gives image sets: "2026-10-18-00", "kAASIN_wrong", "korg-ms-20". */
const SET_NAME = /^[A-Za-z0-9_-]+$/;

function webDir(section: ImageSectionKey): string {
    return path.join(PUBLIC_DIR, IMAGE_SECTIONS[section].dir);
}

function filePath(section: ImageSectionKey, name: string, width: number, format: string): string {
    if (!SET_NAME.test(name)) throw new Error(`Not an image set name: ${name}`);
    return path.join(webDir(section), format, `${name}_${width}.${format}`);
}

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

export type ThumbnailResult = { written: string[]; skipped: string[]; upscaled: string[]; source: ImageSize };

export type ThumbnailOptions = {
    position: CropPosition;
    /** The text and logo on the sizes from 540 up, as on the studio's own photos. */
    watermark: boolean;
    /** The copyright year to embed in the jpegs, or none for an image that is not ours. */
    creditYear?: number;
};

const WATERMARK_LOGO = path.join(REPO_ROOT, "admin", "assets", "watermark-logo.svg");

/*
 * Writes every size and format of one set from one source image. Each file is
 * written beside its target and renamed over it, so a failure part way leaves
 * whole files, never a truncated one a browser would choke on.
 *
 * The share size is skipped rather than enlarged when the source is too small:
 * a blown up image is exactly what the large preview would expose. The other
 * sizes are produced either way, as before, but reported if they had to grow.
 */
export async function writeThumbnails(
    section: ImageSectionKey,
    name: string,
    source: Buffer,
    { position, watermark, creditYear: year }: ThumbnailOptions
): Promise<ThumbnailResult> {
    const logo = watermark ? await fs.readFile(WATERMARK_LOGO) : undefined;
    // rotate() with no angle applies the EXIF orientation, so a phone photo
    // taken upright comes out upright; metadata is dropped on output.
    const oriented = await sharp(source, { failOn: "error" }).rotate().toBuffer({ resolveWithObject: true });
    const sourceSize = { width: oriented.info.width, height: oriented.info.height };
    const result: ThumbnailResult = { written: [], skipped: [], upscaled: [], source: sourceSize };

    for (const size of IMAGE_SECTIONS[section].sizes) {
        const scale = Math.max(size.width / sourceSize.width, size.height / sourceSize.height);
        const label = `${size.width}x${size.height}`;
        if (scale > 1 && size.width >= SHARE_WIDTH) {
            result.skipped.push(label);
            continue;
        }
        if (scale > 1) result.upscaled.push(label);

        let resized = sharp(oriented.data).resize(size.width, size.height, {
            fit: "cover",
            position: position === "attention" ? sharp.strategy.attention : position
        });
        if (logo && size.width >= WATERMARK_MIN_WIDTH) {
            // Composite runs after the resize, so the watermark is drawn at the final size.
            resized = sharp(await resized.png().toBuffer()).composite(await watermarkLayers(size.width, size.height, logo));
        }
        for (const format of IMAGE_FORMATS) {
            const target = filePath(section, name, size.width, format);
            await fs.mkdir(path.dirname(target), { recursive: true });
            const temporary = `${target}.${process.pid}.tmp`;
            if (format === "jpg" && year) {
                const jpeg = await withCredit(ENCODERS.jpg(resized.clone()), year).toBuffer();
                await fs.writeFile(temporary, withIptc(jpeg, year));
            } else {
                await ENCODERS[format](resized.clone()).toFile(temporary);
            }
            await fs.rename(temporary, target);
            result.written.push(path.relative(PUBLIC_DIR, target));
        }
    }
    return result;
}

export type ExistingSet = { sizes: number[]; version: string; creditYear?: number };

/**
 * Which widths of a set exist as jpeg, a version that changes when they are
 * rewritten, and the copyright year the 540 carries, if it carries one.
 */
export async function existingThumbnails(section: ImageSectionKey, name: string): Promise<ExistingSet> {
    const sizes: number[] = [];
    let newest = 0;
    for (const { width } of IMAGE_SECTIONS[section].sizes) {
        try {
            const stat = await fs.stat(filePath(section, name, width, "jpg"));
            sizes.push(width);
            newest = Math.max(newest, stat.mtimeMs);
        } catch {
            // Not generated yet.
        }
    }
    const year = sizes.includes(540) ? await creditYear(filePath(section, name, 540, "jpg")) : undefined;
    return { sizes, version: String(Math.round(newest)), ...(year ? { creditYear: year } : {}) };
}

/*
 * Image hosts a set may be fetched from instead of uploaded: Spotify's cover
 * art and YouTube's video thumbnails. Anything else is refused, so a URL typed
 * into a form cannot make this server fetch from wherever it likes.
 */
const FETCHABLE_HOSTS = new Set(["i.scdn.co", "i.ytimg.com"]);

export async function fetchSourceImage(url: string): Promise<Buffer> {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !FETCHABLE_HOSTS.has(parsed.hostname)) {
        throw new Error(`Images can only be fetched from ${[...FETCHABLE_HOSTS].join(" or ")}.`);
    }
    const response = await fetch(parsed, { signal: AbortSignal.timeout(20_000), cache: "no-store" });
    if (!response.ok) throw new Error(`${parsed.hostname} answered ${response.status}.`);
    return Buffer.from(await response.arrayBuffer());
}
