/*
 * Drives the MCP server against a stubbed origin. Covers the JSON-RPC surface,
 * the three tools, and the corpus parser that everything in search rests on.
 */
import assert from 'node:assert/strict';
import test, { afterEach } from 'node:test';

import { handleMcpRequest, handleRpcMessage, parseCorpus, searchCorpus, serverCard, TOOLS } from '../src/mcp.js';

const CORPUS = `# Dehli Musikk

> Intro line.

## Products (2)

### Overtonium

URL: https://www.dehlimusikk.no/en/products/overtonium/
Price: free
Type: Software

Overtonium is an additive synthesiser laid out like a 32-channel mixer.

### Midnight Wurli

URL: https://www.dehlimusikk.no/en/products/midnight-wurli/
Price: from 5.00 USD

A sampled Wurlitzer 200A electric piano.

## Posts (1)

### Tape looping

URL: https://www.dehlimusikk.no/en/posts/tape-looping/
Published: 2026-04-03

Recording a Wurlitzer to a cassette loop.

## Equipment (1)

### Yamaha YC-25D

URL: https://www.dehlimusikk.no/en/equipment/instruments/yamaha-yc-25d/
Type: Instruments

Yamaha YC-25D is part of the equipment Dehli Musikk uses during recording. Heard in 1 video.
Heard in: Tape looping with a Yamaha YC-25D.

## Frequently asked questions (1)

### Is Dehli Musikk a music store?

No. Dehli Musikk is not a physical music store.
`;

const realFetch = globalThis.fetch;
afterEach(() => {
    globalThis.fetch = realFetch;
});

const stub = (routes) => {
    const calls = [];
    globalThis.fetch = async (input) => {
        const url = String(input);
        calls.push(url);
        const body = routes[url];
        return body === undefined ? new Response('nope', { status: 404 }) : new Response(body, { status: 200 });
    };
    return calls;
};

const post = (body) =>
    new Request('https://www.dehlimusikk.no/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

test('the corpus parser finds every entry and its URL', () => {
    const entries = parseCorpus(CORPUS);

    assert.equal(entries.length, 5);
    assert.deepEqual(
        entries.map((e) => e.category),
        ['product', 'product', 'post', 'equipment', 'faq']
    );
    // Every section heading must map to a category; an unmapped one would leave
    // entries labelled null in search output
    assert.equal(entries.filter((e) => e.category === null).length, 0);
    assert.equal(entries[0].title, 'Overtonium');
    assert.equal(entries[0].url, 'https://www.dehlimusikk.no/en/products/overtonium/');
    assert.match(entries[0].text, /additive synthesiser/);
    // Metadata lines stay searchable
    assert.match(entries[0].text, /Price: free/);
    // FAQ entries carry no URL of their own and fall back to the page
    const faq = entries.find((e) => e.category === 'faq');
    assert.equal(faq.url, 'https://www.dehlimusikk.no/en/frequently-asked-questions/');
    // Everything else carries its own
    assert.equal(entries.filter((e) => !e.url).length, 0);
});

test('search ranks title matches above body matches', () => {
    const entries = parseCorpus(CORPUS);

    /*
     * "wurli" is in one entry's title and inside "Wurlitzer" in two bodies, so
     * the title holder has to come first. Searching "wurlitzer" instead would
     * hit only bodies and prove nothing about the weighting.
     */
    const results = searchCorpus(entries, 'wurli');

    assert.equal(results.length, 2);
    assert.equal(results[0].title, 'Midnight Wurli');
    assert.ok(results[0].score > results[1].score, 'a title hit must outscore a body-only hit');
    assert.ok(results[0].score >= 5, 'and by at least the title weight');
});

test('search can be restricted by category and limited', () => {
    const entries = parseCorpus(CORPUS);

    assert.deepEqual(
        searchCorpus(entries, 'wurlitzer', 'post').map((r) => r.title),
        ['Tape looping']
    );
    assert.equal(searchCorpus(entries, 'wurlitzer', 'all', 1).length, 1);
    assert.equal(searchCorpus(entries, 'x', 'all').length, 0, 'single characters are not searched');
});

test('body matches have diminishing returns', () => {
    /*
     * Equipment entries name every video an item appears in, so a much-used
     * accessory carries far more text than the instrument a query is about, and
     * scored linearly it wins on length alone. This asserts the damping itself
     * rather than a ranking outcome: the scorer makes no promise that a title
     * match always beats a long body, and forcing it to - by raising the title
     * weight - simply moved the same artifact into the title, where a long video
     * title with a repeated word started outranking the item named after it.
     */
    const entry = (text) => ({ title: 'Untitled', category: 'post', url: 'https://www.dehlimusikk.no/en/posts/x/', text });

    const [one] = searchCorpus([entry('clavinet')], 'clavinet');
    const [many] = searchCorpus([entry(Array(25).fill('clavinet').join(' '))], 'clavinet');

    assert.ok(many.score > one.score, '25 mentions still outrank 1');
    assert.ok(many.score < one.score * 6, `but by 5x at most, not 25x - got ${(many.score / one.score).toFixed(1)}x`);
});

test('equipment is searchable by the recordings and videos it appears on', () => {
    const entries = parseCorpus(CORPUS);

    // The entry names no instrument type, only a brand and model, so this only
    // works because the videos it is heard in are named in the body
    const byUsage = searchCorpus(entries, 'tape looping', 'equipment');
    assert.deepEqual(
        byUsage.map((r) => r.title),
        ['Yamaha YC-25D']
    );

    const byName = searchCorpus(entries, 'yc-25d', 'equipment');
    assert.equal(byName[0].url, 'https://www.dehlimusikk.no/en/equipment/instruments/yamaha-yc-25d/');
});

test('initialize reports the protocol version and tools capability', async () => {
    const response = await handleRpcMessage({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} });

    assert.equal(response.result.protocolVersion, '2025-06-18');
    assert.equal(response.result.serverInfo.name, 'dehli-musikk');
    assert.ok(response.result.capabilities.tools);
});

test('tools/list returns the three tools with schemas and no internals', async () => {
    const response = await handleRpcMessage({ jsonrpc: '2.0', id: 2, method: 'tools/list' });

    assert.deepEqual(
        response.result.tools.map((t) => t.name),
        ['search', 'read_page', 'list_sections']
    );
    for (const tool of response.result.tools) {
        assert.equal(tool.inputSchema.type, 'object');
        assert.ok(tool.description.length > 40);
        assert.equal(tool.execute, undefined, 'the execute function must not be serialised to the client');
    }
});

test('notifications get no reply', async () => {
    assert.equal(await handleRpcMessage({ jsonrpc: '2.0', method: 'notifications/initialized' }), null);

    const response = await handleMcpRequest(post({ jsonrpc: '2.0', method: 'notifications/initialized' }));
    assert.equal(response.status, 202);
    assert.equal(await response.text(), '');
});

test('unknown methods and tools are rejected distinctly', async () => {
    const method = await handleRpcMessage({ jsonrpc: '2.0', id: 3, method: 'resources/list' });
    assert.equal(method.error.code, -32601);

    const tool = await handleRpcMessage({ jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'drop_everything' } });
    assert.equal(tool.error.code, -32602);
});

test('tools/call search returns results from the corpus', async () => {
    stub({ 'https://www.dehlimusikk.no/llms-full.txt': CORPUS });

    const response = await handleRpcMessage({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: { name: 'search', arguments: { query: 'wurlitzer' } }
    });

    const text = response.result.content[0].text;
    assert.match(text, /Midnight Wurli/);
    assert.match(text, /https:\/\/www\.dehlimusikk\.no\/en\/products\/midnight-wurli\//);
    assert.notEqual(response.result.isError, true);
});

test('tools/call read_page fetches the markdown twin', async () => {
    const calls = stub({ 'https://www.dehlimusikk.no/en/products/subc/index.md': '# SubC\n' });

    const response = await handleRpcMessage({
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: { name: 'read_page', arguments: { page: '/en/products/subc' } }
    });

    assert.match(response.result.content[0].text, /# SubC/);
    assert.deepEqual(calls, ['https://www.dehlimusikk.no/en/products/subc/index.md'], 'trailing slash added');
});

test('read_page refuses other origins without fetching', async () => {
    const calls = stub({});

    const response = await handleRpcMessage({
        jsonrpc: '2.0',
        id: 7,
        method: 'tools/call',
        params: { name: 'read_page', arguments: { page: 'https://evil.example/secret/' } }
    });

    assert.equal(response.result.isError, true);
    assert.match(response.result.content[0].text, /Only pages on dehlimusikk\.no/);
    assert.deepEqual(calls, [], 'the Worker must not be usable as an open proxy');
});

test('a tool that throws reports it in the result, not as a JSON-RPC error', async () => {
    globalThis.fetch = async () => {
        throw new Error('origin unreachable');
    };

    const response = await handleRpcMessage({
        jsonrpc: '2.0',
        id: 8,
        method: 'tools/call',
        params: { name: 'search', arguments: { query: 'anything' } }
    });

    assert.equal(response.error, undefined, 'the call itself succeeded');
    assert.equal(response.result.isError, true);
    assert.match(response.result.content[0].text, /search failed: origin unreachable/);
});

test('the HTTP endpoint handles CORS, bad JSON, batches and GET', async () => {
    const preflight = await handleMcpRequest(new Request('https://www.dehlimusikk.no/mcp', { method: 'OPTIONS' }));
    assert.equal(preflight.status, 204);
    assert.equal(preflight.headers.get('Access-Control-Allow-Origin'), '*');

    const bad = await handleMcpRequest(
        new Request('https://www.dehlimusikk.no/mcp', { method: 'POST', body: 'not json', headers: { 'Content-Type': 'application/json' } })
    );
    assert.equal(bad.status, 400);
    assert.equal((await bad.json()).error.code, -32700);

    const batch = await handleMcpRequest(post([{ jsonrpc: '2.0', id: 1, method: 'ping' }]));
    assert.equal(batch.status, 400);
    assert.match((await batch.json()).error.message, /Batched requests/);

    const get = await handleMcpRequest(new Request('https://www.dehlimusikk.no/mcp'));
    assert.equal(get.status, 405);
    assert.equal(get.headers.get('Allow'), 'POST, OPTIONS');
});

test('the server card names the endpoint and the tools capability', () => {
    const card = serverCard();

    assert.equal(card.serverInfo.name, 'dehli-musikk');
    assert.ok(card.serverInfo.version);
    assert.equal(card.endpoint, 'https://www.dehlimusikk.no/mcp');
    assert.ok(card.capabilities.tools);
    assert.equal(card.transports[0].type, 'streamable-http');
    // Whatever the card advertises has to be what the server implements
    assert.equal(card.protocolVersion, '2025-06-18');
    assert.equal(TOOLS.length, 3);
});
