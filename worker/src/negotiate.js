/*
 * Content negotiation between the HTML page and its markdown twin.
 *
 * Kept as pure functions with no Workers runtime in sight, because the decision
 * of whether a request wants markdown is the only part with edge cases worth
 * testing, and worker/test/negotiate.test.mjs runs them under plain Node.
 */

const MARKDOWN_TYPES = ['text/markdown', 'text/x-markdown'];
const HTML_TYPE = 'text/html';

/**
 * The quality value an Accept header assigns to one media type.
 *
 * Specificity decides, not order: RFC 9110 has "text/markdown" outrank "text/*",
 * which outranks "*​/*". That is what keeps a browser on HTML. Chrome sends
 * "text/html,...,*​/*;q=0.8", so markdown scores the 0.8 from the wildcard while
 * HTML scores 1.0 from its exact match.
 *
 * @returns {number} 0 when the header does not accept the type at all
 */
export function acceptQuality(accept, mediaType) {
    if (!accept) return 0;

    const [type, subtype] = mediaType.toLowerCase().split('/');
    let bestSpecificity = -1;
    let bestQuality = 0;

    for (const entry of accept.split(',')) {
        const [rangeText, ...parameters] = entry.split(';');
        const range = rangeText.trim().toLowerCase();
        if (!range) continue;

        const [rangeType, rangeSubtype] = range.split('/');
        let specificity;
        if (rangeType === type && rangeSubtype === subtype) specificity = 3;
        else if (rangeType === type && rangeSubtype === '*') specificity = 2;
        else if (rangeType === '*' && rangeSubtype === '*') specificity = 1;
        else continue;

        // A malformed or absent q is treated as 1, which is what the grammar says
        // an unqualified media range means.
        const qualityParameter = parameters.map((parameter) => parameter.trim().toLowerCase()).find((parameter) => parameter.startsWith('q='));
        let quality = qualityParameter ? Number.parseFloat(qualityParameter.slice(2)) : 1;
        if (!Number.isFinite(quality)) quality = 1;
        quality = Math.min(Math.max(quality, 0), 1);

        if (specificity > bestSpecificity || (specificity === bestSpecificity && quality > bestQuality)) {
            bestSpecificity = specificity;
            bestQuality = quality;
        }
    }

    return bestQuality;
}

/**
 * Whether a request asked for markdown in preference to HTML.
 *
 * Strictly greater, so a tie goes to HTML. That is the case that matters most:
 * "Accept: *​/*" from curl, or a missing header, has to keep behaving exactly as
 * it did before this Worker existed.
 */
export function prefersMarkdown(accept) {
    const markdown = Math.max(...MARKDOWN_TYPES.map((type) => acceptQuality(accept, type)));
    return markdown > 0 && markdown > acceptQuality(accept, HTML_TYPE);
}

/**
 * The markdown twin of a page path, or null when the path is not a page.
 *
 * Every page URL on the site ends in a slash, so requiring one is enough to
 * exclude assets, feeds, sitemaps and the .md files themselves. It also makes
 * the Worker safe against re-entry: if the runtime ever did route the Worker's
 * own subrequest back through it, "/products/subc/index.md" fails this test and
 * passes straight through instead of asking for a twin of a twin.
 */
export function markdownPathFor(pathname) {
    return pathname.endsWith('/') ? `${pathname}index.md` : null;
}

/** The host every page and file on this site is canonically served from. */
export const CANONICAL_HOST = 'www.dehlimusikk.no';

/**
 * Whether this request is for robots.txt on a host other than the canonical one.
 *
 * The apex is a Firebase Hosting custom domain set to redirect to www, and
 * Firebase answers that redirect with `Content-Type: text/plain` over a 52-byte
 * body reading "Redirecting to https://www.dehlimusikk.no/robots.txt". To a
 * client that reads the body instead of following the hop, that is a perfectly
 * well formed robots.txt which happens to contain no rules and no Content-Signal
 * directives.
 *
 * robots.txt is a per-origin resource, so the apex ought to answer with the real
 * file rather than point at another host's. RFC 9309 does tell crawlers to
 * follow at least five redirects for it, but not every client obeys, and the
 * ones that do not fail silently.
 */
export function isNonCanonicalRobots(url) {
    return url.hostname !== CANONICAL_HOST && url.pathname === '/robots.txt';
}

/* The two homepages: Norwegian at the root, English under /en/. */
const HOMEPAGE_PATHS = new Set(['/', '/en/']);

/**
 * The value of the Link header for a homepage, or null for any other path.
 *
 * RFC 8288 relations pointing at the machine-readable descriptions this site
 * actually publishes, so a client can find them from response headers without
 * parsing HTML first. A HEAD request is enough.
 *
 * Deliberately not emitted on every page. Only the homepages are guaranteed to
 * have all of these, and a Link header naming a file that 404s is worse than no
 * header at all - which is the same reason the markdown alternate is advertised
 * per page through <link rel="alternate"> in the HTML, where the build knows
 * which pages really have a twin.
 *
 * No api-catalog, service-desc or service-doc relations: this site has no API,
 * and pointing at descriptions of one that does not exist would send an agent
 * looking for something it will never find.
 */
export function homepageLinkHeader(pathname) {
    if (!HOMEPAGE_PATHS.has(pathname)) return null;
    return [
        '</llms.txt>; rel="describedby"; type="text/plain"',
        '</llms-full.txt>; rel="describedby"; type="text/plain"',
        `<${pathname}index.md>; rel="alternate"; type="text/markdown"`,
        '</sitemap.xml>; rel="sitemap"'
    ].join(', ');
}
