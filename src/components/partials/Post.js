// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

// Actions
import {getLanguageSlug} from '../../actions/LanguageActions';

// Helpers
import {getPrettyDate} from '../../helpers/dateFormatter';

// Components
import Button from './Button';

// Stylesheets
import style from './Post.module.scss';

class NavigationBar extends Component {

  renderPostSnippet(post, postThumbnailSrc) {
    const postDate = new Date(post.timestamp).toISOString();
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const snippet = {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "@id": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}posts/${post.id}`,
      "url": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}posts/${post.id}`,
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
      "headline": post.title[selectedLanguageKey],
      "inLanguage": this.props.selectedLanguageKey,
      "articleBody": post.content[selectedLanguageKey]
        ? post.content[selectedLanguageKey].replace("\n", " ")
        : '',
      "dateCreated": postDate,
      "dateModified": postDate,
      "datePublished": postDate,
      "name": post.title[selectedLanguageKey],
      "image": {
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${postThumbnailSrc}`,
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
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  renderPostThumbnail(image, altText, fullscreen) {
    return (<picture>
      <source sizes={fullscreen ? '540px' : '175px'} srcSet={`${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp"/>
      <source sizes={fullscreen ? '540px' : '175px'} srcSet={`${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg"/>
      <img src={image.jpg350} alt={altText}/>
    </picture>);
  }

  renderLink(link) {
    return (<div className={style.buttons}>
      <a href={link.url} target="_blank" rel="noopener noreferrer">
        <Button buttontype='minimal'>
          {link.text[this.props.selectedLanguageKey]}
        </Button>
      </a>
    </div>);
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const post = this.props.post;
    const imagePathWebp = `data/posts/thumbnails/web/webp/${post.thumbnailFilename}`;
    const imagePathJpg = `data/posts/thumbnails/web/jpg/${post.thumbnailFilename}`;
    const image = {
      webp350: require(`../../${imagePathWebp}_350.webp`),
      webp540: require(`../../${imagePathWebp}_540.webp`),
      jpg350: require(`../../${imagePathJpg}_350.jpg`),
      jpg540: require(`../../${imagePathJpg}_540.jpg`)
    };
    const postDate = new Date(post.timestamp);
    return post && post.content && post.content[selectedLanguageKey]
      ? (<article className={`${style.gridItem} ${post.link ? style.hasButtons: ''} ${this.props.fullscreen ? style.fullscreen : ''}`}>
        {this.renderPostSnippet(post, image.webp540)}
        <figure className={style.thumbnail}>
          {this.renderPostThumbnail(image, post.thumbnailDescription, this.props.fullscreen)}
        </figure>
        <div className={style.contentContainer}>
          <div className={style.content}>
            <div className={style.header}>
              <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/${post.id}`}><h2>{post.title[selectedLanguageKey]}</h2></Link>
              <time dateTime={postDate.toISOString()}>
                {getPrettyDate(postDate, selectedLanguageKey)}
              </time>
            </div>
            <div className={style.body}>
              {
                post.content[selectedLanguageKey].split('\n').map((paragraph, key) => {
                  return (<p key={key}>{paragraph}</p>)
                })
              }

            </div>
          </div>
          {
            post.link
              ? this.renderLink(post.link)
              : ''
          }
        </div>
      </article>)
      : '';
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
