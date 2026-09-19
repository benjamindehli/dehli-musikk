/*
 * Checks that every internal page an exported document links to was actually
 * built. Run against an export, from the repo root:
 *
 *   node scripts/verify-internal-links.mjs [directory]     (default: out)
 *
 * A link to a page that does not exist is invisible from inside the app. The
 * route compiles, the page it sits on renders, nothing throws, and the only
 * symptom is a visitor or a crawler getting a 404 from a link the site itself
 * put in front of them. That is how the language switcher came to offer
 * /en/posts/stemmetid/ on every Norwegian post: it built the other language's
 * URL by prefixing /en to the current path, which is right for the sections
 * whose slug is language independent and wrong for posts and videos, whose slug
 * comes from the translated title. 576 dead URLs, linked from every post and
 * video page, still turning up in Search Console long after the fix.
 *
 * Deliberately narrow, so a failure always means something:
 *
 * - Only our own host. External links are not this script's business, and
 *   checking them would make it a network call rather than a file check.
 * - Only pages and generated documents: a URL with no extension, or one ending
 *   in rss, xml, txt or md. Images, fonts and json belong to
 *   verify-markup-assets, which resolves them against public/ as well.
 * - Sitemaps and feeds are read too, not just the HTML. They are where a dead
 *   URL does the most damage, because a crawler reads them first and trusts
 *   them more than a link in a page.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

// Parsed as a hostname rather than matched as a prefix, for the reason
// verify-markup-assets gives: a prefix also accepts dehlimusikk.no.example.com.
const SITE_ORIGIN = "https://www.dehlimusikk.no";
const SITE_HOSTNAME = "www.dehlimusikk.no";

const directory = process.argv[2] || "out";
const EXPORT_DIR = path.resolve(ROOT, directory);

// Documents that carry links. html for the pages, rss and xml for the feeds and
// the four sitemaps.
const DOCUMENT_EXTENSIONS = new Set([".html", ".rss", ".xml"]);

/*
 * What counts as a page rather than an asset. The empty string is a URL like
 * /en/posts/tuning-time/, which is the common case; the rest are the route
 * handlers, which verify-markup-assets skips on purpose because how they land
 * on disk is up to the exporter.
 */
const PAGE_EXTENSIONS = new Set(["", ".rss", ".xml", ".txt", ".md"]);

/*
 * A path that starts with what looks like a scheme is broken whatever it ends
 * in, and it is worth naming separately because it can only come from one
 * mistake: a language slug, or any other prefix, pasted onto a target that was
 * never a site path. /mailto:superelg@gmail.com is the real example, and it
 * would otherwise slip past the extension filter above, ".com" being neither a
 * page nor anything else this checks.
 *
 * Matched in any segment rather than only the first, because the prefix that
 * causes it is a language slug: the same link is /mailto:... on the Norwegian
 * page and /en/mailto:... on the English one, and anchoring to the start finds
 * one and not the other. No real slug contains a colon - they all come out of
 * convertToUrlFriendlyString.
 */
const MISPREFIXED = /\/[a-z][a-z0-9+.-]*:/i;

if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`No ${directory}/ directory. Build first, then run this:\n\n   yarn build && node scripts/verify-internal-links.mjs\n`);
    process.exitCode = 1;
} else {
    run();
}

// Returns paths relative to EXPORT_DIR, which is what gets reported
function documents(prefix = "") {
    const found = [];
    for (const entry of fs.readdirSync(path.join(EXPORT_DIR, prefix), { withFileTypes: true })) {
        const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) found.push(...documents(relative));
        else if (DOCUMENT_EXTENSIONS.has(path.extname(entry.name))) found.push(relative);
    }
    return found;
}

/*
 * The path a URL points at, or null when it is not an internal page. Resolving
 * against the site's own origin handles the root-relative and the absolute form
 * in one step, and drops the query and the fragment on the way.
 */
function pagePath(value) {
    if (!value) return null;

    let url;
    try {
        url = new URL(value.trim(), SITE_ORIGIN);
    } catch {
        return null;
    }

    // Not ours: another host, or a mailto:/tel:/data: value with no host at all
    if (url.hostname !== SITE_HOSTNAME) return null;
    if (!MISPREFIXED.test(url.pathname) && !PAGE_EXTENSIONS.has(path.extname(url.pathname).toLowerCase())) return null;

    try {
        return decodeURIComponent(url.pathname);
    } catch {
        // A malformed escape is a broken reference in its own right
        return url.pathname;
    }
}

/*
 * The export is built with trailingSlash and cleanUrls, so a page can be on disk
 * under more than one name. All three forms are accepted: what matters is
 * whether the host can answer the URL, not which shape the exporter chose.
 */
function resolvePage(pathname) {
    const candidates = pathname.endsWith("/")
        ? [path.join(EXPORT_DIR, pathname, "index.html")]
        : [path.join(EXPORT_DIR, pathname), path.join(EXPORT_DIR, `${pathname}.html`), path.join(EXPORT_DIR, pathname, "index.html")];
    return candidates.some((file) => fs.existsSync(file) && fs.statSync(file).isFile());
}

function run() {
    const files = documents();

    // Where a URL came from, so a failure says which markup to go and fix
    const sources = { "page links": new Map(), "head alternates": new Map(), "feeds and sitemaps": new Map() };

    const record = (kind, pathname, document) => {
        if (!sources[kind].has(pathname)) sources[kind].set(pathname, document);
    };

    for (const document of files) {
        const body = fs.readFileSync(path.join(EXPORT_DIR, document), "utf8");

        if (document.endsWith(".html")) {
            // Anchors anywhere in the document: the navigation, the breadcrumbs,
            // the language switcher, the footer, and the prose.
            for (const [, href] of body.matchAll(/<a\b[^>]*?\shref="([^"]*)"/g)) {
                const found = pagePath(href);
                if (found) record("page links", found, document);
            }

            /*
             * canonical and alternate in the head. These name pages rather than
             * files, so verify-markup-assets passes over them, and they are worth
             * checking for exactly the reason hreflang exists: the whole point is
             * to send a crawler somewhere else.
             */
            const head = body.match(/<head[^>]*>(.*?)<\/head>/s);
            for (const [tag] of head?.[1].matchAll(/<link\b[^>]*>/g) ?? []) {
                const rel = tag.match(/\srel="([^"]*)"/)?.[1];
                if (rel !== "canonical" && rel !== "alternate") continue;
                const found = pagePath(tag.match(/\shref="([^"]*)"/)?.[1]);
                if (found) record("head alternates", found, document);
            }
        } else {
            // A feed or a sitemap: every absolute URL on our own host, wherever
            // in the XML it sits - loc, link, guid, or an atom self link.
            for (const [url] of body.matchAll(/https:\/\/[^\s"'<>]+/g)) {
                const found = pagePath(url.replaceAll("&amp;", "&"));
                if (found) record("feeds and sitemaps", found, document);
            }
        }
    }

    const missing = [];
    for (const [kind, referenced] of Object.entries(sources)) {
        let present = 0;
        for (const [pathname, document] of referenced) {
            if (resolvePage(pathname)) present += 1;
            else missing.push({ kind, pathname, document });
        }
        console.log(`${kind.padEnd(22)} ${present} / ${referenced.size}`);
    }

    const total = Object.values(sources).reduce((count, referenced) => count + referenced.size, 0);
    console.log(`\n${files.length} documents, ${total} distinct internal pages linked, missing ${missing.length}`);

    missing
        .slice(0, 15)
        .forEach(({ kind, pathname, document }) => console.log(`   missing: ${pathname}\n            linked as ${kind} from ${document}`));
    if (missing.length > 15) console.log(`   ... and ${missing.length - 15} more`);

    process.exitCode = missing.length ? 1 : 0;
}
