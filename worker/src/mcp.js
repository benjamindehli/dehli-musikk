/*
 * A Model Context Protocol server for dehlimusikk.no, over Streamable HTTP.
 *
 * Unlike the WebMCP tools, which only exist in a browser that has the API, this
 * is reachable by any MCP client today - Claude Desktop, editors, agent
 * frameworks - by pointing them at https://www.dehlimusikk.no/mcp.
 *
 * Stateless: every request carries everything needed to answer it, so there are
 * no sessions to keep and nothing to store. The site is static, so there is also
 * nothing to write; all three tools are reads.
 *
 * The search corpus is /llms-full.txt rather than the JSON the site's own search
 * uses. That file already carries every item's title, URL and full text, which
 * means this server never has to derive a slug. Deriving one would mean a second
 * copy of convertToUrlFriendlyString living at the edge, and the day the two
 * disagreed every URL in a search result would 404 with nothing to catch it.
 *
 * The trade is that llms-full.txt is English only, so search results are English
 * whatever language the caller works in. read_page handles either language.
 */

const CANONICAL_ORIGIN = 'https://www.dehlimusikk.no';
const PROTOCOL_VERSION = '2025-06-18';
const SERVER_INFO = { name: 'dehli-musikk', version: '1.0.0' };

export const MCP_ENDPOINT_PATH = '/mcp';
export const MCP_SERVER_CARD_PATH = '/.well-known/mcp/server-card.json';

export const serverCard = () => ({
    serverInfo: SERVER_INFO,
    description:
        'Read-only access to the Dehli Musikk catalogue: recordings, posts, videos, virtual instruments and plugins. Search the site and fetch any page as clean markdown.',
    endpoint: `${CANONICAL_ORIGIN}${MCP_ENDPOINT_PATH}`,
    transport: 'streamable-http',
    transports: [{ type: 'streamable-http', url: `${CANONICAL_ORIGIN}${MCP_ENDPOINT_PATH}` }],
    protocolVersion: PROTOCOL_VERSION,
    capabilities: { tools: { listChanged: false } },
    documentation: `${CANONICAL_ORIGIN}/.well-known/agent-skills/dehli-musikk-catalogue/SKILL.md`
});

/* --- llms-full.txt as a search corpus ------------------------------------- */

const SECTION_CATEGORIES = {
    Products: 'product',
    Posts: 'post',
    Videos: 'video',
    Releases: 'release',
    Equipment: 'equipment',
    'Frequently asked questions': 'faq'
};

/*
 * The document is headings and prose: "## Section (n)", then "### Title" per
 * entry, then an optional "URL:" line, some "Key: value" metadata, then the
 * body. FAQ entries carry no URL of their own, so they fall back to the page
 * that lists them.
 */
export function parseCorpus(text) {
    const entries = [];
    let category = null;
    let current = null;

    const finish = () => {
        if (!current) return;
        current.text = current.lines.join(' ').replace(/\s+/g, ' ').trim();
        delete current.lines;
        if (!current.url && current.category === 'faq') {
            current.url = `${CANONICAL_ORIGIN}/en/frequently-asked-questions/`;
        }
        if (current.url) entries.push(current);
        current = null;
    };

    for (const line of text.split('\n')) {
        const section = line.match(/^## (.+?)(?: \(\d+\))?$/);
        if (section) {
            finish();
            category = SECTION_CATEGORIES[section[1]] ?? null;
            continue;
        }
        const heading = line.match(/^### (.+)$/);
        if (heading) {
            finish();
            current = { title: heading[1].trim(), category, url: null, lines: [] };
            continue;
        }
        if (!current) continue;

        const url = line.match(/^URL: (\S+)$/);
        if (url) {
            current.url = url[1];
            continue;
        }
        // Metadata lines read fine as prose and are worth searching too
        if (line.trim()) current.lines.push(line.trim());
    }
    finish();

    return entries;
}

const escapeForRegex = (word) => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/*
 * What one word's body matches contribute, with diminishing returns.
 *
 * Entry lengths differ by an order of magnitude: an equipment item names every
 * video it is heard in, and the Chase Bliss CXM 1978 is in 69 of them. Scored
 * linearly, length alone wins - a Vox AC15H1TV came second for "clavinet" purely
 * on volume, being an amp that appears in a lot of Clavinet videos.
 *
 * A hard cap was tried first and was worse: at five it demoted the item actually
 * named "Fulltone Tube Tape Echo" below a video for the query "tape echo",
 * because a cap discards signal that is still meaningful past the threshold. A
 * square root keeps the ordering while flattening the tail - one match scores 2,
 * nine score 6, sixty-nine score about 17 rather than 69.
 */
const bodyScore = (matches) => (matches ? Math.sqrt(matches) * 2 : 0);

/*
 * Deliberately simpler than the ranking behind the site's own search box, which
 * weights each field of each content type separately. This has one corpus and no
 * fields, so it scores a title match well above a body match and leaves it
 * there.
 */
export function searchCorpus(entries, query, category = 'all', limit = 10) {
    const words = query
        .toLowerCase()
        .split(/\s+/)
        .map((word) => word.replace(/[^\p{L}\p{N}-]/gu, ''))
        .filter((word) => word.length > 1);
    if (!words.length) return [];

    const scored = [];
    for (const entry of entries) {
        if (category !== 'all' && entry.category !== category) continue;

        let score = 0;
        for (const word of words) {
            const pattern = new RegExp(escapeForRegex(word), 'gi');
            score += (entry.title.match(pattern) || []).length * 5;
            score += bodyScore((entry.text.match(pattern) || []).length);
        }
        if (score > 0) scored.push({ ...entry, score: score / words.length });
    }

    return scored.sort((a, b) => b.score - a.score).slice(0, Math.min(Math.max(limit, 1), 25));
}

const excerpt = (text, length = 200) => (text.length <= length ? text : `${text.slice(0, length).replace(/\s+\S*$/, '')}…`);

/* --- tools ---------------------------------------------------------------- */

const textContent = (text) => ({ content: [{ type: 'text', text }] });
const errorContent = (text) => ({ content: [{ type: 'text', text }], isError: true });

/*
 * Only same-origin pages may be read. Without this the tool would fetch any URL
 * a caller named, using the Worker as an open proxy.
 */
function resolveSitePath(target) {
    let url;
    try {
        url = new URL(target, `${CANONICAL_ORIGIN}/`);
    } catch {
        return null;
    }
    if (url.origin !== CANONICAL_ORIGIN) return null;
    if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
    return url;
}

const SECTIONS = [
    { path: '', label: 'Home' },
    { path: 'portfolio/', label: 'Portfolio - recordings Dehli Musikk played on' },
    { path: 'posts/', label: 'Posts - updates and build logs' },
    { path: 'videos/', label: 'Videos - demonstrations and studio sessions' },
    { path: 'products/', label: 'Products - virtual instruments, sample libraries and plugins' },
    { path: 'equipment/', label: 'Equipment - instruments, effects and amplifiers used on recordings' },
    { path: 'frequently-asked-questions/', label: 'Frequently asked questions' }
];

export const TOOLS = [
    {
        name: 'search',
        description:
            'Search the Dehli Musikk catalogue: virtual instruments and plugins, blog posts, videos, recordings in the portfolio, studio equipment, and the FAQ. Returns titles, URLs and excerpts. English only. Equipment entries name the videos and recordings each item is heard on, so this also answers "what gear is on that track".',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'Words to search for, e.g. "mellotron" or "Wurlitzer piano".' },
                category: {
                    type: 'string',
                    enum: ['all', 'product', 'post', 'video', 'release', 'equipment', 'faq'],
                    description: 'Restrict to one kind of item. Defaults to all.'
                },
                limit: { type: 'integer', minimum: 1, maximum: 25, description: 'Maximum results. Defaults to 10.' }
            },
            required: ['query']
        },
        async execute({ query, category = 'all', limit = 10 }) {
            const response = await fetch(`${CANONICAL_ORIGIN}/llms-full.txt`);
            if (!response.ok) return errorContent(`Could not load the search corpus (HTTP ${response.status}).`);

            const results = searchCorpus(parseCorpus(await response.text()), query, category, limit);
            if (!results.length) return textContent(`No results for "${query}".`);

            const lines = results.map((result) => `- [${result.category}] ${result.title}\n  ${result.url}\n  ${excerpt(result.text)}`);
            return textContent(`${results.length} result(s) for "${query}":\n\n${lines.join('\n\n')}`);
        }
    },
    {
        name: 'read_page',
        description:
            'Fetch any page on dehlimusikk.no as clean markdown, without navigation or layout. Accepts a full URL or a site-relative path, in either language. Prefer this over fetching the HTML.',
        inputSchema: {
            type: 'object',
            properties: {
                page: { type: 'string', description: 'A dehlimusikk.no URL or site-relative path, e.g. "/en/products/overtonium/".' }
            },
            required: ['page']
        },
        async execute({ page }) {
            const url = resolveSitePath(page);
            if (!url) return errorContent('Only pages on dehlimusikk.no can be read with this tool.');

            const response = await fetch(`${CANONICAL_ORIGIN}${url.pathname}index.md`);
            if (!response.ok) {
                return errorContent(
                    `No markdown available for ${url.pathname} (HTTP ${response.status}). The search page and the error pages are published as HTML only.`
                );
            }
            return textContent(await response.text());
        }
    },
    {
        name: 'list_sections',
        description: 'List the main sections of dehlimusikk.no with their URLs. Norwegian is at the site root, English under /en/.',
        inputSchema: {
            type: 'object',
            properties: {
                language: { type: 'string', enum: ['no', 'en'], description: 'Which language to return URLs for. Defaults to en.' }
            }
        },
        async execute({ language = 'en' } = {}) {
            const slug = language === 'no' ? '' : 'en/';
            const lines = SECTIONS.map((section) => `- ${section.label}: ${CANONICAL_ORIGIN}/${slug}${section.path}`);
            return textContent([`Sections of dehlimusikk.no (${language}):`, '', ...lines].join('\n'));
        }
    }
];

const publicTool = ({ name, description, inputSchema }) => ({ name, description, inputSchema });

/* --- JSON-RPC ------------------------------------------------------------- */

const rpcResult = (id, result) => ({ jsonrpc: '2.0', id, result });
const rpcError = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

/**
 * Handles one JSON-RPC message. Returns null for notifications, which by
 * definition get no reply.
 */
export async function handleRpcMessage(message) {
    if (!message || message.jsonrpc !== '2.0' || typeof message.method !== 'string') {
        return rpcError(message?.id ?? null, -32600, 'Not a valid JSON-RPC 2.0 request');
    }

    const { id, method, params } = message;
    const isNotification = id === undefined;

    switch (method) {
        case 'initialize':
            return isNotification
                ? null
                : rpcResult(id, {
                      protocolVersion: PROTOCOL_VERSION,
                      capabilities: { tools: { listChanged: false } },
                      serverInfo: SERVER_INFO,
                      instructions:
                          'Read-only access to dehlimusikk.no. Use search to find items, then read_page to get a page as markdown. The content may be used to answer questions with attribution, but not to train models.'
                  });

        case 'ping':
            return isNotification ? null : rpcResult(id, {});

        case 'tools/list':
            return isNotification ? null : rpcResult(id, { tools: TOOLS.map(publicTool) });

        case 'tools/call': {
            if (isNotification) return null;
            const tool = TOOLS.find((candidate) => candidate.name === params?.name);
            if (!tool) return rpcError(id, -32602, `Unknown tool: ${params?.name}`);
            try {
                return rpcResult(id, await tool.execute(params.arguments ?? {}));
            } catch (error) {
                /*
                 * A tool that fails reports it in the result, not as a JSON-RPC
                 * error: the call itself succeeded, the work inside it did not,
                 * and the model is supposed to see why and be able to react.
                 */
                return rpcResult(id, errorContent(`${tool.name} failed: ${error?.message ?? error}`));
            }
        }

        default:
            // Notifications we do not implement, such as notifications/initialized,
            // are silently accepted. That is what the spec asks for.
            return isNotification ? null : rpcError(id, -32601, `Unknown method: ${method}`);
    }
}

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, MCP-Protocol-Version, Mcp-Session-Id, Authorization',
    'Access-Control-Max-Age': '86400'
};

const json = (body, status = 200) =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });

/**
 * The Streamable HTTP endpoint.
 */
export async function handleMcpRequest(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

    if (request.method !== 'POST') {
        /*
         * GET opens a server-to-client SSE stream in Streamable HTTP. This server
         * has nothing to push - no subscriptions, no progress, no sampling - so
         * it declines rather than holding a connection open forever.
         */
        return new Response(JSON.stringify(rpcError(null, -32000, 'This server supports POST only; it has no server-initiated stream.')), {
            status: 405,
            headers: { 'Content-Type': 'application/json', Allow: 'POST, OPTIONS', ...CORS_HEADERS }
        });
    }

    let payload;
    try {
        payload = await request.json();
    } catch {
        return json(rpcError(null, -32700, 'Parse error'), 400);
    }

    // Batching was removed from MCP in 2025-06-18
    if (Array.isArray(payload)) return json(rpcError(null, -32600, 'Batched requests are not supported'), 400);

    const response = await handleRpcMessage(payload);
    // A notification gets no body, only an acknowledgement
    if (response === null) return new Response(null, { status: 202, headers: CORS_HEADERS });
    return json(response);
}

export const handleMcpServerCard = () => json(serverCard());
