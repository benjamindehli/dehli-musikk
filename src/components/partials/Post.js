// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { getPrettyDate } from 'helpers/dateFormatter';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';

// Components
import Button from 'components/partials/Button';
import ListItemActionButtons from 'components/template/List/ListItem/ListItemActionButtons';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';


const Post = ({ post, fullscreen }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  const renderPostSnippet = (post, postId, postThumbnailSrc) => {
    const postDate = new Date(post.timestamp).toISOString();
    const snippet = {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "@id": `https://www.dehlimusikk.no/${languageSlug}posts/${postId}/`,
      "url": `https://www.dehlimusikk.no/${languageSlug}posts/${postId}/`,
      "author": {
        "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli"
      },
      "publisher": {
        "@id": "https://www.dehlimusikk.no/organizations/DehliMusikk",
      },
      "headline": post.title[selectedLanguageKey],
      "inLanguage": selectedLanguageKey,
      "articleBody": post.content[selectedLanguageKey]
        ? formatContentAsString(post.content[selectedLanguageKey])
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
      "thumbnailUrl": `https://www.dehlimusikk.no${postThumbnailSrc}`,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://www.dehlimusikk.no"
      }
    }
    if (post.copyright) {
      snippet.image.license = "https://creativecommons.org/licenses/by/4.0/legalcode";
      snippet.image.acquireLicensePage = "https://www.dehlimusikk.no/#contact";
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  const renderPostThumbnail = (image, altText, fullscreen) => {
    const imageSize = fullscreen
      ? '(max-width: 406px) 350px, 540px'
      : '(max-width: 600px) 55px, 350px';

    const srcSets = {
      avif: `${image.avif55} 55w, ${image.avif350} 350w ${fullscreen ? `, ${image.avif540} 540w` : ""}`,
      webp: `${image.webp55} 55w, ${image.webp350} 350w ${fullscreen ? `, ${image.webp540} 540w` : ""}`,
      jpg: `${image.jpg55} 55w, ${image.jpg350} 350w ${fullscreen ? `, ${image.jpg540} 540w` : ""}`
    };
    
    return (<React.Fragment>
      <source sizes={imageSize} srcSet={srcSets.avif} type="image/avif" />
      <source sizes={imageSize} srcSet={srcSets.webp} type="image/webp" />
      <source sizes={imageSize} srcSet={srcSets.jpg} type="image/jpg" />
      {
        fullscreen 
          ? <img fetchpriority="high" src={image.jpg540} width="540" height="400" alt={altText} />
          : <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} />
      }
    </React.Fragment>);
  }

  const renderLink = (link) => {
    return link.internal
      ? (<Link to={`/${languageSlug}${link.url[selectedLanguageKey]}`} title={link.text[selectedLanguageKey]}>
        <Button buttontype='minimal'>
          {link.text[selectedLanguageKey]}
        </Button>
      </Link>)
      : (<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[selectedLanguageKey]}>
        <Button buttontype='minimal'>
          {link.text[selectedLanguageKey]}
        </Button>
      </a>);
  }


  const imagePathAvif = `data/posts/thumbnails/web/avif/${post.thumbnailFilename}`;
  const imagePathWebp = `data/posts/thumbnails/web/webp/${post.thumbnailFilename}`;
  const imagePathJpg = `data/posts/thumbnails/web/jpg/${post.thumbnailFilename}`;
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
  const postDate = new Date(post.timestamp);
  const postId = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
  const postPath = `/${languageSlug}posts/${postId}/`;

  const link = {
    to: postPath,
    title: post.title[selectedLanguageKey]
  };

  return post && post.content && post.content[selectedLanguageKey]
    ? (<React.Fragment>
      {
        fullscreen 
          ? <Helmet><link rel="preload" as="image" href={image.avif540} fetchpriority="high" type="image/avif"/></Helmet>
          : ""
      }
      {fullscreen ? renderPostSnippet(post, postId, image.jpg540) : ''}
      <ListItemThumbnail fullscreen={fullscreen} link={link}>
        {renderPostThumbnail(image, post.thumbnailDescription, fullscreen)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          {
            fullscreen ? <h1>{post.title[selectedLanguageKey]}</h1> : <h2>{post.title[selectedLanguageKey]}</h2>
          }
          <time dateTime={postDate.toISOString()}>{getPrettyDate(postDate, selectedLanguageKey)}</time>
        </ListItemContentHeader>
        <ListItemContentBody fullscreen={fullscreen}>
          {
            formatContentWithReactLinks(post.content[selectedLanguageKey], languageSlug)
          }
        </ListItemContentBody>
        {
          post.link && fullscreen
            ? (
              <ListItemActionButtons fullscreen={fullscreen}>
                {renderLink(post.link)}
              </ListItemActionButtons>)
            : ''
        }
      </ListItemContent>
    </React.Fragment>)
    : '';
}

export default Post;
