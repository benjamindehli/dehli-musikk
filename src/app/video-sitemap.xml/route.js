// Helpers
import { getVideoSitemapXML } from "helpers/sitemapHelpers";

// Data
import videos from "data/videos";

export const dynamic = "force-static";

export async function GET() {
    const xml = getVideoSitemapXML(videos);

    return new Response(xml, {
        headers: { "Content-Type": "application/xml" }
    });
}
