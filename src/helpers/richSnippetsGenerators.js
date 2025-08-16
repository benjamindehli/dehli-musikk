// Helpers
import { formatContentAsString } from "./contentFormatter";
import { getPlusOneYear } from "./dateFormatter";
import { convertToUrlFriendlyString } from "./urlFormatter";

// Data
import countryCodes from "data/countryCodes";

function generateShippingDestinations(countryCodes) {
    return countryCodes.map((countryCode) => {
        return {
            "@type": "DefinedRegion",
            addressCountry: countryCode
        };
    });
}

function generateShippingDetailsSnippet() {
    return {
        "@type": "OfferShippingDetails",
        shippingRate: {
            "@type": "MonetaryAmount",
            value: "0",
            currency: "USD"
        },
        shippingDestination: generateShippingDestinations(countryCodes),
        deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 0,
                unitCode: "DAY"
            },
            transitTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 0,
                unitCode: "DAY"
            }
        }
    };
}

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

    const imagePathJpg = `data/products/thumbnails/web/jpg/${productId}`;
    const productThumbnailSrc = require(`../${imagePathJpg}_540.jpg`);

    const snippet = {
        "@context": "http://schema.org",
        "@type": "Product",
        "@id": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
        url: `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
        description: formatContentAsString(product.content[selectedLanguageKey]),
        brand: {
            "@type": "Brand",
            name: "Dehli Musikk"
        },
        productionDate: productDate,
        releaseDate: productDate,
        name: product.title,
        image: {
            "@type": "ImageObject",
            url: `https://www.dehlimusikk.no${productThumbnailSrc}`,
            contentUrl: `https://www.dehlimusikk.no${productThumbnailSrc}`,
            license: "https://creativecommons.org/licenses/by/4.0/legalcode",
            acquireLicensePage: "https://www.dehlimusikk.no/#contact",
            caption: product.title,
            description: product.thumbnailDescription,
            uploadDate: productDate,
            copyrightNotice: "Benjamin Dehli",
            creditText: "Dehli Musikk",
            creator: {
                "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli"
            },
            contentLocation: {
                name: "Dehli Musikk",
                address: {
                    "@type": "PostalAddress",
                    addressLocality: "Bø i Telemark",
                    postalCode: "3804",
                    streetAddress: "Margretes veg 15",
                    addressCountry: {
                        name: "NO"
                    }
                }
            }
        },
        offers: {
            "@type": "Offer",
            price: product.price?.length ? product.price : 0,
            priceCurrency: product.priceCurrency?.length ? product.priceCurrency : "USD",
            url: product.link.url,
            availability: "http://schema.org/OnlineOnly",
            validFrom: productDate,
            priceValidUntil: plusOneYear,
            doesNotShip: true,
            offers: [
                {
                    "@type": "Offer",
                    url: product.link.url
                }
            ],
            shippingDetails: generateShippingDetailsSnippet(),
            hasMerchantReturnPolicy: generateHasMerchantReturnPolicySnippet()
        },
        mainEntityOfPage: {
            "@type": "WebPage",
            "@id": "https://www.dehlimusikk.no"
        },
        sameAs: product.sameAs?.length && product.sameAs
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
        "@context": "http://schema.org",
        "@type": "SoftwareApplication",
        "@id": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
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
            availability: "http://schema.org/OnlineOnly",
            validFrom: productDate,
            priceValidUntil: plusOneYear,
            doesNotShip: true,
            offers: [
                {
                    "@type": "Offer",
                    url: product.link.url
                }
            ],
            shippingDetails: generateShippingDetailsSnippet(),
            hasMerchantReturnPolicy: generateHasMerchantReturnPolicySnippet(),
            sameAs: product.sameAs?.length && product.sameAs
        }
    };
    return applicationJsonLd;
}
