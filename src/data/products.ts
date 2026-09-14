import type { Product } from "types/content";
import allProductsJson from "./products/data/all.json";

/*
 * Declared as Product[] rather than left as whatever the JSON happens to infer.
 *
 * Inference types the array from the records that exist, so an optional field
 * no product uses yet does not exist on the type at all, and every caller that
 * reads one fails to compile - which is how softwareVersion and fileSize broke
 * the markdown twins the moment they were added to the type but not to any
 * product. The declaration makes types/content authoritative, and adding the
 * first product that carries a field becomes a data change rather than a data
 * change plus a type puzzle.
 */
const allProducts: Product[] = allProductsJson;

// Derived, not maintained: see the note in data/posts.js
const LATEST_COUNT = 3;

const latestProducts = [...allProducts].sort((a, b) => b.timestamp - a.timestamp).slice(0, LATEST_COUNT);

export { latestProducts };

export default allProducts;
