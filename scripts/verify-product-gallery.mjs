/*
 * Checks that every gallery image a product references has been generated, and
 * that everything the manifest promises is actually on disk.
 *
 * The gallery renders only the images it finds in the manifest, so a product
 * whose screenshots were never encoded loses them silently: the page builds,
 * the type checker is happy, verify-markup-assets sees no broken path because
 * no markup was emitted, and the only symptom is a product page that looks the
 * way it did before anyone added the gallery. That is the failure this catches.
 *
 * The other direction matters too. A manifest entry whose files were deleted
 * does produce markup pointing at nothing, and while verify-markup-assets would
 * catch it against a build, this says so without needing one.
 *
 * Run from the repo root, and it needs no build:
 *
 *     yarn verify:images
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PRODUCTS_PATH = path.join(ROOT, "src", "data", "products", "data", "all.json");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "products", "data", "gallery.json");
const GALLERY_DIR = path.join(ROOT, "public", "data", "products", "gallery");

const FORMATS = ["avif", "webp", "jpg"];

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

const problems = [];

// Every referenced image is described by the manifest
for (const product of products) {
    for (const filename of product.additionalImages ?? []) {
        if (!manifest[filename]) {
            problems.push(`${product.title}: "${filename}" has no generated sizes`);
        }
    }
}

// Every described image is on disk, at every width and in every format
for (const [filename, image] of Object.entries(manifest)) {
    if (!image?.base || !Array.isArray(image.widths) || !image.widths.length) {
        problems.push(`${filename}: malformed manifest entry`);
        continue;
    }
    for (const width of image.widths) {
        for (const format of FORMATS) {
            const file = path.join(GALLERY_DIR, format, `${image.base}_${width}.${format}`);
            if (!fs.existsSync(file)) {
                problems.push(`${filename}: missing ${path.relative(ROOT, file)}`);
            }
        }
    }
}

if (problems.length) {
    console.error(`${problems.length} problem(s) with the product gallery images:\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error("\nRun `yarn images:products` to generate what is missing.");
    process.exitCode = 1;
} else {
    const count = Object.keys(manifest).length;
    console.log(`product gallery complete: ${count} image${count === 1 ? "" : "s"}, all widths present in ${FORMATS.join(", ")}`);
}
