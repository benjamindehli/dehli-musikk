// Helpers
import { getLlmsFullTxt } from "helpers/llmsTxtHelpers";

// Data
import posts from "data/posts";
import products from "data/products";
import releases from "data/portfolio";
import videos from "data/videos";
import equipmentTypes from "data/equipment";
import frequentlyAskedQuestions from "data/frequentlyAskedQuestions";

/*
 * The Norwegian llms-full.txt. See llms-no.txt for why the English pair keeps
 * the unsuffixed names.
 *
 * The Worker's MCP server still searches the English /llms-full.txt only, so a
 * Norwegian query through the MCP tools is answered from English text. Making
 * that bilingual is a Worker change rather than a build one.
 */
export const dynamic = "force-static";

export async function GET() {
    const body = getLlmsFullTxt({ posts, products, releases, videos, equipmentTypes, frequentlyAskedQuestions, lang: "no" });

    return new Response(body, {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
}
