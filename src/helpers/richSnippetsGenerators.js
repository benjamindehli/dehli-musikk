// Helpers
import { formatContentAsString } from "./contentFormatter";
import { getPlusOneYear } from "./dateFormatter";
import { convertToUrlFriendlyString } from "./urlFormatter";

// Data
import countryCodes from "data/countryCodes";

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

function generateSoftwareApplicationProperties(product) {
    const [category, ...platforms] = product.productType || [];
    if (!SOFTWARE_PRODUCT_CATEGORIES.includes(category)) return null;
    return {
        operatingSystem: "All",
        applicationCategory: ["EntertainmentApplication", "MultimediaApplication"],
        softwareRequirements: platforms.length ? platforms.join(", ") : undefined
    };
}

export function generateProductSnippet(product, languageSlug, selectedLanguageKey) {
    const productId = convertToUrlFriendlyString(product.title);

    const productDate = new Date(product.timestamp).toISOString();
    const plusOneYear = getPlusOneYear();

    const productThumbnailSrc = `https://www.dehlimusikk.no/data/products/web/jpg/${productId}_540.jpg`;

    const image = [product?.mainImage]
        .concat(product?.additionalImages || [])
        .filter(Boolean)
        .map((image) => `https://www.dehlimusikk.no/${image}`);

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

    const softwareApplicationProperties = generateSoftwareApplicationProperties(product);

    const snippet = {
        "@context": "https://schema.org",
        // A single node typed as both, rather than two nodes sharing one @id:
        // same @id means same node, so separate Product/SoftwareApplication
        // snippets would merge into one node with contradictory types.
        "@type": softwareApplicationProperties ? ["Product", "SoftwareApplication"] : "Product",
        "@id": product.link.url,
        url: `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
        description: formatContentAsString(product.content[selectedLanguageKey]),
        brand: {
            "@type": "Brand",
            name: "Dehli Musikk"
        },
        productionDate: productDate,
        releaseDate: productDate,
        name: product.title,
        image: image.length ? image : productThumbnailSrc,
        video: video,
        offers: {
            "@type": "Offer",
            price: product.price?.length ? product.price : 0,
            priceCurrency: product.priceCurrency?.length ? product.priceCurrency : "USD",
            url: product.link.url,
            availability: "https://schema.org/OnlineOnly",
            validFrom: productDate,
            priceValidUntil: plusOneYear,
            hasMerchantReturnPolicy: generateHasMerchantReturnPolicySnippet(),
            seller: {
                "@type": "Organization",
                name: "Dehli Musikk"
            }
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
