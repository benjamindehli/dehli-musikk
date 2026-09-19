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
 * The third failure has no markup symptom at all: variants that were encoded
 * from a previous version of the source, which look entirely correct to every
 * check that only counts files. The manifest carries each source's content hash
 * so that this one is visible too. See the note on fingerprinting in
 * generate-product-images.mjs for how a source gets replaced without its
 * timestamp ever moving forward.
 *
 * Run from the repo root, and it needs no build:
 *
 *     yarn verify:images
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const PRODUCTS_PATH = path.join(ROOT, "src", "data", "products", "data", "all.json");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "products", "data", "gallery.json");
const SOURCE_DIR = path.join(ROOT, "public", "product-images");
const GALLERY_DIR = path.join(ROOT, "public", "data", "products", "gallery");

const FORMATS = ["avif", "webp", "jpg"];

const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

const problems = [];

/*
 * Every referenced image is described by the manifest. A source that is gone
 * altogether gets said out loud rather than being reported as ungenerated: the
 * generator drops the entry when it cannot find the file, so the two arrive
 * looking identical and the fix for them is not the same one.
 */
for (const product of products) {
    for (const filename of product.additionalImages ?? []) {
        if (manifest[filename]) continue;
        if (fs.existsSync(path.join(SOURCE_DIR, filename))) {
            problems.push(`${product.title}: "${filename}" has no generated sizes`);
        } else {
            problems.push(`${product.title}: "${filename}" is not in ${path.relative(ROOT, SOURCE_DIR)}`);
        }
    }
}

// Every described image is on disk, at every width and in every format, and was
// encoded from the source that is there now
const expected = new Set();
for (const [filename, image] of Object.entries(manifest)) {
    if (!image?.base || !Array.isArray(image.widths) || !image.widths.length || !image.hash) {
        problems.push(`${filename}: malformed manifest entry`);
        continue;
    }
    for (const width of image.widths) {
        for (const format of FORMATS) {
            const relative = `${format}/${image.base}_${width}.${format}`;
            expected.add(relative);
            if (!fs.existsSync(path.join(GALLERY_DIR, relative))) {
                problems.push(`${filename}: missing ${path.relative(ROOT, path.join(GALLERY_DIR, relative))}`);
            }
        }
    }

    const sourcePath = path.join(SOURCE_DIR, filename);
    if (!fs.existsSync(sourcePath)) {
        problems.push(`${filename}: source is gone from ${path.relative(ROOT, SOURCE_DIR)}`);
        continue;
    }
    const hash = crypto.createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex").slice(0, 16);
    if (hash !== image.hash) {
        problems.push(`${filename}: source has changed since it was encoded (${image.hash} -> ${hash})`);
    }
}

/*
 * And nothing else. Files left over from a width that no longer applies are not
 * a rendering fault, but they are committed and deployed forever, and their
 * presence is the sign that a source was replaced by one of a different shape.
 */
for (const format of FORMATS) {
    const dir = path.join(GALLERY_DIR, format);
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
        if (!expected.has(`${format}/${entry}`)) {
            problems.push(`${format}/${entry}: not referenced by the manifest`);
        }
    }
}

if (problems.length) {
    console.error(`${problems.length} problem(s) with the product gallery images:\n`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error("\nRun `yarn images:products` to generate what is missing and clear out what is stale.");
    process.exitCode = 1;
} else {
    const count = Object.keys(manifest).length;
    console.log(
        `product gallery complete: ${count} image${count === 1 ? "" : "s"}, all widths present in ${FORMATS.join(", ")}, all encoded from the sources on disk`
    );
}
