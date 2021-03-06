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
import ListItemActionButtons from 'components/template/List/ListItem/ListItemActionButtons';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';


class Post extends Component {

  renderPostSnippet(post, postId, postThumbnailSrc) {
    const postDate = new Date(post.timestamp).toISOString();
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const snippet = {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "@id": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}posts/${postId}/`,
      "url": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}posts/${postId}/`,
      "author": {
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
      "publisher": {
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
      "headline": post.title[selectedLanguageKey],
      "inLanguage": this.props.selectedLanguageKey,
      "articleBody": post.content[selectedLanguageKey]
        ? post.content[selectedLanguageKey].replace(/\n/g, " ")
        : '',
      "dateCreated": postDate,
      "dateModified": postDate,
      "datePublished": postDate,
      "name": post.title[selectedLanguageKey],
      "image": {
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${postThumbnailSrc}`,
        "contentUrl": `https://www.dehlimusikk.no${postThumbnailSrc}`,
        "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "caption": post.title[selectedLanguageKey],
        "description": post.thumbnailDescription,
        "uploadDate": postDate,
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
      "thumbnailUrl": `https://www.dehlimusikk.no${postThumbnailSrc}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.dehlimusikk.no"
      }
    }
    if (post.copyright){
      snippet.image.license = "https://creativecommons.org/licenses/by/4.0/legalcode";
      snippet.image.acquireLicensePage = "https://www.dehlimusikk.no/#contact";
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  renderPostThumbnail(image, altText, fullscreen, postPath, postTitle, copyright, postDate) {
    const copyrightString = copyright && postDate ? `cc-by ${postDate.getFullYear()} Benjamin Dehli dehlimusikk.no` : null;
    const imageSize = fullscreen
      ? '540px'
      : '350px';
    return (<React.Fragment>
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp"/>
      <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg"/>
      <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} copyright={copyrightString} />
    </React.Fragment>);
  }

  renderLink(link) {
    return link.internal
    ? (<Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}${link.url[this.props.selectedLanguageKey]}`} title={link.text[this.props.selectedLanguageKey]}>
        <Button tabIndex="-1" buttontype='minimal'>
          {link.text[this.props.selectedLanguageKey]}
        </Button>
      </Link>)
    : (<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[this.props.selectedLanguageKey]}>
        <Button tabIndex="-1" buttontype='minimal'>
          {link.text[this.props.selectedLanguageKey]}
        </Button>
      </a>);
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const post = this.props.post;
    const imagePathWebp = `data/posts/thumbnails/web/webp/${post.thumbnailFilename}`;
    const imagePathJpg = `data/posts/thumbnails/web/jpg/${post.thumbnailFilename}`;
    const image = {
      webp55: require(`../../${imagePathWebp}_55.webp`).default,
      webp350: require(`../../${imagePathWebp}_350.webp`).default,
      webp540: require(`../../${imagePathWebp}_540.webp`).default,
      jpg55: require(`../../${imagePathJpg}_55.jpg`).default,
      jpg350: require(`../../${imagePathJpg}_350.jpg`).default,
      jpg540: require(`../../${imagePathJpg}_540.jpg`).default
    };
    const postDate = new Date(post.timestamp);
    const postId = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
    const postPath = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${postId}/`;

    const link = {
      to: postPath,
      title: post.title[selectedLanguageKey]
    };

    return post && post.content && post.content[selectedLanguageKey]
      ? (<React.Fragment>
        {this.props.fullscreen ? this.renderPostSnippet(post, postId, image.jpg540) : ''}
        <ListItemThumbnail fullscreen={this.props.fullscreen} link={link}>
          {this.renderPostThumbnail(image, post.thumbnailDescription, this.props.fullscreen, postPath, post.title[selectedLanguageKey], post.copyright, postDate)}
        </ListItemThumbnail>
        <ListItemContent fullscreen={this.props.fullscreen}>
          <ListItemContentHeader fullscreen={this.props.fullscreen} link={link}>
            <h2>{post.title[selectedLanguageKey]}</h2>
            <time dateTime={postDate.toISOString()}>{getPrettyDate(postDate, selectedLanguageKey)}</time>
          </ListItemContentHeader>
          <ListItemContentBody fullscreen={this.props.fullscreen}>
              {
                post.content[selectedLanguageKey].split('\n').map((paragraph, key) => {
                  return (<p key={key}>{paragraph}</p>)
                })
              }
          </ListItemContentBody>
          <ListItemActionButtons fullscreen={this.props.fullscreen}>
          {
            post.link && this.props.fullscreen
              ? this.renderLink(post.link)
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

export default connect(mapStateToProps, mapDispatchToProps)(Post);
