// Helpers
import { getLlmsFullTxt } from "helpers/llmsTxtHelpers";

// Data
import posts from "data/posts";
import products from "data/products";
import releases from "data/portfolio";
import videos from "data/videos";
import frequentlyAskedQuestions from "data/frequentlyAskedQuestions";

export const dynamic = "force-static";

export async function GET() {
    const body = getLlmsFullTxt({ posts, products, releases, videos, frequentlyAskedQuestions });

    return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
}
