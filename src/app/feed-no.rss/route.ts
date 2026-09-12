// Helpers
import { getRssFeedXML } from "helpers/feedHelpers";

// Data
import posts from "data/posts";

export const dynamic = "force-static";

export async function GET() {
    const xml = getRssFeedXML(posts, "no");

    return new Response(xml, {
        headers: { "Content-Type": "application/rss+xml" }
    });
}
