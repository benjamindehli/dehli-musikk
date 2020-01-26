// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';

// Actions
import {getLanguageSlug} from '../../actions/LanguageActions';

// Stylesheets
import style from './Post.module.scss';

class NavigationBar extends Component {

  renderPostSnippet(post, postThumbnailSrc) {
    const postDate = new Date(post.timestamp).toISOString();
    const snippet = {
      "@context": "http://schema.org",
      "@type": "Article",
      "@id": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}posts/#${post.id}`,
      "author": {
        "@type": "Person",
        "name": "Benjamin Dehli",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bø i Telemark, Norway",
          "postalCode": "3804",
          "streetAddress": "Margretes veg 15"
        }
      },
      "publisher": {
        "@context": "http://schema.org",
        "@type": "Organization",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bø i Telemark, Norway",
          "postalCode": "3804",
          "streetAddress": "Margretes veg 15"
        },
        "hasPos": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark, Norway",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15"
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
            "addressLocality": "Bø i Telemark, Norway",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15"
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
            "addressLocality": "Bø i Telemark, Norway",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15"
          }
        },
        "name": "Dehli Musikk",
        "telephone": "+47 92 29 27 19",
        "url": "https://www.dehlimusikk.no"
      },
      "headline": post.title[this.props.selectedLanguageKey],
      "inLanguage": this.props.selectedLanguageKey,
      "articleBody": post.content[this.props.selectedLanguageKey].replace("\n", " "),
      "dateCreated": postDate,
      "dateModified": postDate,
      "datePublished": postDate,
      "name": post.title[this.props.selectedLanguageKey],
      "image": {
        "@type": "ImageObject",
        "url": postThumbnailSrc
      },
      "thumbnailUrl": postThumbnailSrc,
      "mainEntityOfPage": {
         "@type": "WebPage",
         "@id": "https://www.dehlimusikk.no"
      },
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  renderPostThumbnail(image, altText) {
    return (<picture>
      <source sizes='350px' srcSet={`${image.webp350} 350w`} type="image/webp"/>
      <source sizes='350px' srcSet={`${image.jpg350} 350w`} type="image/jpg"/>
      <img src={image.jpg350} alt={altText}/>
    </picture>);
  }

  render() {
    const post = this.props.post;
    const imagePathWebp = `data/posts/thumbnails/web/webp/${post.thumbnailFilename}`;
    const imagePathJpg = `data/posts/thumbnails/web/jpg/${post.thumbnailFilename}`;
    const image = {
      webp350: require(`../../${imagePathWebp}_350.webp`),
      jpg350: require(`../../${imagePathJpg}_350.jpg`)
    };
    return (<article className={style.gridItem}>
      {this.renderPostSnippet(post, image.jpg350)}
      <figure className={style.thumbnail}>
        {this.renderPostThumbnail(image, post.thumbnailDescription)}
      </figure>
      <div className={style.content}>
        <div className={style.header}>
          <h2>{post.title[this.props.selectedLanguageKey]}</h2>
        </div>
        <div className={style.body}>
          {post.content[this.props.selectedLanguageKey].split('\n').map((paragraph, key) => {
            return (<p key={key}>{paragraph}</p>)
          })}
          <ul>
            <li>{new Date(post.timestamp).getFullYear()}</li>
          </ul>
        </div>
      </div>
    </article>)
  }
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey
});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(NavigationBar);
