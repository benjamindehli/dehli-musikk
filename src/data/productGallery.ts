import type { Lang } from "lib/pageMetadata";

import galleryManifest from "./products/data/gallery.json";

/*
 * The generated sizes for the product gallery images, keyed by the filename the
 * product data names in additionalImages.
 *
 * Generated, not maintained: scripts/generate-product-images.mjs writes this
 * beside the images it encodes, so the two cannot disagree about which widths
 * exist. Editing it by hand only produces markup pointing at files nobody made.
 *
 * An image is in here only if it was encoded, which is what lets the gallery
 * degrade to nothing on a checkout where the script has not been run: the
 * component renders the entries it finds and skips the rest, rather than
 * offering a browser a src that 404s. yarn verify:images is what makes that
 * silence loud before a release.
 */
export type ProductGalleryImage = {
    /** The source filename without its extension - the generated files are named after it. */
    base: string;
    /** The intrinsic size of the source, so the markup can reserve the space. */
    width: number;
    height: number;
    /** The widths that were written, never wider than the source. */
    widths: number[];
    /**
     * The source's content when these were encoded, truncated sha256. Nothing
     * renders it - it is how yarn verify:images tells variants made from the
     * current source apart from ones made from a photo that has since been
     * replaced, which no count of files can see.
     */
    hash: string;
};

const productGallery: Record<string, ProductGalleryImage> = galleryManifest;

export const GALLERY_PATH = "/data/products/gallery";

export type GalleryFormat = "avif" | "webp" | "jpg";

/*
 * The URL of one variant. The hash in the name is what lets firebase.json serve
 * these with a year long max-age honestly: a replaced photo is a different URL,
 * so no cache anywhere is ever asked to notice that a file it already has has
 * changed underneath it.
 *
 * scripts/generate-product-images.mjs writes the files by this same rule, and
 * the two are separate implementations of it because one is TypeScript the build
 * consumes and the other is the Node script that has to run without one. A
 * divergence shows up as markup pointing at files that are not there, which is
 * what yarn verify:markup checks.
 */
export const galleryVariant = (image: ProductGalleryImage, width: number, format: GalleryFormat) =>
    `${GALLERY_PATH}/${format}/${image.base}_${width}.${image.hash}.${format}`;

const descriptions = {
    no: (title: string, position: number, total: number) => `${title} - bilde ${position} av ${total}`,
    en: (title: string, position: number, total: number) => `${title} - image ${position} of ${total}`
};

/*
 * What one gallery image is called, in the page's language. There is no authored
 * description for these: the product data carries a single thumbnailDescription
 * and it belongs to the main photo, so this is positional. Weak text, but honest,
 * and it names the product - better than an empty alt for something that is
 * content rather than decoration, and better than a filename read aloud.
 *
 * It lives here rather than in the component because the markup and the image
 * sitemap both need it, and a crawler reading a different sentence in
 * image:caption than a screen reader gets from alt would be describing a
 * different page than the one that exists. index is the image's place in the
 * rendered set - the images the manifest describes, not the raw
 * additionalImages list, which can name a file that was never encoded.
 *
 * Worth replacing with real per image descriptions in the product data. That is
 * an authoring job rather than a code one, so it is not pretended at here.
 */
export const galleryImageDescription = (lang: Lang, productTitle: string, index: number, total: number) =>
    descriptions[lang](productTitle, index + 1, total);

export default productGallery;
