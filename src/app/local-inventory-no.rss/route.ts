// Helpers
import { getLocalInventoryFeedXML } from "helpers/feedHelpers";

// Data
import products from "data/products";

export const dynamic = "force-static";

export async function GET() {
    const xml = getLocalInventoryFeedXML(products, "no");

    return new Response(xml, {
        headers: { "Content-Type": "application/rss+xml" }
    });
}
