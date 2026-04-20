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

    const snippet = {
        "@context": "https://schema.org",
        "@type": "Product",
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
            "@id": "https://www.dehlimusikk.no"
        },
        sameAs: product.sameAs?.length ? product.sameAs : undefined
    };
    if (product?.ratingValue && product?.reviewCount) {
        snippet.aggregateRating = {
            "@type": "AggregateRating",
            ratingValue: product.ratingValue,
            reviewCount: product.reviewCount
        };
    }
    return snippet;
}

export function generateSoftwareApplicationSnippet(product, languageSlug) {
    const productId = convertToUrlFriendlyString(product.title);

    const productDate = new Date(product.timestamp).toISOString();
    const plusOneYear = getPlusOneYear();

    const applicationJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": product.link.url,
        url: `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
        name: product.title,
        operatingSystem: "All",
        applicationCategory: ["EntertainmentApplication", "MultimediaApplication"],
        softwareRequirements: "DecentSampler",
        offers: {
            "@type": "Offer",
            price: product.price?.length ? product.price : 0,
            priceCurrency: product.priceCurrency?.length ? product.priceCurrency : "USD",
            url: product.link.url,
            availability: "https://schema.org/OnlineOnly",
            validFrom: productDate,
            priceValidUntil: plusOneYear,
            hasMerchantReturnPolicy: generateHasMerchantReturnPolicySnippet(),
            sameAs: product.sameAs?.length && product.sameAs,
            seller: {
                "@type": "Organization",
                name: "Dehli Musikk"
            }
        }
    };
    return applicationJsonLd;
}
