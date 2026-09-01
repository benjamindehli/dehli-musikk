'use client';

/*
 * Registers this site's tools with the browser via WebMCP, so an agent running
 * in the page can search the catalogue and read pages without scraping the DOM.
 *
 * https://webmachinelearning.github.io/webmcp/
 *
 * The API is an unstable draft, behind an origin trial in Chrome and absent
 * everywhere else, so everything here is defensive: feature detected, wrapped in
 * try/catch, and never on a path a visitor's page render depends on. If the
 * shape of registerTool changes under us the worst outcome must be that the
 * tools go unregistered, never a broken page.
 *
 * The tools themselves live in helpers/webMcpTools. This component only owns
 * registering and unregistering them.
 */

import { useEffect } from 'react';

import { buildTools } from 'helpers/webMcpTools';

/**
 * @param {{ lang: 'no' | 'en' }} props
 */
const WebMcpTools = ({ lang }) => {
    useEffect(() => {
        const modelContext = typeof navigator !== 'undefined' ? navigator.modelContext : undefined;
        if (!modelContext || typeof modelContext.registerTool !== 'function') return undefined;

        const controller = new AbortController();
        const handles = [];

        try {
            for (const tool of buildTools(lang)) {
                /*
                 * The draft has moved between carrying the AbortSignal on the
                 * descriptor and taking it in an options bag, and between
                 * returning a handle and returning nothing. Supplying both and
                 * keeping whatever comes back means either shape unregisters.
                 */
                handles.push(modelContext.registerTool({ ...tool, signal: controller.signal }, { signal: controller.signal }));
            }
        } catch (error) {
            // An unsupported signature must not take the page down with it
            console.warn('WebMCP tools were not registered:', error);
        }

        return () => {
            controller.abort();
            for (const handle of handles) {
                try {
                    if (typeof handle?.unregister === 'function') handle.unregister();
                } catch {
                    // Already gone, or a shape that never needed unregistering
                }
            }
        };
    }, [lang]);

    return null;
};

export default WebMcpTools;
