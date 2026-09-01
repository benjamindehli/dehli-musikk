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
