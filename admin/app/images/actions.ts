"use server";

import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { revalidatePath } from "next/cache";
import type { Post, Product, Release, Video } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, readReleases, REPO_ROOT } from "@admin/lib/dataFiles";
import { CROP_POSITIONS, IMAGE_SECTIONS, type CropPosition, type ImageSectionKey } from "@admin/lib/imageSpecs";
import { fetchSourceImage, writeThumbnails } from "@admin/lib/thumbnails";
import type { FormState } from "@admin/lib/forms";

const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

/*
 * The image set name for an item, looked up from the data rather than taken
 * from the form. A request can therefore only write the thumbnails of
 * something that exists, under the name the site will look for.
 */
async function setNameFor(section: ImageSectionKey, key: string): Promise<string | undefined> {
    switch (section) {
        case "posts":
            return (await readDataFile<Post[]>("posts")).find((post) => post.thumbnailFilename === key)?.thumbnailFilename;
        case "videos":
            return (await readDataFile<Video[]>("videos")).find((video) => video.thumbnailFilename === key)?.thumbnailFilename;
        case "releases":
            return (await readReleases<Release>())[`${key}.json`]?.thumbnailFilename;
        case "products":
            return (await readDataFile<Product[]>("products"))
                .map((product) => convertToUrlFriendlyString(product.title))
                .find((slug) => slug === key);
        case "instruments":
        case "effects":
        case "amplifiers":
            return (await readDataFile<{ brand: string; model: string }[]>(section))
                .map((item) => convertToUrlFriendlyString(`${item.brand} ${item.model}`))
                .find((slug) => slug === key);
    }
}

export async function makeThumbnails(section: ImageSectionKey, key: string, _previous: FormState, form: FormData): Promise<FormState> {
    if (!(section in IMAGE_SECTIONS)) return { status: "error", errors: ["Unknown image section."] };
    const name = await setNameFor(section, key);
    if (!name) return { status: "error", errors: ["Save the item first: its images are named after it."] };

    const positionValue = form.get("position");
    const position: CropPosition = typeof positionValue === "string" && positionValue in CROP_POSITIONS ? (positionValue as CropPosition) : "centre";

    const yearValue = Number(form.get("creditYear"));
    const creditYear = form.get("credit") === "on" && Number.isInteger(yearValue) && yearValue >= 1990 && yearValue <= 2100 ? yearValue : undefined;
    if (form.get("credit") === "on" && !creditYear) return { status: "error", errors: ["The copyright year should be a year, such as 2026."] };
    const watermark = form.get("watermark") === "on";

    let source: Buffer;
    try {
        const file = form.get("file");
        const sourceUrl = form.get("sourceUrl");
        if (file instanceof File && file.size > 0) {
            if (file.size > MAX_UPLOAD_BYTES) return { status: "error", errors: ["That file is over 40 MB."] };
            source = Buffer.from(await file.arrayBuffer());
        } else if (typeof sourceUrl === "string" && sourceUrl) {
            source = await fetchSourceImage(sourceUrl);
        } else {
            return { status: "error", errors: ["Choose an image file, or one of the online sources."] };
        }
    } catch (error) {
        return { status: "error", errors: [`Could not get the image: ${(error as Error).message}`] };
    }

    try {
        const result = await writeThumbnails(section, name, source, { position, watermark, creditYear });
        const original = section === "products" && form.get("keepOriginal") === "on" ? await saveProductOriginal(key, source) : null;
        revalidatePath("/", "layout");
        const notes = [
            `Wrote ${result.written.length} files from a ${result.source.width}x${result.source.height} source to public${IMAGE_SECTIONS[section].dir}.`,
            result.skipped.length
                ? `Skipped ${result.skipped.join(", ")}: the source is too small, and a share image is better missing than blurry.`
                : "",
            result.upscaled.length ? `Enlarged to fit: ${result.upscaled.join(", ")}.` : "",
            watermark ? "Watermarked the sizes from 540 up." : "",
            creditYear ? `Credited the jpegs © ${creditYear}.` : "",
            original ? `Saved the original as public/product-images/${original}.` : ""
        ];
        return { status: "saved", message: notes.filter(Boolean).join(" ") };
    } catch (error) {
        return { status: "error", errors: [`Could not read that image: ${(error as Error).message}`] };
    }
}

/*
 * A product's main image is also kept full size in public/product-images,
 * because the JSON-LD and the merchant feeds link to it there. It is always a
 * jpeg under the name the product data gives it; a JPEG upload is stored as
 * is, anything else is converted.
 */
async function saveProductOriginal(slug: string, source: Buffer): Promise<string | null> {
    const product = (await readDataFile<Product[]>("products")).find((candidate) => convertToUrlFriendlyString(candidate.title) === slug);
    if (!product || !/^[a-z0-9-]+\.jpg$/.test(product.mainImage)) return null;
    const isJpeg = source[0] === 0xff && source[1] === 0xd8;
    const target = path.join(REPO_ROOT, "public", "product-images", product.mainImage);
    const temporary = `${target}.${process.pid}.tmp`;
    await fs.writeFile(temporary, isJpeg ? source : await sharp(source).rotate().flatten({ background: "#ffffff" }).jpeg({ quality: 90 }).toBuffer());
    await fs.rename(temporary, target);
    return product.mainImage;
}
