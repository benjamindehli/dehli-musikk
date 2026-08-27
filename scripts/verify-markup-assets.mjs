/*
 * Checks that every file the markup points at is actually there. Run against an
 * export, from the repo root:
 *
 *   node scripts/verify-markup-assets.mjs [directory]     (default: out)
 *
 * The structured data and the social metadata name images no visitor ever sees
 * rendered, so a wrong path in them is invisible from the site itself: the pages
 * look right, the thumbnail script passes, the type checker is happy, and only a
 * crawler ever notices. That is how every product page came to advertise its
 * images at the site root while the files sat in /product-images.
 *
 * This reads the built HTML rather than the source data on purpose. Checking the
 * data would only prove the files exist somewhere; the bug worth catching is the
 * markup naming the wrong path for a file that does exist.
 *
 * Deliberately narrow, so a failure always means something: only our own host,
 * and only extensions that are static files. Route handler output (rss, xml,
 * txt) is skipped because how it lands on disk is up to the exporter rather than
 * to anything the markup controls.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE = 'https://www.dehlimusikk.no';
const directory = process.argv[2] || 'out';

const ASSET_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'ico', 'gif',
    'woff', 'woff2', 'ttf', 'otf',
    'json'
]);

// public/ is checked as well as the export: the same script then works against a
// build that keeps its HTML apart from the static files it serves.
const ASSET_ROOTS = [directory, 'public'];

if (!fs.existsSync(path.join(ROOT, directory))) {
    console.log(`No ${directory}/ directory. Build first, then run this:\n\n   yarn build && node scripts/verify-markup-assets.mjs\n`);
    process.exitCode = 1;
} else {
    run();
}

function htmlFiles(from) {
    const found = [];
    for (const entry of fs.readdirSync(path.join(ROOT, from), { withFileTypes: true })) {
        const relative = `${from}/${entry.name}`;
        if (entry.isDirectory()) found.push(...htmlFiles(relative));
        else if (entry.name.endsWith('.html')) found.push(relative);
    }
    return found;
}

/*
 * A URL is only interesting if it names a static file on our own host. Anything
 * else, an external link, a page, a search action template, is not this script's
 * business.
 */
function assetPath(value) {
    if (!value) return null;

    let candidate = value.trim();
    if (candidate.startsWith(SITE)) candidate = candidate.slice(SITE.length);
    else if (!candidate.startsWith('/')) return null;
    // Root-relative but on no host we know, e.g. //cdn.example.com/x.png
    if (candidate.startsWith('//')) return null;

    const withoutSuffix = candidate.split(/[?#]/)[0];
    const extension = path.extname(withoutSuffix).slice(1).toLowerCase();
    if (!ASSET_EXTENSIONS.has(extension)) return null;

    try {
        return decodeURIComponent(withoutSuffix);
    } catch {
        // A malformed escape is a broken reference in its own right
        return withoutSuffix;
    }
}

function resolveAsset(assetPathname) {
    for (const root of ASSET_ROOTS) {
        const file = path.join(ROOT, root, assetPathname);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) return root;
    }
    return null;
}

function run() {
    const files = htmlFiles(directory);

    // Where a URL came from, so a failure says which markup to go and fix
    const sources = { 'structured data': new Map(), 'head metadata': new Map() };

    const record = (kind, assetPathname, page) => {
        if (!sources[kind].has(assetPathname)) sources[kind].set(assetPathname, page);
    };

    for (const file of files) {
        const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
        const page = file.slice(directory.length + 1);

        // JSON-LD, wherever in the document it sits. The blocks escape "<" as
        // <, so read the URLs out of the decoded text.
        for (const [, block] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
            const decoded = block.replaceAll('\\u003c', '<');
            for (const [, url] of decoded.matchAll(/"(https:\/\/www\.dehlimusikk\.no\/[^"]*)"/g)) {
                const found = assetPath(url);
                if (found) record('structured data', found, page);
            }
        }

        // link and meta in the head: og:image, twitter:image, icons, manifest,
        // font preloads
        const head = html.match(/<head[^>]*>(.*?)<\/head>/s);
        if (head) {
            for (const [, value] of head[1].matchAll(/<(?:link|meta)\b[^>]*?(?:href|content)="([^"]*)"/g)) {
                const found = assetPath(value);
                if (found) record('head metadata', found, page);
            }
        }
    }

    const missing = [];
    for (const [kind, referenced] of Object.entries(sources)) {
        let present = 0;
        for (const [assetPathname, page] of referenced) {
            if (resolveAsset(assetPathname)) present += 1;
            else missing.push({ kind, assetPathname, page });
        }
        console.log(`${kind.padEnd(22)} ${present} / ${referenced.size}`);
    }

    const total = Object.values(sources).reduce((count, referenced) => count + referenced.size, 0);
    console.log(`\n${files.length} pages, ${total} distinct files referenced, missing ${missing.length}`);

    missing.slice(0, 15).forEach(({ kind, assetPathname, page }) =>
        console.log(`   missing: ${assetPathname}\n            named by ${kind} on ${page}`)
    );
    if (missing.length > 15) console.log(`   ... and ${missing.length - 15} more`);

    process.exitCode = missing.length ? 1 : 0;
}
