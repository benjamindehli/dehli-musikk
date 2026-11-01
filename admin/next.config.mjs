import path from "node:path";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/*
 * The local admin dashboard. It edits the JSON under src/data and writes
 * images under public/data, so it only ever runs as `next dev` on the machine
 * that holds the checkout - see admin/README.md.
 *
 * It is a separate Next.js app rather than routes in the site: the site is a
 * static export, and an export cannot contain a page that writes files. Being
 * separate also means none of this can reach out/ or Firebase. The site's
 * tsconfig excludes admin/, and the site's build only looks at src/app.
 */
const repoRoot = path.resolve(import.meta.dirname, "..");

export default function config(phase) {
    // `next build admin` or `next start admin` would produce a server that
    // writes to the repo from wherever it is deployed. Refuse rather than
    // trust that nobody tries it. CI never has a reason to load this file.
    if (phase !== PHASE_DEVELOPMENT_SERVER || process.env.CI) {
        throw new Error("The admin dashboard is local only. Run it with `yarn admin`.");
    }

    return {
        // The admin imports the site's types and helpers from ../src, and
        // node_modules sits at the repo root, so the root is the project
        // boundary rather than admin/.
        turbopack: { root: repoRoot },
        outputFileTracingRoot: repoRoot,
        // sharp is a native module; bundling it breaks its binary lookup.
        serverExternalPackages: ["sharp"],
        // Thumbnails are made from uploaded originals: camera photos and full
        // resolution screenshots run to 8 MB, against a 1 MB default.
        experimental: { serverActions: { bodySizeLimit: "45mb" } },
        // Same URL shape as the site, so the hrefs here can be written the same way.
        trailingSlash: true,
        devIndicators: false,
        // next dev otherwise writes an AGENTS.md into admin/ on every start.
        agentRules: false
    };
}
