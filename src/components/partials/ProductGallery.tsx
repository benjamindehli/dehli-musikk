import type { Lang } from "lib/pageMetadata";

// Data
import productGallery, { GALLERY_PATH, type ProductGalleryImage } from "data/productGallery";

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
    no: {
        heading: "Bilder",
        // Falls back to a positional description because the data has no text
        // for these. See the note on altTextFor.
        alt: (title: string, index: number, total: number) => `${title} - bilde ${index} av ${total}`
    },
    en: {
        heading: "Images",
        alt: (title: string, index: number, total: number) => `${title} - image ${index} of ${total}`
    }
} as const;

/*
 * The column is 540px wide at most, and full bleed below that. Both numbers are
 * the modal's, so if products ever move to the 945px modal the video pages use,
 * this and the widths in scripts/generate-product-images.mjs change together.
 */
const GALLERY_SIZES = "(max-width: 599px) 100vw, 540px";

const srcSetFor = (image: ProductGalleryImage, format: "avif" | "webp" | "jpg") =>
    image.widths.map((width) => `${GALLERY_PATH}/${format}/${image.base}_${width}.${format} ${width}w`).join(", ");

/*
 * There is no authored description for these images, only the one
 * thumbnailDescription that belongs to the main photo. A positional string is
 * weak alt text, but it is honest, it names the product, and it beats both an
 * empty alt - these are content, not decoration - and a filename read aloud.
 *
 * Worth replacing with real per image descriptions in the product data. That is
 * an authoring job rather than a code one, so it is not pretended at here.
 */
const altTextFor = (lang: Lang, productTitle: string, index: number, total: number) => translations[lang].alt(productTitle, index + 1, total);

const ProductGallery = ({ filenames, productTitle, lang }: { filenames: string[]; productTitle: string; lang: Lang }) => {
    /*
     * Only the images that were actually encoded. On a checkout where
     * scripts/generate-product-images.mjs has not been run the manifest is
     * empty, and this renders nothing rather than pointing the browser at files
     * that are not there. yarn verify:images is what stops that reaching a
     * release unnoticed.
     */
    const images = filenames.map((filename) => productGallery[filename]).filter(Boolean);

    if (!images.length) return null;

    return (
        <section className={style.gallery}>
            <h2 className={style.heading}>{translations[lang].heading}</h2>
            {images.map((image, index) => (
                <picture key={image.base} className={style.image}>
                    <source type="image/avif" sizes={GALLERY_SIZES} srcSet={srcSetFor(image, "avif")} />
                    <source type="image/webp" sizes={GALLERY_SIZES} srcSet={srcSetFor(image, "webp")} />
                    <img
                        // The widest generated variant, which is the fallback a
                        // browser without srcset support gets.
                        src={`${GALLERY_PATH}/jpg/${image.base}_${image.widths[image.widths.length - 1]}.jpg`}
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
                        alt={altTextFor(lang, productTitle, index, images.length)}
                    />
                </picture>
            ))}
        </section>
    );
};

export default ProductGallery;
