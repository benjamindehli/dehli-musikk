/*
 * Generates the web sized variants of the product gallery images.
 *
 * The originals in public/product-images are camera files and full resolution
 * screen captures: 77MB across the 81 images the products reference, with
 * single photos over 4MB. They were never meant to reach a browser. Until now
 * nothing rendered them, and they existed only to be named in the product
 * JSON-LD and in the merchant feeds.
 *
 * The product pages show them now, so they need the same treatment the main
 * product image already gets: avif, webp and jpeg at a few widths, written to
 * public/data/products/gallery.
 *
 * Aspect ratios are preserved rather than cropped. The main image pipeline
 * crops to fixed shapes - 55x55 for the list thumbnails, 540x400 for the
 * detail view - because every product has exactly one photo, framed the same
 * way. These do not: the set runs from 134x323 to 1039x195, because some are
 * product photos and some are close ups of a single control, and one fixed
 * crop would cut the subject out of half of them.
 *
 * Nothing upscales. An image narrower than a target width is not generated at
 * that width at all, and the manifest records only what was written, so the
 * markup never offers a candidate that is a blown up copy of a smaller one.
 *
 * Run from the repo root, after adding or replacing an image:
 *
 *     yarn images:products            (only what is missing or out of date)
 *     yarn images:products --force    (everything, after changing quality)
 *
 * Out of date means the source's content no longer matches what the manifest
 * records, so replacing a screenshot is a plain rerun. --force is for the case
 * the sources cannot signal: changing a quality setting or a width above.
 *
 * This is an authoring step, not a build step. The output is committed, the
 * same way public/data/products/web already is, and CI never runs it.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "public", "product-images");
const OUTPUT_DIR = path.join(ROOT, "public", "data", "products", "gallery");
const MANIFEST_PATH = path.join(ROOT, "src", "data", "products", "data", "gallery.json");
const PRODUCTS_PATH = path.join(ROOT, "src", "data", "products", "data", "all.json");

/*
 * The product detail view is a 540px modal, so 1200 already covers it at 2x on
 * the widest image with room to spare. 400 is the phone case, 800 the middle.
 * Widening the modal later is a matter of adding a number here and rerunning.
 */
const WIDTHS = [400, 800, 1200];

/*
 * avif carries almost all the traffic, so it gets the effort budget: quality 55
 * with effort 6 is roughly a third of the webp at the same apparent quality on
 * these images. The other two are fallbacks, and their quality is set high
 * enough that the screenshots stay readable - UI text is the worst case for a
 * lossy codec, and 82 is where the knob labels stop smearing.
 */
const ENCODERS = {
    avif: (pipeline) => pipeline.avif({ quality: 55, effort: 6 }),
    webp: (pipeline) => pipeline.webp({ quality: 82 }),
    // Flattened because a jpeg cannot carry the alpha some of the PNG captures
    // have, and sharp would otherwise composite it onto black.
    jpg: (pipeline) => pipeline.flatten({ background: "#ffffff" }).jpeg({ quality: 82, mozjpeg: true })
};

const force = process.argv.includes("--force");

async function loadSharp() {
    try {
        return (await import("sharp")).default;
    } catch (error) {
        console.error(
            [
                "This script needs sharp, which is not installed for this platform.",
                "",
                "    yarn add --dev sharp",
                "",
                `(${error.message.split("\n")[0]})`
            ].join("\n")
        );
        process.exit(1);
    }
}

/*
 * Only the images the products actually reference, and each one once: the
 * 4-track captures are shared by the toy piano, the glockenspiel and the music
 * box, so walking the directory instead would be fine but walking the data and
 * not deduplicating would encode every one of them three times.
 *
 * mainImage is deliberately absent. It already has generated sizes under
 * public/data/products/web, produced by the authoring app, and a second
 * pipeline writing a second set of the same photo is how the two drift apart.
 */
function referencedImages() {
    const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, "utf8"));
    const seen = new Map();
    for (const product of products) {
        for (const filename of product.additionalImages ?? []) {
            if (!seen.has(filename)) seen.set(filename, product.title);
        }
    }
    return seen;
}

/*
 * Output names drop the source extension, so a product carrying both a foo.jpg
 * and a foo.png would silently write one over the other. Nothing does today,
 * and this is here so that stays true rather than becoming a puzzle about why
 * one gallery image looks like another.
 */
function assertNoBasenameCollisions(filenames) {
    const byBase = new Map();
    for (const filename of filenames) {
        const base = path.parse(filename).name;
        if (byBase.has(base)) {
            console.error(`Two source images share the basename "${base}": ${byBase.get(base)} and ${filename}.`);
            console.error("Rename one of them - the generated files are named after the basename alone.");
            process.exit(1);
        }
        byBase.set(base, filename);
    }
}

/*
 * What the outputs were last made from. A missing or unreadable manifest means
 * the first run, or a deliberate reset, and everything is encoded again.
 */
function previousManifest() {
    try {
        return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
    } catch {
        return {};
    }
}

/*
 * The source's content, not its timestamp, decides whether its variants are
 * current. mtime is the obvious signal and it is wrong in exactly the case that
 * matters: a replaced screenshot arrives carrying the date it was captured or
 * exported, routinely older than the variants it is meant to replace, so an
 * mtime comparison reads "already current" and skips the one image that
 * changed. Renumbering a set is the worst version of it, because every file in
 * the set lands on content it has never been encoded from, and the failure is
 * silent: the manifest is rewritten from fresh metadata either way, so the
 * dimensions are right and only the pixels are a previous photo.
 *
 * Sixteen hex characters of sha256 is 64 bits, far more than a set this size
 * needs, and short enough to keep the manifest diff readable when one photo is
 * replaced.
 */
function fingerprint(sourcePath) {
    return crypto.createHash("sha256").update(fs.readFileSync(sourcePath)).digest("hex").slice(0, 16);
}

/*
 * Variants nothing refers to any more. A source that shrinks past a width, or a
 * set that loses a member, leaves files behind that no page will ever ask for,
 * and nothing else would ever remove them. This directory is written by this
 * script alone, so anything outside the expected set is left over by definition.
 */
function prune(expected) {
    const removed = [];
    for (const format of Object.keys(ENCODERS)) {
        const dir = path.join(OUTPUT_DIR, format);
        for (const entry of fs.readdirSync(dir)) {
            const relative = `${format}/${entry}`;
            if (expected.has(relative)) continue;
            fs.unlinkSync(path.join(dir, entry));
            removed.push(relative);
        }
    }
    return removed;
}

async function run() {
    const sharp = await loadSharp();

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`No ${path.relative(ROOT, SOURCE_DIR)} directory.`);
        process.exit(1);
    }

    const referenced = referencedImages();
    assertNoBasenameCollisions([...referenced.keys()]);

    for (const format of Object.keys(ENCODERS)) {
        fs.mkdirSync(path.join(OUTPUT_DIR, format), { recursive: true });
    }

    const previous = previousManifest();
    const manifest = {};
    const expected = new Set();
    const missing = [];
    let written = 0;
    let skipped = 0;
    let sourceBytes = 0;
    let outputBytes = 0;

    for (const [filename, productTitle] of referenced) {
        const sourcePath = path.join(SOURCE_DIR, filename);
        if (!fs.existsSync(sourcePath)) {
            missing.push(`${filename} (referenced by ${productTitle})`);
            continue;
        }

        const base = path.parse(filename).name;
        const sourceStat = fs.statSync(sourcePath);
        const hash = fingerprint(sourcePath);
        const changed = force || previous[filename]?.hash !== hash;
        const metadata = await sharp(sourcePath).metadata();
        const { width, height } = metadata;
        if (!width || !height) {
            missing.push(`${filename} (unreadable dimensions)`);
            continue;
        }

        sourceBytes += sourceStat.size;

        /*
         * Never wider than the original. An image smaller than every step still
         * gets one variant at its own width, so the markup has something to
         * point at that is not the unoptimised original - several of the control
         * close ups are only 250px across but still arrive as 56kB PNGs.
         */
        const targetWidths = WIDTHS.filter((candidate) => candidate <= width);
        if (targetWidths.length === 0) targetWidths.push(width);

        for (const targetWidth of targetWidths) {
            for (const [format, encode] of Object.entries(ENCODERS)) {
                const relative = `${format}/${base}_${targetWidth}.${format}`;
                const outputPath = path.join(OUTPUT_DIR, relative);
                expected.add(relative);
                // A file deleted by hand is written again even when the source
                // is untouched, so the manifest's promise always holds.
                if (changed || !fs.existsSync(outputPath)) {
                    // withoutEnlargement belts the braces on the filter above:
                    // fit "inside" keeps the aspect ratio, and the height is
                    // left to follow from the width rather than being given.
                    await encode(sharp(sourcePath).resize({ width: targetWidth, withoutEnlargement: true, fit: "inside" })).toFile(outputPath);
                    written++;
                } else {
                    skipped++;
                }
                outputBytes += fs.statSync(outputPath).size;
            }
        }

        /*
         * The intrinsic size travels with the manifest so the markup can set
         * width and height on every image. Without it a gallery of images this
         * irregular - portrait captures next to 5:1 strips - reflows the page
         * under the visitor as each one arrives.
         */
        manifest[filename] = { base, width, height, widths: targetWidths, hash };
    }

    /*
     * Pruning is skipped when a source has gone missing, because then the
     * variants are the only copy left of that image and deleting them is not
     * recoverable by rerunning. The missing source is reported below either way.
     */
    const removed = missing.length ? [] : prune(expected);

    // Sorted so a rerun that changes nothing produces no diff, which keeps the
    // manifest out of the way when reviewing an actual image change.
    const sorted = Object.fromEntries(
        Object.keys(manifest)
            .sort()
            .map((key) => [key, manifest[key]])
    );
    fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 4)}\n`);

    const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;
    console.log(`${Object.keys(sorted).length} images, ${written} files written, ${skipped} already current`);
    if (removed.length) {
        console.log(`${removed.length} file(s) no longer referenced, removed:`);
        for (const entry of removed) console.log(`  ${entry}`);
    }
    if (missing.length) {
        console.log("skipped removing unreferenced files: a source is missing, and its variants may be the only copy");
    }
    console.log(`sources ${mb(sourceBytes)} -> variants ${mb(outputBytes)} across ${Object.keys(ENCODERS).length} formats`);
    console.log(`manifest: ${path.relative(ROOT, MANIFEST_PATH)}`);

    if (missing.length) {
        console.error(`\n${missing.length} referenced image(s) not found:`);
        for (const entry of missing) console.error(`  ${entry}`);
        process.exitCode = 1;
    }
}

run();
