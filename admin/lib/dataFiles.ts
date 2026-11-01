import "server-only";

import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";

/*
 * Every file the admin reads or writes, and how each one is laid out on disk.
 *
 * Nothing outside this list can be touched: callers name a collection, never a
 * path, so a value coming from a form can at most pick which of these files is
 * written. The one directory-backed collection, releases, validates its file
 * names against a pattern for the same reason.
 *
 * The layouts match what is in the repo today, so saving a file that was not
 * changed produces no diff:
 * - "compact": posts, videos and releases, written on one line by the old
 *   authoring app and never edited by hand.
 * - "indented": the hand-edited files, at the 4-space indent most of them use.
 *   products differs only by one trailing space, which its first save drops.
 * - "indented2": the equipment lists, at a 2-space indent. effects matches it
 *   exactly but for a final newline; instruments and amplifiers open with
 *   "[{" on one line, which their first save splits.
 * - "rows": one object per line. releasesInstruments is 441 two-field links,
 *   and this is the layout it already has, byte for byte.
 */

/*
 * `yarn admin` starts Next from the repo root, but `next dev` run from inside
 * admin/ is just as plausible, so look for the repo rather than assume either.
 */
function findRepoRoot(): string {
    for (let dir = process.cwd(); ; dir = path.dirname(dir)) {
        if (existsSync(path.join(dir, "admin", "next.config.mjs")) && existsSync(path.join(dir, "src", "data"))) return dir;
        if (path.dirname(dir) === dir) throw new Error("Could not find the repo root from " + process.cwd());
    }
}

export const REPO_ROOT = findRepoRoot();
const DATA_DIR = path.join(REPO_ROOT, "src", "data");

type Layout = "compact" | "indented" | "indented2" | "rows";

const FILES = {
    posts: { file: "posts/data/all.json", layout: "compact" },
    videos: { file: "videos/data/all.json", layout: "compact" },
    products: { file: "products/data/all.json", layout: "indented" },
    productsEquipment: { file: "products/data/productsEquipment.json", layout: "indented" },
    // Written by scripts/generate-product-images.mjs; the admin only reads it.
    productGallery: { file: "products/data/gallery.json", layout: "indented" },
    instruments: { file: "equipment/data/instruments.json", layout: "indented2" },
    effects: { file: "equipment/data/effects.json", layout: "indented2" },
    amplifiers: { file: "equipment/data/amplifiers.json", layout: "indented2" },
    releasesInstruments: { file: "linkedData/releasesInstruments.json", layout: "rows" },
    releaseAlbums: { file: "linkedData/releaseAlbums.json", layout: "indented" },
    frequentlyAskedQuestions: { file: "frequentlyAskedQuestions/data/all.json", layout: "indented" }
} as const satisfies Record<string, { file: string; layout: Layout }>;

export type DataFile = keyof typeof FILES;

const RELEASES_DIR = path.join(DATA_DIR, "releases", "data");
const RELEASE_FILE = /^[A-Za-z0-9_-]+\.json$/;

// {"releaseId": "x", "equipmentId": "y"}: a space after each colon and comma, as written by hand.
const row = (item: object) =>
    `{${Object.entries(item)
        .map(([key, value]) => `${JSON.stringify(key)}: ${JSON.stringify(value)}`)
        .join(", ")}}`;

function serialize(value: unknown, layout: Layout): string {
    if (layout === "compact") return JSON.stringify(value);
    if (layout === "rows") return `[\n${(value as object[]).map((item) => `  ${row(item)}`).join(",\n")}\n]\n`;
    return `${JSON.stringify(value, null, layout === "indented2" ? 2 : 4)}\n`;
}

/*
 * Written beside the target and renamed over it, so a crash or a full disk
 * mid-write leaves the old file intact rather than half a JSON document that
 * breaks the site's build.
 */
async function writeAtomically(target: string, contents: string): Promise<void> {
    const resolvedTarget = path.resolve(target);
    const dir = path.dirname(resolvedTarget);
    const temporary = path.join(dir, `${path.basename(resolvedTarget)}.${process.pid}.tmp`);
    const resolvedTemporary = path.resolve(temporary);
    if (resolvedTemporary !== dir && !resolvedTemporary.startsWith(`${dir}${path.sep}`)) {
        throw new Error(`Temporary path escapes target directory: ${temporary}`);
    }
    await fs.writeFile(resolvedTemporary, contents, "utf8");
    await fs.rename(resolvedTemporary, resolvedTarget);
        throw new Error(`Refusing to write outside data directory: ${target}`);
    }
    const targetDir = path.dirname(safeTarget);
    const targetName = path.basename(safeTarget);
    const temporary = path.join(targetDir, `.${targetName}.${process.pid}.tmp`);
    await fs.writeFile(temporary, contents, "utf8");
    await fs.rename(temporary, safeTarget);
}

export async function readDataFile<T>(name: DataFile): Promise<T> {
    const { file } = FILES[name];
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T;
}

export async function writeDataFile(name: DataFile, value: unknown): Promise<void> {
    const { file, layout } = FILES[name];
    await writeAtomically(path.join(DATA_DIR, file), serialize(value, layout));
}

    const resolved = path.resolve(RELEASES_DIR, fileName);
    if (resolved !== root && !resolved.startsWith(`${root}${path.sep}`)) throw new Error(`Release path escapes releases directory: ${fileName}`);
    return resolved;
}

/** Every release, keyed by its file name. Finder's .DS_Store and the like are skipped. */
export async function readReleases<T>(): Promise<Record<string, T>> {
    const names = (await fs.readdir(RELEASES_DIR)).filter((name) => RELEASE_FILE.test(name)).sort();
    const entries = await Promise.all(names.map(async (name) => [name, JSON.parse(await fs.readFile(releasePath(name), "utf8"))] as const));
    return Object.fromEntries(entries);
}

export async function writeRelease(fileName: string, value: unknown): Promise<void> {
    await writeAtomically(releasePath(fileName), serialize(value, "compact"));
}

export async function deleteReleaseFile(fileName: string): Promise<void> {
    await fs.unlink(releasePath(fileName));
}
