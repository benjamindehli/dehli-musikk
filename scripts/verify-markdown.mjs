/*
 * Checks that every exported page has a markdown twin. Run against an export,
 * from the repo root:
 *
 *   node scripts/verify-markdown.mjs [directory]     (default: out)
 *
 * The markdown documents are produced by route handlers under segments literally
 * named "index.md", and the exporter's naming for a route handler is not
 * something this repo controls: it copies the handler body to outDir + route,
 * which puts /products/subc/index.md on disk beside the page's index.html. If a
 * Next upgrade ever changes that, nothing about the site looks broken. The pages
 * still render, the build still passes, and the only symptom is that every
 * agent-facing URL quietly 404s.
 *
 * It also catches the subtler failure: the markdown routes derive their slugs
 * from the same titles the pages do, but through their own code. If those two
 * derivations drift, some page ends up without a twin, or with one at an address
 * nothing links to.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SITE_ORIGIN = 'https://www.dehlimusikk.no';

const directory = process.argv[2] || 'out';
const EXPORT_DIR = path.resolve(ROOT, directory);

/*
 * Pages that are deliberately HTML-only.
 *
 * The search page is an empty shell that a client-side script fills in, so its
 * markdown would be a heading and nothing else, and it carries robots noindex
 * for the same reason. The error pages are not content. Directory paths relative
 * to the export root, matched exactly.
 */
const HTML_ONLY = new Set(['404', '_not-found', 'search', 'en/search']);

if (!fs.existsSync(EXPORT_DIR)) {
    console.log(`No ${directory}/ directory. Build first, then run this:\n\n   yarn build && node scripts/verify-markdown.mjs\n`);
    process.exitCode = 1;
} else {
    run();
}

// Every directory holding an index.html, relative to the export root. "" is the
// site root itself.
function pageDirectories(prefix = '') {
    const found = [];
    const absolute = path.join(EXPORT_DIR, prefix);
    const entries = fs.readdirSync(absolute, { withFileTypes: true });

    if (entries.some((entry) => entry.isFile() && entry.name === 'index.html')) found.push(prefix);

    for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        // _next holds build assets, not pages
        if (entry.name === '_next') continue;
        found.push(...pageDirectories(prefix ? `${prefix}/${entry.name}` : entry.name));
    }
    return found;
}

// A declaration, not a const: run() is called above, before this point in the file
function pageUrl(pageDirectory) {
    return `${SITE_ORIGIN}/${pageDirectory ? `${pageDirectory}/` : ''}`;
}

/*
 * The href the page itself advertises. Read out of the rendered markup rather
 * than reconstructed, because a link pointing somewhere the export did not write
 * is exactly the failure worth catching.
 */
function declaredMarkdownHref(html) {
    const head = html.match(/<head[^>]*>(.*?)<\/head>/s);
    if (!head) return null;
    for (const [, tag] of head[1].matchAll(/(<link\b[^>]*>)/g)) {
        if (!/rel="alternate"/.test(tag) || !/type="text\/markdown"/.test(tag)) continue;
        const href = tag.match(/href="([^"]*)"/);
        if (href) return href[1];
    }
    return null;
}

function run() {
    const directories = pageDirectories().filter((pageDirectory) => !HTML_ONLY.has(pageDirectory));

    const problems = [];
    let withMarkdown = 0;
    let withDeclaration = 0;

    for (const pageDirectory of directories) {
        const markdownFile = path.join(EXPORT_DIR, pageDirectory, 'index.md');
        const html = fs.readFileSync(path.join(EXPORT_DIR, pageDirectory, 'index.html'), 'utf8');
        const page = pageDirectory || '/';

        if (!fs.existsSync(markdownFile)) {
            problems.push({ page, detail: 'no index.md beside index.html' });
            continue;
        }
        withMarkdown += 1;

        const markdown = fs.readFileSync(markdownFile, 'utf8');
        if (!markdown.startsWith('---\n')) {
            problems.push({ page, detail: 'index.md does not open with a front matter block' });
            continue;
        }

        /*
         * The url in the front matter is built from the page's own path, so
         * comparing it against where the file actually landed catches a
         * generator being wired to the wrong route.
         */
        const declaredUrl = markdown.match(/^url: "([^"]*)"$/m);
        const expectedUrl = pageUrl(pageDirectory);
        if (!declaredUrl) {
            problems.push({ page, detail: 'index.md front matter has no url' });
        } else if (declaredUrl[1] !== expectedUrl) {
            problems.push({ page, detail: `index.md says url ${declaredUrl[1]}, but sits at ${expectedUrl}` });
        }

        /*
         * The canonical URL of a video's modal page is its theater page, so the
         * two legitimately advertise the same markdown. Only require that
         * whatever the page points at exists.
         */
        const href = declaredMarkdownHref(html);
        if (!href) {
            problems.push({ page, detail: 'page declares no <link rel="alternate" type="text/markdown">' });
        } else {
            const target = path.join(EXPORT_DIR, new URL(href, SITE_ORIGIN).pathname);
            if (fs.existsSync(target)) withDeclaration += 1;
            else problems.push({ page, detail: `declares markdown at ${href}, which was not exported` });
        }
    }

    console.log(`pages${''.padEnd(17)} ${directories.length}`);
    console.log(`with index.md${''.padEnd(9)} ${withMarkdown} / ${directories.length}`);
    console.log(`link resolves${''.padEnd(9)} ${withDeclaration} / ${directories.length}`);
    console.log(`\n${problems.length} problem${problems.length === 1 ? '' : 's'}`);

    problems.slice(0, 15).forEach(({ page, detail }) => console.log(`   ${page}\n      ${detail}`));
    if (problems.length > 15) console.log(`   ... and ${problems.length - 15} more`);

    process.exitCode = problems.length ? 1 : 0;
}
