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

export default productGallery;
