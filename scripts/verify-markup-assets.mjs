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

/*
 * Compared as a parsed hostname rather than as a string prefix. Prefix matching
 * on "https://www.dehlimusikk.no" also accepts www.dehlimusikk.no.example.com,
 * which is the same mistake whether it lets a bad host through somewhere that
 * matters or, as here, only produces a confusing missing-file report.
 */
const SITE_ORIGIN = 'https://www.dehlimusikk.no';
const SITE_HOSTNAME = 'www.dehlimusikk.no';

const directory = process.argv[2] || 'out';
// resolve, not join: an absolute directory argument has to replace the root
// rather than be appended to it
const EXPORT_DIR = path.resolve(ROOT, directory);

const ASSET_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'webp', 'avif', 'svg', 'ico', 'gif',
    'woff', 'woff2', 'ttf', 'otf',
    'json'
]);

// public/ is checked as well as the export: the same script then works against a
// build that keeps its HTML apart from the static files it serves.
const ASSET_ROOTS = [EXPORT_DIR, path.resolve(ROOT, 'public')];

if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`No ${directory}/ directory. Build first, then run this:\n\n   yarn build && node scripts/verify-markup-assets.mjs\n`);
    process.exitCode = 1;
} else {
    run();
}

// Returns paths relative to EXPORT_DIR, which is what gets reported
function htmlFiles(prefix = '') {
    const found = [];
    for (const entry of fs.readdirSync(path.join(EXPORT_DIR, prefix), { withFileTypes: true })) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
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

    /*
     * Resolving against the site's own origin covers both forms in one step: a
     * root-relative href keeps that origin, an absolute URL brings its own, and
     * the hostname check below then rejects anything that is not ours. It also
     * normalises away ".." segments and drops the query and fragment, so what
     * comes out is always a plain path under the site root.
     */
    let url;
    try {
        url = new URL(value.trim(), SITE_ORIGIN);
    } catch {
        return null;
    }

    // Not ours: another host, or a mailto:/data: value with no host at all
    if (url.hostname !== SITE_HOSTNAME) return null;

    const extension = path.extname(url.pathname).slice(1).toLowerCase();
    if (!ASSET_EXTENSIONS.has(extension)) return null;

    try {
        return decodeURIComponent(url.pathname);
    } catch {
        // A malformed escape is a broken reference in its own right
        return url.pathname;
    }
}

function resolveAsset(assetPathname) {
    for (const root of ASSET_ROOTS) {
        const file = path.join(root, assetPathname);
        if (fs.existsSync(file) && fs.statSync(file).isFile()) return root;
    }
    return null;
}

function run() {
    const files = htmlFiles();

    // Where a URL came from, so a failure says which markup to go and fix
    const sources = { 'structured data': new Map(), 'head metadata': new Map() };

    const record = (kind, assetPathname, page) => {
        if (!sources[kind].has(assetPathname)) sources[kind].set(assetPathname, page);
    };

    for (const page of files) {
        const html = fs.readFileSync(path.join(EXPORT_DIR, page), 'utf8');

        // JSON-LD, wherever in the document it sits. The blocks escape "<" as
        // <, so read the URLs out of the decoded text.
        for (const [, block] of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
            const decoded = block.replaceAll('\\u003c', '<');
            // Every absolute URL in the block, ours or not. assetPath is the one
            // place that decides which host counts, so the rule is not spelled
            // out twice.
            for (const [, url] of decoded.matchAll(/"(https?:\/\/[^"\s]+)"/g)) {
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
