// Helpers
import { getNewsSitemapXML } from "helpers/sitemapHelpers";

// Data
import posts from "data/posts";

export const dynamic = "force-static";

export async function GET() {
    const xml = getNewsSitemapXML(posts);

    return new Response(xml, {
        headers: { "Content-Type": "application/xml" }
    });
}
