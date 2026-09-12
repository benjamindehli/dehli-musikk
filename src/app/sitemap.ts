// Helpers
import { getSitemapXML } from "helpers/sitemapHelpers";

// Data
import posts from "data/posts";
import videos from "data/videos";
import products from "data/products";
import releases from "data/portfolio";
import equipmentTypes from "data/equipment";

export const dynamic = "force-static";

export default async function sitemap() {
    return [...getSitemapXML({ posts, videos, products, equipmentTypes, releases })];
}
