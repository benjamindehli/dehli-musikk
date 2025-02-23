// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

// Components
import Button from 'components/partials/Button';
import ListItemActionButtons from 'components/template/List/ListItem/ListItemActionButtons';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { getPrettyDate } from 'helpers/dateFormatter';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';
import countryCodes from 'data/countryCodes';
import { convertStringToExcerpt } from 'helpers/search';


const Product = ({ product, fullscreen }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));


  const renderProductSnippet = (product, productId, productThumbnailSrc) => {
    const productDate = new Date(product.timestamp).toISOString();
    const plusOneYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    const generateShippingDestinations = (countryCodes) => {
      return countryCodes.map((countryCode) => {
        return {
          "@type": "DefinedRegion",
          "addressCountry": countryCode
        }
      });
    }

    const shippingDetailsSnippet = {
      "@type": "OfferShippingDetails",
      "shippingRate": {
        "@type": "MonetaryAmount",
        "value": "0",
        "currency": "USD"
      },
      "shippingDestination": generateShippingDestinations(countryCodes),
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 0,
          "unitCode": "DAY"
        },
        "transitTime": {
          "@type": "QuantitativeValue",
          "minValue": 0,
          "maxValue": 0,
          "unitCode": "DAY"
        }
      }
    };

    const hasMerchantReturnPolicySnippet = {
      "@type": "MerchantReturnPolicy",
      "applicableCountry": countryCodes,
      "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted"
    };

    const applicationJsonLd = {
      "@context": "http://schema.org",
      "@type": "SoftwareApplication",
      "@id": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
      "url": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
      "name": product.title,
      "operatingSystem": "All",
      "applicationCategory": ["EntertainmentApplication", "MultimediaApplication"],
      "softwareRequirements": "DecentSampler",
      "offers": {
        "@type": "Offer",
        "price": product.price?.length ? product.price : 0,
        "priceCurrency": product.priceCurrency?.length ? product.priceCurrency : 'USD',
        "url": product.link.url,
        "availability": "http://schema.org/OnlineOnly",
        "validFrom": productDate,
        "priceValidUntil": plusOneYear,
        "doesNotShip": true,
        "offers": [
          {
            "@type": "Offer",
            "url": product.link.url
          },
        ],
        "shippingDetails": shippingDetailsSnippet,
        "hasMerchantReturnPolicy": hasMerchantReturnPolicySnippet,
        "sameAs": product.sameAs?.length && product.sameAs
      },
    }
    const snippet = {
      "@context": "http://schema.org",
      "@type": "Product",
      "@id": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
      "url": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
      "description": formatContentAsString(product.content[selectedLanguageKey]),
      "brand": {
        "@type": "Brand",
        "name": "Dehli Musikk"
      },
      "productionDate": productDate,
      "releaseDate": productDate,
      "name": product.title,
      "image": {
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${productThumbnailSrc}`,
        "contentUrl": `https://www.dehlimusikk.no${productThumbnailSrc}`,
        "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "acquireLicensePage": "https://www.dehlimusikk.no/#contact",
        "caption": product.title,
        "description": product.thumbnailDescription,
        "uploadDate": productDate,
        "copyrightNotice": "Benjamin Dehli",
        "creditText": "Dehli Musikk",
        "creator": {
          "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli"
        },
        "contentLocation": {
          "name": "Dehli Musikk",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15",
            "addressCountry": {
              "name": "NO"
            }
          }
        }
      },
      "offers": {
        "@type": "Offer",
        "price": product.price?.length ? product.price : 0,
        "priceCurrency": product.priceCurrency?.length ? product.priceCurrency : 'USD',
        "url": product.link.url,
        "availability": "http://schema.org/OnlineOnly",
        "validFrom": productDate,
        "priceValidUntil": plusOneYear,
        "doesNotShip": true,
        "offers": [
          {
            "@type": "Offer",
            "url": product.link.url
          },
        ],
        "shippingDetails": shippingDetailsSnippet,
        "hasMerchantReturnPolicy": hasMerchantReturnPolicySnippet,
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.dehlimusikk.no"
      },
      "sameAs": product.sameAs?.length && product.sameAs
    }
    if (product?.ratingValue && product?.reviewCount) {
      snippet.aggregateRating = {
        "@type": "AggregateRating",
        "ratingValue": product.ratingValue,
        "reviewCount": product.reviewCount
      }
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
      <script type="application/ld+json">{`${JSON.stringify(applicationJsonLd)}`}</script>
    </Helmet>)
  }

  const renderProductThumbnail = (image, altText, fullscreen) => {
    const imageSize = fullscreen
      ? '540px'
      : '350px';

    const srcSets = {
      avif: `${image.avif55} 55w, ${image.avif350} 350w ${fullscreen ? `, ${image.avif540} 540w` : ""}`,
      webp: `${image.webp55} 55w, ${image.webp350} 350w ${fullscreen ? `, ${image.webp540} 540w` : ""}`,
      jpg: `${image.jpg55} 55w, ${image.jpg350} 350w ${fullscreen ? `, ${image.jpg540} 540w` : ""}`
    };
    
    return (<React.Fragment>
      <source sizes={imageSize} srcSet={srcSets.avif} type="image/avif" />
      <source sizes={imageSize} srcSet={srcSets.webp} type="image/webp" />
      <source sizes={imageSize} srcSet={srcSets.jpg} type="image/jpg" />
      <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} />
    </React.Fragment>);
  }

  const renderShopLink = (link) => {
    return (<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[selectedLanguageKey]}>
      <Button buttontype='minimal'>
        {link.text[selectedLanguageKey]}
      </Button>
    </a>);
  }


  const productId = convertToUrlFriendlyString(product.title);
  const imagePathAvif = `data/products/thumbnails/web/avif/${productId}`;
  const imagePathWebp = `data/products/thumbnails/web/webp/${productId}`;
  const imagePathJpg = `data/products/thumbnails/web/jpg/${productId}`;
  const image = {
    avif55: require(`../../${imagePathAvif}_55.avif`),
    avif350: require(`../../${imagePathAvif}_350.avif`),
    avif540: require(`../../${imagePathAvif}_540.avif`),
    webp55: require(`../../${imagePathWebp}_55.webp`),
    webp350: require(`../../${imagePathWebp}_350.webp`),
    webp540: require(`../../${imagePathWebp}_540.webp`),
    jpg55: require(`../../${imagePathJpg}_55.jpg`),
    jpg350: require(`../../${imagePathJpg}_350.jpg`),
    jpg540: require(`../../${imagePathJpg}_540.jpg`)
  };
  const productDate = new Date(product.timestamp);
  const productPath = `/${languageSlug}products/${productId}/`;
  const productDescription = fullscreen ? formatContentWithReactLinks(product.content[selectedLanguageKey], languageSlug) : <p>{convertStringToExcerpt(product.content[selectedLanguageKey])}</p>;

  const link = {
    to: productPath,
    title: product.title
  };

  return product && product.content && product.content[selectedLanguageKey]
    ? (<React.Fragment>
      {fullscreen ? renderProductSnippet(product, productId, image.jpg540) : ''}
      <ListItemThumbnail fullscreen={fullscreen} link={link}>
        {renderProductThumbnail(image, product.thumbnailDescription, fullscreen)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          <h2>{product.title}</h2>
          <time dateTime={productDate.toISOString()}>
            {getPrettyDate(productDate, selectedLanguageKey)}
          </time>
        </ListItemContentHeader>
        <ListItemContentBody fullscreen={fullscreen}>
          {productDescription}
        </ListItemContentBody>
        {
          product.link && fullscreen
            ? (
              <ListItemActionButtons fullscreen={fullscreen}>
                {renderShopLink(product.link)}
              </ListItemActionButtons>
            )
            : ''
        }

      </ListItemContent>
    </React.Fragment>)
    : '';

}

export default Product;
