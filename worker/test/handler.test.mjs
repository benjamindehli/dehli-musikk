/*
 * Drives the Worker's request handler against a stubbed origin. Node's fetch,
 * Request and Response are close enough to the Workers runtime for this: the
 * handler only uses URL parsing, headers and body passthrough.
 *
 * What this cannot cover is the deployment itself, which needs the route to be
 * live on Cloudflare. See worker/README.md for the checks to run after deploying.
 */
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

import { handle } from '../src/index.js';

const PAGE_HTML = '<!DOCTYPE html><html><head><title>SubC</title></head><body>page</body></html>';
const PAGE_MARKDOWN = '---\ntitle: "SubC"\n---\n\n# SubC\n';

const realFetch = globalThis.fetch;
afterEach(() => {
    globalThis.fetch = realFetch;
});

/**
 * @param {object} origin - pathname -> {status, body, headers}
 */
function stubOrigin(origin) {
    const calls = [];
    globalThis.fetch = async (input, init = {}) => {
        const url = new URL(typeof input === 'string' || input instanceof URL ? input : input.url);
        const method = init.method ?? (input instanceof Request ? input.method : 'GET');
        calls.push({ pathname: url.pathname, method });

        const file = origin[url.pathname];
        if (!file) return new Response('Not found', { status: 404 });
        return new Response(file.body, {
            status: file.status ?? 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'max-age=3600', ...file.headers }
        });
    };
    return calls;
}

const get = (pathname, accept, method = 'GET') =>
    new Request(`https://www.dehlimusikk.no${pathname}`, { method, headers: accept ? { Accept: accept } : {} });

test('a browser request is passed through to the page', async () => {
    const calls = stubOrigin({ '/en/products/subc/': { body: PAGE_HTML } });

    const response = await handle(get('/en/products/subc/', 'text/html,*/*;q=0.8'));

    assert.equal(response.status, 200);
    assert.equal(await response.text(), PAGE_HTML);
    assert.match(response.headers.get('Content-Type'), /text\/html/);
    assert.equal(response.headers.get('Vary'), 'Accept', 'shared caches must key on Accept');
    assert.deepEqual(
        calls.map((call) => call.pathname),
        ['/en/products/subc/'],
        'no wasted subrequest for a twin nobody asked for'
    );
});

test('a markdown request gets the twin', async () => {
    const calls = stubOrigin({
        '/en/products/subc/': { body: PAGE_HTML },
        '/en/products/subc/index.md': { body: PAGE_MARKDOWN, headers: { 'Content-Type': 'text/markdown; charset=utf-8' } }
    });

    const response = await handle(get('/en/products/subc/', 'text/markdown'));

    assert.equal(response.status, 200);
    assert.equal(await response.text(), PAGE_MARKDOWN);
    assert.equal(response.headers.get('Content-Type'), 'text/markdown; charset=utf-8');
    assert.equal(response.headers.get('Vary'), 'Accept');
    assert.equal(response.headers.get('Content-Location'), '/en/products/subc/index.md');
    assert.equal(response.headers.get('Cache-Control'), 'max-age=3600', "the origin's caching is preserved");
    assert.deepEqual(calls.map((call) => call.pathname), ['/en/products/subc/index.md']);
});

test('a page with no twin falls back to HTML', async () => {
    // The search page is published as HTML only; asking for its markdown must not 404
    const calls = stubOrigin({ '/search/': { body: PAGE_HTML } });

    const response = await handle(get('/search/', 'text/markdown'));

    assert.equal(response.status, 200);
    assert.equal(await response.text(), PAGE_HTML);
    assert.match(response.headers.get('Content-Type'), /text\/html/);
    assert.deepEqual(calls.map((call) => call.pathname), ['/search/index.md', '/search/']);
});

test('non-page URLs are never rewritten', async () => {
    const calls = stubOrigin({ '/llms.txt': { body: 'llms', headers: { 'Content-Type': 'text/plain' } } });

    const response = await handle(get('/llms.txt', 'text/markdown'));

    assert.equal(await response.text(), 'llms');
    assert.deepEqual(calls.map((call) => call.pathname), ['/llms.txt'], 'no /llms.txt/index.md lookup');
});

test('a twin is not asked for a twin of its own', async () => {
    const calls = stubOrigin({ '/en/products/subc/index.md': { body: PAGE_MARKDOWN } });

    await handle(get('/en/products/subc/index.md', 'text/markdown'));

    assert.deepEqual(calls.map((call) => call.pathname), ['/en/products/subc/index.md'], 'no recursion');
});

test('HEAD stays HEAD', async () => {
    const calls = stubOrigin({
        '/en/products/subc/': { body: PAGE_HTML },
        '/en/products/subc/index.md': { body: PAGE_MARKDOWN }
    });

    const response = await handle(get('/en/products/subc/', 'text/markdown', 'HEAD'));

    assert.equal(response.status, 200);
    assert.deepEqual(calls, [{ pathname: '/en/products/subc/index.md', method: 'HEAD' }]);
});

test('non-GET methods are passed straight through', async () => {
    const calls = stubOrigin({ '/en/products/subc/': { body: PAGE_HTML } });

    await handle(get('/en/products/subc/', 'text/markdown', 'POST'));

    assert.deepEqual(calls.map((call) => call.method), ['POST']);
});

test('the root page has a twin', async () => {
    stubOrigin({ '/index.md': { body: PAGE_MARKDOWN } });

    const response = await handle(get('/', 'text/markdown'));

    assert.equal(response.headers.get('Content-Location'), '/index.md');
});
