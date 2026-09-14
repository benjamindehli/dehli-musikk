import type { Product } from "types/content";

/*
 * The formats a product ships in, as one readable string:
 * "VST3 (macOS), AU (macOS), Standalone (macOS), Decent Sampler (macOS, Windows, Linux)".
 *
 * The systems are stated per format rather than once for the product, because
 * on a sample instrument they differ: the plugin builds are macOS only and it
 * is the Decent Sampler version that reaches the other two. Saying only
 * "macOS, Windows, Linux" there would be true of the product and misleading
 * about every format in it.
 *
 * Its own module rather than a function in richSnippetsGenerators, even though
 * that is where it is most obviously used. The product page, the markdown
 * twins and llms-full.txt all print this same string, and richSnippetsGenerators
 * imports contentFormatter, which is JSX - so importing it from the string
 * producing helpers would pull JSX in behind them, which is the thing
 * contentText exists to avoid.
 */
export function formatProductFormats(product: Product): string | undefined {
    if (!product.formats?.length) return undefined;
    return product.formats.map((format) => (format.operatingSystem ? `${format.name} (${format.operatingSystem})` : format.name)).join(", ");
}
