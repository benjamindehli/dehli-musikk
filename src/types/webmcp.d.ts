/*
 * The WebMCP surface this site touches: navigator.modelContext, and the handle
 * registerTool may or may not hand back.
 *
 * Everything here is optional, and deliberately so. WebMCP is not in ordinary
 * Chrome without an origin trial token, the API is still moving, and
 * components/partials/WebMcpTools is written to degrade to doing nothing rather
 * than to assume any of it exists. The types say the same thing the code does.
 */

/** What registerTool returns, where it returns anything at all. */
interface ModelContextToolHandle {
    unregister?: () => void;
}

interface ModelContext {
    /*
     * Two shapes have been in circulation - one taking the signal on the tool,
     * one as a second argument - so the site passes both and keeps whatever
     * comes back.
     */
    registerTool?: (tool: Record<string, unknown>, options?: { signal?: AbortSignal }) => ModelContextToolHandle | undefined;
}

interface Navigator {
    /** Absent unless the page is running with WebMCP enabled. */
    modelContext?: ModelContext;
}
