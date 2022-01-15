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


const Product = ({ product, fullscreen }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));


  const renderProductSnippet = (product, productId, productThumbnailSrc) => {
    const productDate = new Date(product.timestamp).toISOString();
    const plusOneYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();

    const snippet = {
      "@context": "http://schema.org",
      "@type": "Product",
      "@id": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
      "url": `https://www.dehlimusikk.no/${languageSlug}products/${productId}/`,
      "description": product.content[selectedLanguageKey],
      "brand": {
        "@id": "#DehliMusikk"
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
        "price": product.price,
        "priceCurrency": product.priceCurrency,
        "url": product.link.url,
        "availability": "http://schema.org/OnlineOnly",
        "validFrom": productDate,
        "priceValidUntil": plusOneYear
      },
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.dehlimusikk.no"
      }
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  const renderProductThumbnail = (image, altText, fullscreen) => {
    const imageSize = fullscreen
      ? '540px'
      : '350px';
    return (<React.Fragment>
      <source sizes={imageSize} srcSet={`${image.avif55} 55w, ${image.avif350} 350w, ${image.avif540} 540w`} type="image/avif" />
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp" />
      <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg" />
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
          {
            product.content[selectedLanguageKey].split('\n').map((paragraph, key) => {
              return (<p key={key}>{paragraph}</p>)
            })
          }
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
