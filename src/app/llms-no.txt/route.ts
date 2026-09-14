// Helpers
import { getLlmsTxt } from "helpers/llmsTxtHelpers";

// Data
import posts from "data/posts";
import products from "data/products";
import releases from "data/portfolio";
import videos from "data/videos";

/*
 * The Norwegian llms.txt. Its English twin keeps the bare /llms.txt name it has
 * always had rather than moving under a suffix, so nothing that already fetches
 * it changes language underneath.
 */
export const dynamic = "force-static";

export async function GET() {
    const body = getLlmsTxt({ posts, products, releases, videos, lang: "no" });

    return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
}
