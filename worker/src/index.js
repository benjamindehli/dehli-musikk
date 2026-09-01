/*
 * Serves the markdown twin of a page to clients that ask for one.
 *
 * Firebase Hosting, which is the origin, can only match on URL path: its
 * headers, redirects and rewrites have no condition that reads a request header,
 * so it cannot vary a response on Accept. This Worker sits in front and does
 * that one job. Everything else is passed through untouched, so ordinary traffic
 * keeps being served from cache exactly as before.
 *
 * The twins are static files published by the build, at index.md beside each
 * page (see src/helpers/markdownHelpers.js). This Worker never generates
 * markdown; it only chooses which of two already-published files to return.
 */
import { CANONICAL_HOST, isNonCanonicalRobots, markdownPathFor, prefersMarkdown } from './negotiate.js';

/*
 * Set on both branches. Without it a shared cache that stored the markdown could
 * hand it to a browser asking the same URL for HTML.
 *
 * Cloudflare's own cache is not the risk here: the Worker fetches the twin under
 * its own distinct URL, so each variant is cached under its own key, and Worker
 * responses are not edge-cached by default. Vary is for everything downstream.
 */
const withVary = (response) => {
    const varied = new Response(response.body, response);
    varied.headers.set('Vary', 'Accept');
    return varied;
};

// Exported for worker/test/handler.test.mjs, which drives it with a stubbed
// fetch. The Worker entry point below is the only caller in production.
export async function handle(request) {
    // A negotiated response to anything that changes state would be a surprise;
    // this only ever swaps one representation of a page for another.
    if (request.method !== 'GET' && request.method !== 'HEAD') return fetch(request);

    const url = new URL(request.url);

    /*
     * Answer robots.txt on the apex with the real file instead of Firebase's
     * redirect to www. See isNonCanonicalRobots for why the redirect is not good
     * enough. Everything else on the apex keeps redirecting as before.
     */
    if (isNonCanonicalRobots(url)) {
        const canonical = new URL(url);
        canonical.hostname = CANONICAL_HOST;
        const robots = await fetch(canonical, { method: request.method });
        if (robots.ok) {
            const response = new Response(robots.body, robots);
            response.headers.set('Content-Type', 'text/plain; charset=utf-8');
            return response;
        }
        // Origin trouble: fall through to the redirect rather than invent a
        // robots.txt, because a wrong one is worse than one more hop.
        return fetch(request);
    }

    if (!prefersMarkdown(request.headers.get('Accept'))) return withVary(await fetch(request));

    const markdownPath = markdownPathFor(url.pathname);
    if (!markdownPath) return withVary(await fetch(request));

    const markdownUrl = new URL(url);
    markdownUrl.pathname = markdownPath;

    /*
     * A fresh request rather than a rewrite of the incoming one. The origin is
     * serving a static file, so none of the client's headers are of use to it,
     * and the Accept that got us here would only add noise to the cache key.
     * Method is mirrored so a HEAD stays a HEAD.
     */
    const markdown = await fetch(markdownUrl, { method: request.method });

    /*
     * Not every page has a twin. The search page is a client-rendered shell and
     * the error pages are not content, so both are published as HTML only. Rather
     * than keep a list of them here, which would be a second place to update,
     * fall back to whatever the page itself returns.
     */
    if (!markdown.ok) return withVary(await fetch(request));

    const response = new Response(markdown.body, markdown);
    response.headers.set('Content-Type', 'text/markdown; charset=utf-8');
    response.headers.set('Vary', 'Accept');
    // Names the resource actually returned, so a client can tell it did not get
    // the URL it asked for and can link to the twin directly next time.
    response.headers.set('Content-Location', markdownUrl.pathname);
    return response;
}

export default {
    async fetch(request) {
        /*
         * A failure in here must not take the site down. If anything throws, fall
         * back to the origin: the visitor gets the page, and the only thing lost
         * is the markdown variant.
         */
        try {
            return await handle(request);
        } catch {
            return fetch(request);
        }
    }
};
