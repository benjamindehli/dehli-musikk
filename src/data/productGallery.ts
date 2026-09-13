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
};

const productGallery: Record<string, ProductGalleryImage> = galleryManifest;

export const GALLERY_PATH = "/data/products/gallery";

export default productGallery;
