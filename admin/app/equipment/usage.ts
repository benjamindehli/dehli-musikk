import "server-only";

import type { EquipmentTypeKey } from "data/equipment";
import type { Post, Product, ProductEquipmentLink, Release, ReleaseInstrumentLink, Video } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, readReleases } from "@admin/lib/dataFiles";

export type EquipmentUsage = {
    releases: { file: string; label: string }[];
    products: { slug: string; label: string; relation: string }[];
    /** Posts, videos and products whose text links to the item's page. */
    mentions: { href: string; label: string }[];
};

/*
 * Everything that refers to one equipment item by its slug. The editor shows
 * it, and delete refuses while any of it exists: each of these would become a
 * dead link or a silently empty list on the site.
 *
 * Release links only ever point at instruments - that is how the site
 * resolves them - so the other two types never have any.
 */
export async function equipmentUsage(type: EquipmentTypeKey, slug: string): Promise<EquipmentUsage> {
    const [releaseLinks, productLinks, releases, products, posts, videos] = await Promise.all([
        readDataFile<ReleaseInstrumentLink[]>("releasesInstruments"),
        readDataFile<ProductEquipmentLink[]>("productsEquipment"),
        readReleases<Release>(),
        readDataFile<Product[]>("products"),
        readDataFile<Post[]>("posts"),
        readDataFile<Video[]>("videos")
    ]);

    const releaseSlugs = new Set(
        type === "instruments" ? releaseLinks.filter((link) => !link.isProduct && link.equipmentId === slug).map((link) => link.releaseId) : []
    );
    const path = `equipment/${type}/${slug}/`;
    const mentions = (content: { no: string; en: string }) => content.no.includes(path) || content.en.includes(path);

    return {
        releases: Object.entries(releases)
            .filter(([, release]) => releaseSlugs.has(release.slug))
            .map(([file, release]) => ({ file: file.replace(/\.json$/, ""), label: `${release.artistName} - ${release.title}` })),
        products: productLinks
            .filter((link) => link.equipmentId === slug)
            .map((link) => ({
                slug: link.productId,
                label: products.find((product) => convertToUrlFriendlyString(product.title) === link.productId)?.title ?? link.productId,
                relation: link.relation
            })),
        mentions: [
            ...posts.filter((post) => mentions(post.content)).map((post) => ({ href: `/posts/${post.id}/`, label: `Post: ${post.title.no}` })),
            ...videos
                .filter((video) => mentions(video.content))
                .map((video) => ({ href: `/videos/${video.thumbnailFilename}/`, label: `Video: ${video.title.no}` })),
            ...products
                .filter((product) => mentions(product.content))
                .map((product) => ({ href: `/products/${convertToUrlFriendlyString(product.title)}/`, label: `Product: ${product.title}` }))
        ]
    };
}
