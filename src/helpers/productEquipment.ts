import type { Product, ProductEquipmentRelation } from "types/content";
import productsEquipment from "data/productsEquipment";
import products from "data/products";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";

/*
 * The products a piece of equipment contributed to, grouped by how.
 *
 * The equipment pages carry no prose of their own - an item is a brand and a
 * model, and everything else on the page is what it has been heard on. This
 * adds the other half of that: the Korg CX-3 page can say the Voltage
 * Controlled Cassette Organ was sampled from it, and the Fulltone Tube Tape
 * Echo page can say three libraries were recorded through it.
 *
 * Returned in the order the products are authored in, which is newest first,
 * rather than in the order of the mapping file.
 */
export type ProductsByRelation = Partial<Record<ProductEquipmentRelation, Product[]>>;

export const getProductsForEquipmentItem = (equipmentId: string): ProductsByRelation => {
    const links = productsEquipment.filter((link) => link.equipmentId === equipmentId);
    if (!links.length) return {};

    const grouped: ProductsByRelation = {};
    for (const product of products) {
        const productId = convertToUrlFriendlyString(product.title);
        for (const link of links) {
            if (link.productId !== productId) continue;
            (grouped[link.relation] ??= []).push(product);
        }
    }
    return grouped;
};
