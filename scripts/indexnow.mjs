/*
 * Tells IndexNow which pages this release changed, so Bing and Yandex refetch
 * them rather than waiting for a crawl. Run against an export, from the repo
 * root, after the build:
 *
 *   node scripts/indexnow.mjs [directory]        (default: out)
 *   node scripts/indexnow.mjs --dry-run          print the list, submit nothing
 *   node scripts/indexnow.mjs --also urls.txt    submit these as well
 *
 * Bing's index is what ChatGPT search and Copilot query, so this is the shortest
 * path from publishing something to it being citable in an AI answer. Google
 * does not participate in IndexNow and still has to be left to crawl.
 *
 * The change signal comes from the markdown twins: every page ships an index.md
 * whose front matter carries published and modified dates. That means this needs
 * no access to src/data, no sitemap parsing and no second definition of what a
 * page is - it reads what the build actually produced.
 *
 * Only recently dated pages plus the navigational pages are submitted, never the
 * whole site. IndexNow asks for changed URLs specifically, and resubmitting
 * fifteen hundred unchanged pages every release is the kind of thing that gets an
 * endpoint ignored.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SITE_ORIGIN = "https://www.dehlimusikk.no";
const SITE_HOST = "www.dehlimusikk.no";
const ENDPOINT = "https://api.indexnow.org/indexnow";

/*
 * How recently a page must have been published or updated to be submitted.
 * Comfortably longer than the gap between releases, so nothing is missed if two
 * land close together, and short enough that the list stays about what changed.
 */
const WINDOW_DAYS = 21;

/*
 * --also exists because the date window below answers "what was published or
 * edited recently", which is not the same question as "what changed". A release
 * that rewrites every page's title and description, or adds a sameAs to a
 * product, moves no dates at all, so none of those pages would be submitted.
 *
 * One URL or site-relative path per line; blank lines and # comments ignored.
 * Kept as an explicit opt-in rather than a heuristic: resubmitting the whole
 * site every release is what gets an endpoint ignored, so widening the set
 * should be a decision someone makes for a particular release.
 */

/*
 * Pages whose front matter carries no date because their content is a list of
 * other things. They change whenever anything they list changes, so they go in
 * every time. Both languages: Norwegian at the root, English under /en/.
 */
const NAVIGATIONAL_PATHS = ["", "products/", "posts/", "videos/", "portfolio/", "equipment/", "frequently-asked-questions/"];

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

/*
 * --also takes the following argument as its value, so that value has to be
 * excluded before the first remaining non-flag argument is read as the export
 * directory. Otherwise "--also urls.txt" silently sets the directory to
 * urls.txt, and the script reports no twins rather than saying anything useful.
 */
const alsoFlagIndex = args.indexOf("--also");
const alsoFile = alsoFlagIndex === -1 ? null : args[alsoFlagIndex + 1];
const directory = args.find((arg, index) => !arg.startsWith("--") && index !== alsoFlagIndex + 1) || "out";
const EXPORT_DIR = path.resolve(ROOT, directory);

if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`No ${directory}/ directory. Build first, then run this:\n\n   yarn build && node scripts/indexnow.mjs\n`);
    process.exitCode = 1;
} else {
    await run();
}

// Every index.md in the export, relative to its root
function markdownTwins(prefix = "") {
    const found = [];
    for (const entry of fs.readdirSync(path.join(EXPORT_DIR, prefix), { withFileTypes: true })) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            if (entry.name === "_next") continue;
            found.push(...markdownTwins(relative));
        } else if (entry.name === "index.md") {
            found.push(relative);
        }
    }
    return found;
}

/*
 * IndexNow rejects a submission outright if any URL in it is off-host, so one
 * mistyped line would lose the whole batch. Reported as an error rather than
 * skipped: a URL silently dropped from a list someone wrote by hand is worse
 * than being told to fix it, and --also is only ever run by hand.
 */
function readAlsoUrls(file) {
    const resolved = path.resolve(ROOT, file);
    if (!fs.existsSync(resolved)) return { error: `No such file: ${file}` };

    const lines = fs
        .readFileSync(resolved, "utf8")
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"));

    const urls = [];
    const rejected = [];
    for (const line of lines) {
        // Site-relative paths are accepted so a list can be pasted from a report
        const candidate = /^https?:\/\//.test(line) ? line : `${SITE_ORIGIN}/${line.replace(/^\//, "")}`;
        let parsed = null;
        try {
            parsed = new URL(candidate);
        } catch {
            rejected.push(`${line} (not a URL)`);
            continue;
        }
        if (parsed.host !== SITE_HOST) {
            rejected.push(`${line} (host ${parsed.host})`);
            continue;
        }
        /*
         * Checked against the export, because a typo would otherwise be
         * submitted as a URL that 404s. Asking an endpoint to crawl pages that
         * are not there is the other way to get it to stop listening.
         */
        const pagePath = decodeURIComponent(parsed.pathname).replace(/^\/|\/$/g, "");
        if (!fs.existsSync(path.join(EXPORT_DIR, pagePath, "index.html"))) {
            rejected.push(`${line} (no such page in ${directory}/)`);
            continue;
        }
        urls.push(candidate);
    }

    if (rejected.length) return { error: `Cannot submit:\n   ${rejected.join("\n   ")}` };
    return { urls };
}

// A declaration, not a const: run() is called above, before this point in the file
function frontMatterValue(markdown, field) {
    return markdown.match(new RegExp(`^${field}: "([^"]*)"$`, "m"))?.[1] ?? null;
}

async function run() {
    const key = findKey();
    if (!key) {
        console.log("No IndexNow key file found in public/. Expected a single <32-hex>.txt whose contents are its own name.");
        process.exitCode = 1;
        return;
    }

    let also = [];
    if (alsoFile) {
        const result = readAlsoUrls(alsoFile);
        if (result.error) {
            console.log(`--also: ${result.error}`);
            process.exitCode = 1;
            return;
        }
        also = result.urls;
    } else if (alsoFlagIndex !== -1) {
        console.log("--also needs a file: node scripts/indexnow.mjs --also urls.txt");
        process.exitCode = 1;
        return;
    }

    const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const navigational = new Set(NAVIGATIONAL_PATHS.flatMap((page) => [`${SITE_ORIGIN}/${page}`, `${SITE_ORIGIN}/en/${page}`]));

    const urls = new Set(navigational);
    let dated = 0;
    let recent = 0;

    for (const twin of markdownTwins()) {
        const markdown = fs.readFileSync(path.join(EXPORT_DIR, twin), "utf8");
        const url = frontMatterValue(markdown, "url");
        if (!url) continue;

        // Whichever is later: a post edited long after publication still counts
        const dates = ["published", "modified"].map((field) => frontMatterValue(markdown, field)).filter(Boolean);
        if (!dates.length) continue;
        dated += 1;

        const newest = Math.max(...dates.map((date) => Date.parse(date)));
        if (Number.isFinite(newest) && newest >= cutoff) {
            urls.add(url);
            recent += 1;
        }
    }

    const beforeAlso = urls.size;
    also.forEach((url) => urls.add(url));

    const urlList = [...urls].sort();
    console.log(`${dated} dated pages, ${recent} changed within ${WINDOW_DAYS} days, ${navigational.size} navigational`);
    if (alsoFile) console.log(`${also.length} from ${alsoFile}, ${urls.size - beforeAlso} of them not already listed`);
    console.log(`submitting ${urlList.length} URLs`);

    if (dryRun) {
        urlList.forEach((url) => console.log(`   ${url}`));
        console.log("\n--dry-run: nothing submitted");
        return;
    }

    const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ host: SITE_HOST, key, keyLocation: `${SITE_ORIGIN}/${key}.txt`, urlList })
    });

    /*
     * A rejected submission must not fail the release: the site is already
     * deployed and correct by this point, and the only thing lost is a hint that
     * Bing would otherwise have picked up on its next crawl. Reported loudly,
     * exits zero.
     */
    if (response.ok) {
        console.log(`IndexNow accepted the submission (HTTP ${response.status})`);
    } else {
        console.log(`IndexNow returned HTTP ${response.status}. The release is unaffected; the pages will be found by the next crawl.`);
        console.log((await response.text()).slice(0, 500));
    }
}

/*
 * The key lives in public/ as <key>.txt containing the key, which is how
 * IndexNow verifies the submitter controls the site. Read from there rather than
 * duplicated in a secret, so the file that proves ownership and the value sent
 * cannot disagree.
 */
function findKey() {
    const candidates = fs
        .readdirSync(path.resolve(ROOT, "public"))
        .filter((name) => /^[0-9a-f]{32}\.txt$/.test(name))
        .map((name) => name.replace(/\.txt$/, ""));

    if (candidates.length !== 1) return null;
    const [key] = candidates;
    const contents = fs.readFileSync(path.resolve(ROOT, "public", `${key}.txt`), "utf8").trim();
    return contents === key ? key : null;
}
