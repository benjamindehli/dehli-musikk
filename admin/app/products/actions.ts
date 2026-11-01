"use server";

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ContentLink, Localized, Product, ProductEquipmentLink, ProductEquipmentRelation } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, REPO_ROOT, writeDataFile } from "@admin/lib/dataFiles";
import { fromOsloDate, toOsloDate } from "@admin/lib/dates";
import { isAbsoluteUrl, Problems, text, texts, type FormState } from "@admin/lib/forms";
import { newestFirstPosition } from "@admin/lib/identifiers";

const PRODUCT_IMAGES = path.join(REPO_ROOT, "public", "product-images");
const RELATIONS: ProductEquipmentRelation[] = ["sampled", "effect", "controls"];
const PRICE = /^\d+\.\d{2}$/;
const CURRENCY = /^[A-Z]{3}$/;

/*
 * The order the 18 products already have their fields in. Saving rebuilds a
 * product in this order, so adding a field to one that lacked it puts the
 * field where every other product has it, rather than at the end.
 */
const FIELD_ORDER: (keyof Product)[] = [
    "timestamp",
    "title",
    "content",
    "thumbnailDescription",
    "price",
    "priceCurrency",
    "link",
    "documentationLink",
    "sameAs",
    "productType",
    "operatingSystem",
    "formats",
    "license",
    "softwareVersion",
    "fileSize",
    "mainImage",
    "additionalImages",
    "additionalImageDescriptions",
    "video",
    "lastmod"
];

function ordered(product: Partial<Product>): Product {
    const result: Record<string, unknown> = {};
    for (const key of FIELD_ORDER) if (product[key] !== undefined) result[key] = product[key];
    // Anything the type does not list yet survives a save, after the rest.
    for (const [key, value] of Object.entries(product)) if (!(key in result) && value !== undefined) result[key] = value;
    return result as Product;
}

function localized(form: FormData, base: string): Localized {
    return { no: text(form, `${base}No`), en: text(form, `${base}En`) };
}

function readContentLink(form: FormData, base: string, label: string, required: boolean, problems: Problems): ContentLink | undefined {
    const url = text(form, `${base}Url`);
    const linkText = { en: text(form, `${base}TextEn`), no: text(form, `${base}TextNo`) };
    if (!url && !linkText.no && !linkText.en) {
        if (required) problems.add(`${label} is required.`);
        return undefined;
    }
    if (!isAbsoluteUrl(url)) problems.add(`${label} must be a full https:// address.`);
    if (!linkText.no || !linkText.en) problems.add(`${label} needs its text in both languages.`);
    return { url, text: linkText };
}

function readVideo(form: FormData, problems: Problems): Product["video"] {
    const contentUrl = text(form, "videoUrl");
    const name = localized(form, "videoName");
    const description = localized(form, "videoDescription");
    const uploadDate = text(form, "videoUploadDate");
    if (!contentUrl && !name.no && !name.en && !description.no && !description.en && !uploadDate) return undefined;
    if (!isAbsoluteUrl(contentUrl)) problems.add("The demo video needs its YouTube address.");
    if (!name.no || !name.en || !description.no || !description.en) problems.add("The demo video needs a name and description in both languages.");
    if (fromOsloDate(uploadDate) === null) problems.add("The demo video needs its upload date.");
    // Keys as the data has them: name, description, uploadDate, contentUrl.
    return { name: { en: name.en, no: name.no }, description: { en: description.en, no: description.no }, uploadDate, contentUrl };
}

function readGallery(form: FormData, problems: Problems) {
    const files = texts(form, "galleryFile");
    const captionsNo = texts(form, "galleryCaptionNo");
    const captionsEn = texts(form, "galleryCaptionEn");
    const descriptions: Record<string, Localized> = {};
    files.forEach((file, i) => {
        const no = captionsNo[i] ?? "";
        const en = captionsEn[i] ?? "";
        if (Boolean(no) !== Boolean(en)) problems.add(`Write the caption for ${file} in both languages, or leave both empty.`);
        if (no && en) descriptions[file] = { en, no };
    });
    return { files, descriptions };
}

/*
 * Equipment links for one product, as rows in productsEquipment.json. Rows
 * that stay are left where they are, removed ones go, and new ones are added at
 * the end of the file, so unchanged links leave the file untouched.
 */
function updateEquipmentLinks(all: ProductEquipmentLink[], productId: string, wanted: ProductEquipmentLink[]): ProductEquipmentLink[] {
    const key = (link: ProductEquipmentLink) => `${link.equipmentId}|${link.relation}`;
    const wantedKeys = new Set(wanted.map(key));
    const kept = all.filter((link) => link.productId !== productId || wantedKeys.has(key(link)));
    const present = new Set(kept.filter((link) => link.productId === productId).map(key));
    return [...kept, ...wanted.filter((link) => !present.has(key(link)))];
}

export async function saveProduct(originalSlug: string | null, _previous: FormState, form: FormData): Promise<FormState> {
    const products = await readDataFile<Product[]>("products");
    const index = originalSlug === null ? -1 : products.findIndex((product) => convertToUrlFriendlyString(product.title) === originalSlug);
    if (originalSlug !== null && index === -1) return { status: "error", errors: [`Product ${originalSlug} no longer exists.`] };
    const existing = index === -1 ? undefined : products[index];

    const problems = new Problems();
    const title = problems.require(text(form, "title"), "Title");
    const slug = convertToUrlFriendlyString(title);
    if (existing && slug !== originalSlug) {
        problems.add(
            `That title would move the product from products/${originalSlug}/ to products/${slug}/. Its images, equipment links, release links and the posts that link to it all use the old one, so a rename has to be done by hand.`
        );
    }
    if (!existing && products.some((product) => convertToUrlFriendlyString(product.title) === slug))
        problems.add(`There is already a product at products/${slug}/.`);

    const content = localized(form, "content");
    if (!content.no || !content.en) problems.add("The description is required in both languages.");
    const thumbnailDescription = problems.require(text(form, "thumbnailDescription"), "Image description");

    const price = text(form, "price");
    if (!PRICE.test(price)) problems.add("Price must be written like 9.99, or 0.00 for free.");
    const priceCurrency = text(form, "priceCurrency").toUpperCase();
    if (!CURRENCY.test(priceCurrency)) problems.add("Currency must be a three-letter code such as USD.");

    const link = readContentLink(form, "link", "The store link", true, problems);
    const documentationLink = readContentLink(form, "documentation", "The documentation link", false, problems);

    const sameAs = text(form, "sameAs")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
    for (const url of sameAs) if (!isAbsoluteUrl(url)) problems.add(`"${url}" in Same as is not a full address.`);

    const productType = [
        ...new Set(
            [
                ...texts(form, "productType"),
                ...text(form, "productTypeOther")
                    .split(",")
                    .map((type) => type.trim())
            ].filter(Boolean)
        )
    ];
    if (!productType.length) problems.add("Pick at least one product type.");

    const formatNames = texts(form, "formatName");
    const formatSystems = texts(form, "formatOs");
    const formats = formatNames.map((name, i) => (formatSystems[i] ? { name, operatingSystem: formatSystems[i] } : { name }));
    if (formats.some((format) => !format.name)) problems.add("Every format needs a name.");

    const license = text(form, "license");
    if (license && !isAbsoluteUrl(license)) problems.add("License must be the address of the licence text.");

    const video = readVideo(form, problems);
    const gallery = readGallery(form, problems);

    const equipmentIds = texts(form, "equipmentId");
    const relations = texts(form, "equipmentRelation");
    const equipmentLinks: ProductEquipmentLink[] = equipmentIds.map((equipmentId, i) => ({
        productId: slug,
        equipmentId,
        relation: relations[i] as ProductEquipmentRelation
    }));
    if (equipmentLinks.some((item) => !item.equipmentId || !RELATIONS.includes(item.relation)))
        problems.add("Every equipment link needs an item and a relation.");

    const date = fromOsloDate(text(form, "date"));
    if (date === null) problems.add("Date must be a valid day.");
    const modifiedText = text(form, "lastmod");
    const lastmod = modifiedText ? fromOsloDate(modifiedText) : undefined;
    if (lastmod === null) problems.add("Modified must be a valid day, or empty.");

    if (problems.any || date === null || lastmod === null) return problems.state();

    // Product timestamps carry the time they were published; a day that did not change keeps it.
    const timestamp = existing && toOsloDate(existing.timestamp) === toOsloDate(date) ? existing.timestamp : date;
    const optionalText = (name: string) => text(form, name) || undefined;

    const product = ordered({
        ...existing,
        timestamp,
        title,
        content,
        thumbnailDescription,
        price,
        priceCurrency,
        link,
        documentationLink,
        sameAs,
        productType,
        operatingSystem: optionalText("operatingSystem"),
        formats: formats.length ? formats : undefined,
        license: license || undefined,
        softwareVersion: optionalText("softwareVersion"),
        fileSize: optionalText("fileSize"),
        mainImage: existing?.mainImage ?? `${slug}.jpg`,
        additionalImages: gallery.files.length ? gallery.files : undefined,
        additionalImageDescriptions: gallery.files.length ? gallery.descriptions : undefined,
        video,
        lastmod
    });

    if (existing) products[index] = product;
    else products.splice(newestFirstPosition(products, timestamp), 0, product);
    await writeDataFile("products", products);

    const allLinks = await readDataFile<ProductEquipmentLink[]>("productsEquipment");
    const updated = updateEquipmentLinks(allLinks, slug, equipmentLinks);
    if (JSON.stringify(updated) !== JSON.stringify(allLinks)) await writeDataFile("productsEquipment", updated);

    revalidatePath("/products", "layout");
    if (!existing) redirect(`/products/${slug}/?created=1`);
    return { status: "saved", message: "Saved to src/data/products/data/all.json." };
}

const IMAGE_TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg" };

/*
 * Adds one gallery image: the file goes into public/product-images under the
 * next free number for the product (subc_05.png), and onto the end of its
 * additionalImages. The web sizes are made by the gallery encoder afterwards.
 */
export async function addGalleryImage(slug: string, _previous: FormState, form: FormData): Promise<FormState> {
    const products = await readDataFile<Product[]>("products");
    const product = products.find((candidate) => convertToUrlFriendlyString(candidate.title) === slug);
    if (!product) return { status: "error", errors: ["Save the product first."] };

    const file = form.get("file");
    if (!(file instanceof File) || file.size === 0) return { status: "error", errors: ["Choose an image to add."] };
    const extension = IMAGE_TYPES[file.type];
    if (!extension) return { status: "error", errors: ["Gallery images must be PNG or JPEG, like the rest."] };

    const base = product.mainImage.replace(/\.[a-z]+$/, "");
    const taken = new Set((await fs.readdir(PRODUCT_IMAGES)).map((name) => name.replace(/\.[a-z]+$/, "")));
    let number = 1;
    while (taken.has(`${base}_${String(number).padStart(2, "0")}`)) number++;
    const fileName = `${base}_${String(number).padStart(2, "0")}.${extension}`;

    await fs.writeFile(path.join(PRODUCT_IMAGES, fileName), Buffer.from(await file.arrayBuffer()), { flag: "wx" });
    product.additionalImages = [...(product.additionalImages ?? []), fileName];
    const updated = products.map((candidate) => (candidate === product ? ordered(product) : candidate));
    await writeDataFile("products", updated);
    revalidatePath("/products", "layout");
    return { status: "saved", message: `Added ${fileName}. Give it a caption, then run the gallery encoder.` };
}

const run = promisify(execFile);

/*
 * Runs scripts/generate-product-images.mjs, the same thing as
 * `yarn images:products`: it encodes whatever gallery images are new or
 * changed, removes variants nothing references any more, and rewrites the
 * manifest the site reads.
 */
export async function encodeGallery(): Promise<FormState> {
    try {
        const { stdout } = await run(process.execPath, [path.join("scripts", "generate-product-images.mjs")], {
            cwd: REPO_ROOT,
            timeout: 10 * 60_000,
            maxBuffer: 10 * 1024 * 1024
        });
        revalidatePath("/products", "layout");
        const lines = stdout.trim().split("\n");
        return { status: "saved", message: lines.slice(-6).join(" ") || "Done." };
    } catch (error) {
        const failure = error as Error & { stderr?: string; stdout?: string };
        const output = `${failure.stdout ?? ""}\n${failure.stderr ?? ""}`.trim().split("\n").slice(-8);
        return { status: "error", errors: output.length ? output : [failure.message] };
    }
}
