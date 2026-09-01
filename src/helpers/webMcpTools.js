/*
 * The tools this site offers to an in-page agent through WebMCP.
 *
 * Kept apart from the component that registers them so the definitions are
 * plain data and plain functions, with no React and no browser API in sight.
 * components/partials/WebMcpTools owns the lifecycle; this owns what the tools
 * actually do.
 *
 * The site's own code is imported lazily inside execute(). These definitions are
 * evaluated on every page load, and neither the search index nor its helpers
 * should be pulled into that.
 */

const WEBSITE_URL = 'https://www.dehlimusikk.no';

const translations = {
    no: {
        search: 'Search everything Dehli Musikk publishes: recordings in the portfolio, blog posts, videos, virtual instruments and plugins, studio equipment, and the FAQ. Returns Norwegian results. Use this to answer questions about what Dehli Musikk has made, played on, or sells.',
        read: 'Fetch the clean markdown version of any page on dehlimusikk.no, without navigation or layout. Accepts a full URL or a site-relative path. Prefer this over reading the rendered page.',
        sections: 'List the main sections of dehlimusikk.no with their URLs, for navigation.',
        noResults: (query) => `Ingen treff for "${query}".`,
        heading: 'Seksjoner på dehlimusikk.no:'
    },
    en: {
        search: 'Search everything Dehli Musikk publishes: recordings in the portfolio, blog posts, videos, virtual instruments and plugins, studio equipment, and the FAQ. Returns English results. Use this to answer questions about what Dehli Musikk has made, played on, or sells.',
        read: 'Fetch the clean markdown version of any page on dehlimusikk.no, without navigation or layout. Accepts a full URL or a site-relative path. Prefer this over reading the rendered page.',
        sections: 'List the main sections of dehlimusikk.no with their URLs, for navigation.',
        noResults: (query) => `No results for "${query}".`,
        heading: 'Sections on dehlimusikk.no:'
    }
};

const textResult = (text) => ({ content: [{ type: 'text', text }] });

/*
 * Resolves a caller-supplied page reference to a same-origin URL, or null.
 *
 * Without the origin check, read_dehli_musikk_page would fetch any URL an agent
 * named, from the visitor's browser and with the visitor's cookies. A tool that
 * reads this site must only read this site.
 */
export function resolveSitePath(target) {
    let url;
    try {
        url = new URL(target, `${WEBSITE_URL}/`);
    } catch {
        return null;
    }
    if (url.origin !== WEBSITE_URL) return null;
    // Every page on the site is a directory URL; the markdown twin sits inside it
    if (!url.pathname.endsWith('/')) url.pathname = `${url.pathname}/`;
    return url;
}

export function buildTools(lang) {
    const t = translations[lang] || translations.no;
    const languageSlug = lang === 'en' ? 'en/' : '';

    return [
        {
            name: 'search_dehli_musikk',
            description: t.search,
            inputSchema: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'Words to search for, e.g. "mellotron" or "Wurlitzer piano".' },
                    category: {
                        type: 'string',
                        enum: ['all', 'release', 'post', 'video', 'product', 'instruments', 'effects', 'amplifiers', 'faq'],
                        description: 'Narrow the search to one kind of item. Defaults to all.'
                    },
                    limit: { type: 'integer', minimum: 1, maximum: 25, description: 'Maximum results to return. Defaults to 10.' }
                },
                required: ['query']
            },
            async execute({ query, category = 'all', limit = 10 }) {
                const { getSearchResults } = await import('helpers/search');
                const results = (await getSearchResults(query, lang, category)) || [];
                if (!results.length) return textResult(t.noResults(query));

                const shown = results.slice(0, Math.min(Math.max(limit, 1), 25));
                const lines = shown.map((result) => {
                    const url = `${WEBSITE_URL}${result.link}${result.hash ? `#${result.hash}` : ''}`;
                    const excerpt = result.excerpt ? ` - ${result.excerpt}` : '';
                    return `- [${result.label}] ${result.text}${excerpt}\n  ${url}`;
                });
                const more = results.length > shown.length ? `\n\n${results.length - shown.length} further result(s) not shown.` : '';
                return textResult(`${results.length} result(s) for "${query}":\n\n${lines.join('\n')}${more}`);
            }
        },
        {
            name: 'read_dehli_musikk_page',
            description: t.read,
            inputSchema: {
                type: 'object',
                properties: {
                    page: { type: 'string', description: 'A dehlimusikk.no URL or a site-relative path, e.g. "/en/products/overtonium/".' }
                },
                required: ['page']
            },
            async execute({ page }) {
                const url = resolveSitePath(page);
                if (!url) return textResult('Only pages on dehlimusikk.no can be read with this tool.');

                /*
                 * Asks for the markdown twin by path rather than negotiating on
                 * the page URL, so the tool behaves the same whether or not the
                 * request passes through the edge worker.
                 */
                const response = await fetch(`${url.pathname}index.md`, { headers: { Accept: 'text/markdown' } });
                if (!response.ok) {
                    return textResult(`No markdown available for ${url.pathname} (HTTP ${response.status}). The search page and error pages are published as HTML only.`);
                }
                return textResult(await response.text());
            }
        },
        {
            name: 'list_dehli_musikk_sections',
            description: t.sections,
            inputSchema: { type: 'object', properties: {} },
            async execute() {
                const { sectionLinks } = await import('lib/sectionLinks');
                const lines = sectionLinks.map((section) => `- ${section.label[lang] || section.label.no}: ${WEBSITE_URL}/${languageSlug}${section.path}`);
                return textResult([t.heading, '', `- ${WEBSITE_URL}/${languageSlug}`, ...lines].join('\n'));
            }
        }
    ];
}
