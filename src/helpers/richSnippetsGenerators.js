// Helpers
import { formatContentAsString } from "./contentFormatter";
import { getPlusOneYear } from "./dateFormatter";
import { getMinimumPrice, getPriceCurrency } from "./productPricing";
import { convertToUrlFriendlyString } from "./urlFormatter";

// Data
import countryCodes from "data/countryCodes";

// The LocalBusiness node in components/SiteJsonLd, which every page carries
const SITE_JSON_LD_ID = "https://www.dehlimusikk.no/";

function generateHasMerchantReturnPolicySnippet() {
    return {
        "@type": "MerchantReturnPolicy",
        applicableCountry: countryCodes,
        returnPolicyCategory: "https://schema.org/MerchantReturnNotPermitted"
    };
}

// productType is ordered as [category, ...platforms], e.g.
// ["Sample instruments", "Decent Sampler", "EXS24"]. Only the categories below
// are software you run; a patch library is sysex data for a hardware synth and
// is a Product but not a SoftwareApplication.
const SOFTWARE_PRODUCT_CATEGORIES = ["Software", "Sample instruments"];

/*
 * operatingSystem used to be "All" for every software product, which is not true
 * of a native plugin and contradicted what the plugins' own pages say about
 * themselves. The values below come from each product's own description.
 *
 * Every sample library here is a Decent Sampler instrument, and Decent Sampler
 * runs on all three systems. Each library also ships a macOS plugin build, so
 * the three cover the product either way.
 */
const SAMPLE_INSTRUMENT_OPERATING_SYSTEMS = "macOS, Windows, Linux";

/*
 * The standalone plugins state their own support, so they are listed one by one.
 * A product missing from here gets no operatingSystem at all rather than a
 * guess, which is what leaving it out of this map means.
 */
const SOFTWARE_OPERATING_SYSTEMS = {
    overtonium: "macOS, Windows, Linux",
    "sidstation-asid": "macOS, Windows, Linux",
    "microsampler-editor-librarian": "macOS, Linux"
};

function generateSoftwareApplicationProperties(product, productId) {
    const [category, ...platforms] = product.productType || [];
    if (!SOFTWARE_PRODUCT_CATEGORIES.includes(category)) return null;
    return {
        operatingSystem:
            category === "Sample instruments"
                ? SAMPLE_INSTRUMENT_OPERATING_SYSTEMS
                : SOFTWARE_OPERATING_SYSTEMS[productId],
        applicationCategory: ["EntertainmentApplication", "MultimediaApplication"],
        softwareRequirements: platforms.length ? platforms.join(", ") : undefined
    };
}

export function generateProductSnippet(product, languageSlug, selectedLanguageKey) {
    const productId = convertToUrlFriendlyString(product.title);

    const productDate = new Date(product.timestamp).toISOString();
    const plusOneYear = getPlusOneYear();

    const productThumbnailSrc = `https://www.dehlimusikk.no/data/products/web/jpg/${productId}_540.jpg`;

    /*
     * mainImage and additionalImages are bare filenames, and the files sit in
     * public/product-images. The directory used to be missing here, so every
     * product advertised images at the site root that had never been there, while
     * the merchant feed built the same filenames correctly. Nothing on the page
     * showed it, because what visitors see comes from the generated sizes under
     * data/products/web instead.
     */
    const image = [product?.mainImage]
        .concat(product?.additionalImages || [])
        .filter(Boolean)
        .map((image) => `https://www.dehlimusikk.no/product-images/${image}`);

    const video = product?.video
        ? {
              "@type": "VideoObject",
              name: product?.video?.name?.[selectedLanguageKey],
              description: product?.video?.description?.[selectedLanguageKey],
              thumbnailUrl: productThumbnailSrc,
              uploadDate: product?.video?.uploadDate ? `${product?.video?.uploadDate}T18:00:00Z` : undefined,
              contentUrl: product?.video?.contentUrl
          }
        : null;

    const softwareApplicationProperties = generateSoftwareApplicationProperties(product, productId);

    const minimumPrice = getMinimumPrice(product);
    const priceCurrency = getPriceCurrency(product);

    const snippet = {
        "@context": "https://schema.org",
        // A single node typed as both, rather than two nodes sharing one @id:
        // same @id means same node, so separate Product/SoftwareApplication
        // snippets would merge into one node with contradictory types.
        "@type": softwareApplicationProperties ? ["Product", "SoftwareApplication"] : "Product",
        /*
         * The product's identity belongs on this site rather than on the store or
         * GitHub page it is downloaded from, which is where the @id used to
         * point: an @id is what other nodes refer to, and handing that to an
         * external URL means anything describing the product describes a page
         * Dehli Musikk does not control. The store URL is still in offers.url
         * and sameAs, which is what those are for.
         *
         * Language independent, so both language versions describe one product,
         * with the localised address in url. The #product fragment keeps it clear
         * of the WebPage node in mainEntityOfPage below, which owns the bare page
         * URL, the same way the WebSite node uses #website to stay clear of the
         * LocalBusiness.
         */
        "@id": `https://www.dehlimusikk.no/products/${productId}/#product`,
        url: `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
        description: formatContentAsString(product.content[selectedLanguageKey]),
        /*
         * References the LocalBusiness node that SiteJsonLd puts on every page,
         * rather than describing Dehli Musikk again. As anonymous nodes these
         * were two more copies of the business sitting beside the real one in the
         * same document with nothing tying them together.
         *
         * name is restated rather than left to the reference alone: each snippet
         * here goes out in its own script tag instead of a shared @graph, and a
         * consumer that reads one tag in isolation would otherwise see a brand
         * with no name. The value is the referenced node's own, so the two cannot
         * disagree. No @type, which would add Brand to the business's types.
         */
        brand: { "@id": SITE_JSON_LD_ID, name: "Dehli Musikk" },
        productionDate: productDate,
        releaseDate: productDate,
        name: product.title,
        image: image.length ? image : productThumbnailSrc,
        video: video,
        offers: {
            "@type": "Offer",
            /*
             * Store products are pay what you want, so this is the least a buyer
             * can pay and not a fixed amount. minPrice below says so.
             *
             * price stays regardless: Merchant Center compares it against the
             * g:price in the product feed when it crawls this page, and dropping
             * it in favour of the specification alone would leave that with
             * nothing to match. The two are the same number by construction.
             */
            price: minimumPrice,
            priceCurrency,
            // Nothing to qualify where a product is free: no minimum to clear,
            // and minPrice: 0 would only restate the price above.
            ...(minimumPrice > 0
                ? {
                      priceSpecification: {
                          "@type": "PriceSpecification",
                          minPrice: minimumPrice,
                          priceCurrency
                      }
                  }
                : {}),
            url: product.link.url,
            availability: "https://schema.org/OnlineOnly",
            validFrom: productDate,
            priceValidUntil: plusOneYear,
            hasMerchantReturnPolicy: generateHasMerchantReturnPolicySnippet(),
            // The same node as brand above, and as the business the page already
            // describes in full
            seller: { "@id": SITE_JSON_LD_ID, name: "Dehli Musikk" }
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`
        },
        sameAs: product.sameAs?.length ? product.sameAs : undefined,
        ...softwareApplicationProperties
    };
    return snippet;
}
