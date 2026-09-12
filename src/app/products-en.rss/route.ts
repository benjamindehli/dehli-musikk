// Helpers
import { getMerchantFeedXML } from "helpers/feedHelpers";

// Data
import products from "data/products";

export const dynamic = "force-static";

export async function GET() {
    const xml = getMerchantFeedXML(products, "en");

    return new Response(xml, {
        headers: { "Content-Type": "application/rss+xml" }
    });
}
