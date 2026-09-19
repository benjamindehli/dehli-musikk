import type { Lang } from "lib/pageMetadata";
import type { Localized } from "types/content";

// Data
import productGallery, { galleryImageDescription, galleryVariant, type GalleryFormat, type ProductGalleryImage } from "data/productGallery";

// Stylesheets
import style from "components/partials/ProductGallery.module.scss";

/*
 * The product's own screenshots and photos, which the data has always carried
 * in additionalImages and which nothing rendered until now: they went into the
 * JSON-LD and into the merchant feeds, so a crawler was told about a gallery
 * that a visitor could not see. Ten of them for the cassette organ, seven for
 * the microSAMPLER editor.
 *
 * Rendered server side with no JavaScript at all. These are below the buttons
 * and below the fold, so every one is lazy, and none of them competes with the
 * main product photo for the LCP.
 */

const translations = {
    no: { heading: "Bilder" },
    en: { heading: "Images" }
} as const;

/*
 * The column is 540px wide at most, and full bleed below that. Both numbers are
 * the modal's, so if products ever move to the 945px modal the video pages use,
 * this and the widths in scripts/generate-product-images.mjs change together.
 */
const GALLERY_SIZES = "(max-width: 599px) 100vw, 540px";

const srcSetFor = (image: ProductGalleryImage, format: GalleryFormat) =>
    image.widths.map((width) => `${galleryVariant(image, width, format)} ${width}w`).join(", ");

const ProductGallery = ({
    filenames,
    descriptions,
    productTitle,
    lang
}: {
    filenames: string[];
    descriptions?: Record<string, Localized | undefined>;
    productTitle: string;
    lang: Lang;
}) => {
    /*
     * Only the images that were actually encoded. On a checkout where
     * scripts/generate-product-images.mjs has not been run the manifest is
     * empty, and this renders nothing rather than pointing the browser at files
     * that are not there. yarn verify:images is what stops that reaching a
     * release unnoticed.
     *
     * The filename travels with the entry because the authored caption is keyed
     * by it, and the manifest entry knows only the basename.
     */
    const images = filenames.map((filename) => ({ filename, image: productGallery[filename] })).filter(({ image }) => image);

    if (!images.length) return null;

    return (
        <section className={style.gallery}>
            <h2 className={style.heading}>{translations[lang].heading}</h2>
            {images.map(({ filename, image }, index) => (
                <picture key={image.base} className={style.image}>
                    <source type="image/avif" sizes={GALLERY_SIZES} srcSet={srcSetFor(image, "avif")} />
                    <source type="image/webp" sizes={GALLERY_SIZES} srcSet={srcSetFor(image, "webp")} />
                    <img
                        // The widest generated variant, which is the fallback a
                        // browser without srcset support gets.
                        src={galleryVariant(image, image.widths[image.widths.length - 1], "jpg")}
                        srcSet={srcSetFor(image, "jpg")}
                        sizes={GALLERY_SIZES}
                        /*
                         * The intrinsic size, not the displayed one. The set runs
                         * from a 134x323 sliver to a 1039x195 strip, so the
                         * browser needs each image's own ratio to reserve the
                         * right box - one shared aspect-ratio in the stylesheet
                         * would reflow the page under the visitor as they load.
                         */
                        width={image.width}
                        height={image.height}
                        loading="lazy"
                        decoding="async"
                        alt={galleryImageDescription(lang, productTitle, index, images.length, descriptions?.[filename])}
                    />
                </picture>
            ))}
        </section>
    );
};

export default ProductGallery;
