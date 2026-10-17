import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/*
 * Thumbnail URLs with a version on the end: /data/products/web/jpg/subc_540.jpg?v=3f2a9c1b7e4d
 *
 * The thumbnails under public/data/**\/web are replaced in place when an image
 * is re-exported, so the URL stays the same. firebase.json gives everything
 * under /data a year's max-age and nothing purges Cloudflare on deploy, so in
 * 2.20.5 Overtonium's new thumbnails were live while every cache kept serving
 * the old ones. The gallery images updated in the same release only because
 * their filenames carry a content hash.
 *
 * The version is a hash of every file in a set (one name, all its sizes, all
 * three formats), so re-exporting a set changes all of its URLs together.
 * Cloudflare keys its cache on the query string, so a new version misses both
 * the edge cache and the browser's.
 *
 * Server only: this reads public/ from disk during the build. The search box
 * builds its URLs in the browser, so it gets the same version through the
 * search JSON instead (see searchDataHelpers).
 */

const PUBLIC_DIR = path.join(process.cwd(), "public");
const FORMATS = ["avif", "webp", "jpg"] as const;

type Format = (typeof FORMATS)[number];

const listings = new Map<string, string[]>();
const versions = new Map<string, string>();

function listDirectory(directory: string): string[] {
    let files = listings.get(directory);
    if (!files) {
        files = fs.existsSync(directory) ? fs.readdirSync(directory).sort() : [];
        listings.set(directory, files);
    }
    return files;
}

/*
 * webDir is the site path of a web directory, such as "/data/products/web".
 * A set with no files on disk gets an empty version, and its URLs go out bare
 * rather than with a hash of nothing; verify:thumbnails reports missing files.
 */
export function thumbnailVersion(webDir: string, name: string): string {
    const key = `${webDir}/${name}`;
    const cached = versions.get(key);
    if (cached !== undefined) return cached;

    const pattern = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_\\d+\\.[a-z]+$`);
    const hash = createHash("sha256");
    let found = false;
    for (const format of FORMATS) {
        const directory = path.join(PUBLIC_DIR, webDir, format);
        for (const file of listDirectory(directory)) {
            if (!pattern.test(file)) continue;
            found = true;
            hash.update(`${format}/${file}\0`);
            hash.update(fs.readFileSync(path.join(directory, file)));
        }
    }

    const version = found ? hash.digest("hex").slice(0, 12) : "";
    versions.set(key, version);
    return version;
}

export const withThumbnailVersion = (url: string, version: string | undefined) => (version ? `${url}?v=${version}` : url);

export function thumbnailUrl(webDir: string, name: string, size: number, format: Format): string {
    return withThumbnailVersion(`${webDir}/${format}/${name}_${size}.${format}`, thumbnailVersion(webDir, name));
}

/*
 * The `${format}${size}` map the <picture> components take, for the given sizes.
 * Typed with exactly the keys asked for, so a caller reading image.jpg540 gets
 * a string rather than ResponsiveImage's optional, nullable one.
 */
export function thumbnailImage<Size extends number>(webDir: string, name: string, sizes: readonly Size[]) {
    const image = {} as Record<`${Format}${Size}`, string>;
    for (const format of FORMATS) {
        for (const size of sizes) {
            image[`${format}${size}`] = thumbnailUrl(webDir, name, size, format);
        }
    }
    return image;
}
