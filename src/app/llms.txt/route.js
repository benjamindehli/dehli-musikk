// Helpers
import { getLlmsTxt } from "helpers/llmsTxtHelpers";

// Data
import posts from "data/posts";
import products from "data/products";
import releases from "data/portfolio";
import videos from "data/videos";

export const dynamic = "force-static";

export async function GET() {
    const body = getLlmsTxt({ posts, products, releases, videos });

    return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
}
