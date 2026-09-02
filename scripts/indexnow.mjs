/*
 * Tells IndexNow which pages this release changed, so Bing and Yandex refetch
 * them rather than waiting for a crawl. Run against an export, from the repo
 * root, after the build:
 *
 *   node scripts/indexnow.mjs [directory]        (default: out)
 *   node scripts/indexnow.mjs --dry-run          print the list, submit nothing
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
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://www.dehlimusikk.no';
const SITE_HOST = 'www.dehlimusikk.no';
const ENDPOINT = 'https://api.indexnow.org/indexnow';

/*
 * How recently a page must have been published or updated to be submitted.
 * Comfortably longer than the gap between releases, so nothing is missed if two
 * land close together, and short enough that the list stays about what changed.
 */
const WINDOW_DAYS = 21;

/*
 * Pages whose front matter carries no date because their content is a list of
 * other things. They change whenever anything they list changes, so they go in
 * every time. Both languages: Norwegian at the root, English under /en/.
 */
const NAVIGATIONAL_PATHS = ['', 'products/', 'posts/', 'videos/', 'portfolio/', 'equipment/', 'frequently-asked-questions/'];

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const directory = args.find((arg) => !arg.startsWith('--')) || 'out';
const EXPORT_DIR = path.resolve(ROOT, directory);

if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`No ${directory}/ directory. Build first, then run this:\n\n   yarn build && node scripts/indexnow.mjs\n`);
    process.exitCode = 1;
} else {
    await run();
}

// Every index.md in the export, relative to its root
function markdownTwins(prefix = '') {
    const found = [];
    for (const entry of fs.readdirSync(path.join(EXPORT_DIR, prefix), { withFileTypes: true })) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
            if (entry.name === '_next') continue;
            found.push(...markdownTwins(relative));
        } else if (entry.name === 'index.md') {
            found.push(relative);
        }
    }
    return found;
}

// A declaration, not a const: run() is called above, before this point in the file
function frontMatterValue(markdown, field) {
    return markdown.match(new RegExp(`^${field}: "([^"]*)"$`, 'm'))?.[1] ?? null;
}

async function run() {
    const key = findKey();
    if (!key) {
        console.log('No IndexNow key file found in public/. Expected a single <32-hex>.txt whose contents are its own name.');
        process.exitCode = 1;
        return;
    }

    const cutoff = Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000;
    const navigational = new Set(NAVIGATIONAL_PATHS.flatMap((page) => [`${SITE_ORIGIN}/${page}`, `${SITE_ORIGIN}/en/${page}`]));

    const urls = new Set(navigational);
    let dated = 0;
    let recent = 0;

    for (const twin of markdownTwins()) {
        const markdown = fs.readFileSync(path.join(EXPORT_DIR, twin), 'utf8');
        const url = frontMatterValue(markdown, 'url');
        if (!url) continue;

        // Whichever is later: a post edited long after publication still counts
        const dates = ['published', 'modified'].map((field) => frontMatterValue(markdown, field)).filter(Boolean);
        if (!dates.length) continue;
        dated += 1;

        const newest = Math.max(...dates.map((date) => Date.parse(date)));
        if (Number.isFinite(newest) && newest >= cutoff) {
            urls.add(url);
            recent += 1;
        }
    }

    const urlList = [...urls].sort();
    console.log(`${dated} dated pages, ${recent} changed within ${WINDOW_DAYS} days, ${navigational.size} navigational`);
    console.log(`submitting ${urlList.length} URLs`);

    if (dryRun) {
        urlList.forEach((url) => console.log(`   ${url}`));
        console.log('\n--dry-run: nothing submitted');
        return;
    }

    const response = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
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
        .readdirSync(path.resolve(ROOT, 'public'))
        .filter((name) => /^[0-9a-f]{32}\.txt$/.test(name))
        .map((name) => name.replace(/\.txt$/, ''));

    if (candidates.length !== 1) return null;
    const [key] = candidates;
    const contents = fs.readFileSync(path.resolve(ROOT, 'public', `${key}.txt`), 'utf8').trim();
    return contents === key ? key : null;
}
