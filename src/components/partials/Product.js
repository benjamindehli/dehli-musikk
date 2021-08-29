// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

// Actions
import { getLanguageSlug } from 'actions/LanguageActions';

// Helpers
import { getPrettyDate } from 'helpers/dateFormatter';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Components
import Button from 'components/partials/Button';
import ListItemActionButtons from 'components/template/List/ListItem/ListItemActionButtons';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';


class Product extends Component {

  renderProductSnippet(product, productId, productThumbnailSrc) {
    const productDate = new Date(product.timestamp).toISOString();
    const plusOneYear = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const snippet = {
      "@context": "http://schema.org",
      "@type": "Product",
      "@id": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}products/${productId}/`,
      "url": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}products/${productId}/`,
      "description": product.content[selectedLanguageKey],
      "brand": {
        "@context": "http://schema.org",
        "@type": "Organization",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bø i Telemark",
          "postalCode": "3804",
          "streetAddress": "Margretes veg 15",
          "addressCountry": {
            "name": "NO"
          }
        },
        "hasPos": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15",
            "addressCountry": {
              "name": "NO"
            }
          },
          "hasMap": "https://www.google.com/maps?cid=13331960642102658320"
        },
        "location": {
          "@type": "PostalAddress",
          "addressLocality": "Bø i Telemark, Norway",
          "postalCode": "3804",
          "streetAddress": "Margretes veg 15"
        },
        "foundingDate": "	2019-10-01",
        "foundingLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15",
            "addressCountry": {
              "name": "NO"
            }
          },
          "hasMap": "https://www.google.com/maps?cid=13331960642102658320"
        },
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.dehlimusikk.no/DehliMusikkLogo.png",
          "contentUrl": "https://www.dehlimusikk.no/DehliMusikkLogo.png",
          "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
          "acquireLicensePage": "https://www.dehlimusikk.no/#contact"
        },
        "image": {
          "@type": "ImageObject",
          "url": "https://www.dehlimusikk.no/DehliMusikkLogo.png",
          "contentUrl": "https://www.dehlimusikk.no/DehliMusikkLogo.png",
          "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
          "acquireLicensePage": "https://www.dehlimusikk.no/#contact"
        },
        "email": "superelg(at)gmail.org",
        "founder": {
          "@type": "Person",
          "name": "Benjamin Dehli",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15",
            "addressCountry": {
              "name": "NO"
            }
          }
        },
        "name": "Dehli Musikk",
        "telephone": "+47 92 29 27 19",
        "url": "https://www.dehlimusikk.no"
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

  renderProductThumbnail(image, altText, fullscreen) {
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

  renderShopLink(link) {
    return (<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[this.props.selectedLanguageKey]}>
      <Button tabIndex="-1" buttontype='minimal'>
        {link.text[this.props.selectedLanguageKey]}
      </Button>
    </a>);
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const product = this.props.product;
    const productId = convertToUrlFriendlyString(product.title);
    const imagePathAvif = `data/products/thumbnails/web/avif/${productId}`;
    const imagePathWebp = `data/products/thumbnails/web/webp/${productId}`;
    const imagePathJpg = `data/products/thumbnails/web/jpg/${productId}`;
    const image = {
      avif55: require(`../../${imagePathAvif}_55.avif`).default,
      avif350: require(`../../${imagePathAvif}_350.avif`).default,
      avif540: require(`../../${imagePathAvif}_540.avif`).default,
      webp55: require(`../../${imagePathWebp}_55.webp`).default,
      webp350: require(`../../${imagePathWebp}_350.webp`).default,
      webp540: require(`../../${imagePathWebp}_540.webp`).default,
      jpg55: require(`../../${imagePathJpg}_55.jpg`).default,
      jpg350: require(`../../${imagePathJpg}_350.jpg`).default,
      jpg540: require(`../../${imagePathJpg}_540.jpg`).default
    };
    const productDate = new Date(product.timestamp);
    const productPath = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${productId}/`;

    const link = {
      to: productPath,
      title: product.title
    };

    return product && product.content && product.content[selectedLanguageKey]
      ? (<React.Fragment>
        {this.props.fullscreen ? this.renderProductSnippet(product, productId, image.jpg540) : ''}
        <ListItemThumbnail fullscreen={this.props.fullscreen} link={link}>
          {this.renderProductThumbnail(image, product.thumbnailDescription, this.props.fullscreen)}
        </ListItemThumbnail>
        <ListItemContent fullscreen={this.props.fullscreen}>
          <ListItemContentHeader fullscreen={this.props.fullscreen} link={link}>
            <h2>{product.title}</h2>
            <time dateTime={productDate.toISOString()}>
              {getPrettyDate(productDate, selectedLanguageKey)}
            </time>
          </ListItemContentHeader>
          <ListItemContentBody fullscreen={this.props.fullscreen}>
            {
              product.content[selectedLanguageKey].split('\n').map((paragraph, key) => {
                return (<p key={key}>{paragraph}</p>)
              })
            }
          </ListItemContentBody>
          {
            product.link && this.props.fullscreen
              ? (
                <ListItemActionButtons fullscreen={this.props.fullscreen}>
                  {this.renderShopLink(product.link)}
                </ListItemActionButtons>
              )
              : ''
          }

        </ListItemContent>
      </React.Fragment>)
      : '';
  }
}

const mapStateToProps = state => ({ selectedLanguageKey: state.selectedLanguageKey });

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Product);
