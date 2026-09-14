import type { Lang } from "lib/pageMetadata";
import type { Product as ProductData } from "types/content";

// Helpers
import { formatProductFormats } from "helpers/productSpecs";
import { getPriceCurrency, hasPrice } from "helpers/productPricing";

// Stylesheets
import style from "components/partials/ProductSpecs.module.scss";

/*
 * The facts a buyer checks before downloading anything: what it is delivered
 * as, what it runs on, what else it needs, what it costs.
 *
 * These already existed in the product's JSON-LD and nowhere a person could
 * read them. That is the wrong way round twice over: a visitor had to infer
 * the formats from a paragraph of prose, and an answer engine asked "does this
 * run on Linux" had structured data saying so but no sentence on the page to
 * quote. Visible text is what gets cited.
 *
 * Rendered as a description list rather than a table: it is a set of name and
 * value pairs, it has to survive a 540px column, and dl says what it is
 * without any of the layout trouble.
 */

const translations = {
    no: {
        heading: "Spesifikasjoner",
        formats: "Formater",
        operatingSystem: "Operativsystem",
        requires: "Krever",
        version: "Versjon",
        fileSize: "Størrelse",
        license: "Lisens",
        price: "Pris",
        free: "Gratis",
        priceFrom: (amount: string, currency: string) => `Fra ${amount} ${currency}`
    },
    en: {
        heading: "Specifications",
        formats: "Formats",
        operatingSystem: "Operating system",
        requires: "Requires",
        version: "Version",
        fileSize: "Size",
        license: "Licence",
        price: "Price",
        free: "Free",
        priceFrom: (amount: string, currency: string) => `From ${amount} ${currency}`
    }
} as const;

/*
 * The GNU licence URLs are the only ones in the data, and "GNU General Public
 * License v3" is what a reader wants to see rather than the URL. Anything not
 * recognised is shown as its own link text, which is honest about not knowing.
 */
const LICENCE_NAMES: Record<string, string> = {
    "https://www.gnu.org/licenses/gpl-3.0.html": "GNU GPL v3",
    "https://www.gnu.org/licenses/agpl-3.0.html": "GNU AGPL v3"
};

const ProductSpecs = ({ product, lang }: { product: ProductData; lang: Lang }) => {
    const t = translations[lang];

    // productType is [category, ...platforms]; the platforms are what the
    // product needs in order to run at all - Decent Sampler, a Yamaha DX7.
    const [, ...platforms] = product.productType || [];
    const formats = formatProductFormats(product);
    const price = hasPrice(product) ? t.priceFrom(product.price, getPriceCurrency(product)) : t.free;

    const rows: { label: string; value: React.ReactNode }[] = [
        { label: t.formats, value: formats },
        { label: t.operatingSystem, value: product.operatingSystem },
        { label: t.requires, value: platforms.length ? platforms.join(", ") : null },
        { label: t.version, value: product.softwareVersion },
        { label: t.fileSize, value: product.fileSize },
        {
            label: t.license,
            value: product.license ? (
                <a href={product.license} target="_blank" rel="noopener noreferrer">
                    {LICENCE_NAMES[product.license] ?? product.license}
                </a>
            ) : null
        },
        { label: t.price, value: price }
    ].filter((row) => row.value);

    // A patch library has no formats, no operating system and no version, so it
    // would be left with a heading over a price it already shows on its button.
    if (rows.length < 2) return null;

    return (
        <section className={style.specs}>
            <h2 className={style.heading}>{t.heading}</h2>
            <dl>
                {rows.map((row) => (
                    <div key={row.label} className={style.row}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
};

export default ProductSpecs;
