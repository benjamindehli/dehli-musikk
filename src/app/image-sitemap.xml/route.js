// Helpers
import { getImageSitemapXML } from "helpers/sitemapHelpers";

// Data
import posts from "data/posts";
import videos from "data/videos";
import products from "data/products";
import equipmentTypes from "data/equipment";

export const dynamic = "force-static";

export async function GET() {
    const xml = getImageSitemapXML({ equipmentTypes, posts, products, videos });

    return new Response(xml, {
        headers: { "Content-Type": "application/xml" }
    });
}
