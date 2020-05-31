// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Helpers
import {getPrettyDate} from 'helpers/dateFormatter';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Components
import Button from 'components/partials/Button';

// Template
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemActionButtons from 'components/template/List/ListItem/ListItemActionButtons';


class Product extends Component {

  renderProductSnippet(product, productId, productThumbnailSrc) {
    const productDate = new Date(product.timestamp).toISOString();
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
          "url": "https://www.dehlimusikk.no/DehliMusikkLogo.png"
        },
        "image": {
          "@type": "ImageObject",
          "url": "https://www.dehlimusikk.no/DehliMusikkLogo.png"
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
        "validFrom" : productDate,
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

  renderProductThumbnail(image, altText, fullscreen, productDate) {
    const copyrightString = `cc-by ${productDate.getFullYear()} Benjamin Dehli dehlimusikk.no`;
    const imageSize = fullscreen
      ? '540px'
      : '350px';
    return (<React.Fragment>
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp"/>
      <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg"/>
      <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} copyright={copyrightString} />
    </React.Fragment>);
  }

  renderShopLink(link) {
    return (<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[this.props.selectedLanguageKey]}>
        <Button buttontype='minimal'>
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

    const imagePathWebp = `data/products/thumbnails/web/webp/${productId}`;
    const imagePathJpg = `data/products/thumbnails/web/jpg/${productId}`;
    const image = {
      webp55: require(`../../${imagePathWebp}_55.webp`),
      webp350: require(`../../${imagePathWebp}_350.webp`),
      webp540: require(`../../${imagePathWebp}_540.webp`),
      jpg55: require(`../../${imagePathJpg}_55.jpg`),
      jpg350: require(`../../${imagePathJpg}_350.jpg`),
      jpg540: require(`../../${imagePathJpg}_540.jpg`)
    };
    const productDate = new Date(product.timestamp);
    const productPath = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}products/${productId}/`;

    const link = {
      to: productPath,
      title: product.title
    };

    return product && product.content && product.content[selectedLanguageKey]
      ? (<React.Fragment>
        {this.renderProductSnippet(product, productId, image.jpg540)}
        <ListItemThumbnail fullscreen={this.props.fullscreen} link={link}>
          {this.renderProductThumbnail(image, product.thumbnailDescription, this.props.fullscreen, productDate)}
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
            <ListItemActionButtons fullscreen={this.props.fullscreen}>
            {
              product.link && this.props.fullscreen
                ? this.renderShopLink(product.link)
                : ''
            }
          </ListItemActionButtons>
        </ListItemContent>
      </React.Fragment>)
      : '';
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Product);
