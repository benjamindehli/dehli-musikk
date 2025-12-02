// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

// Selectors
import { getLanguageSlug } from '../../reducers/AvailableLanguagesReducer';

// Helpers
import { getPrettyDate } from '../../helpers/dateFormatter';
import { convertToUrlFriendlyString } from '../../helpers/urlFormatter'
import { formatContentAsString, formatContentWithReactLinks } from '../../helpers/contentFormatter';

// Components
import Button from './Button';
import ListItemActionButtons from '../template/List/ListItem/ListItemActionButtons';
import ListItemContent from '../template/List/ListItem/ListItemContent';
import ListItemContentBody from '../template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from '../template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from '../template/List/ListItem/ListItemThumbnail';


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
    if (fullscreen){
      return (<React.Fragment>
        <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" media='(max-width: 407px)' />
        <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" media='(max-width: 407px)' />
        <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" media='(max-width: 407px)' />
        <source srcSet={`${image.avif540} 1x, ${image.avif540} 2x`} type="image/avif" />
        <source srcSet={`${image.webp540} 1x, ${image.webp540} 2x`} type="image/webp" />
        <source srcSet={`${image.jpg540} 1x, ${image.jpg540} 2x`} type="image/jpg" />
        <img fetchpriority="high" src={image.jpg540} data-width="540" data-height="400" alt={altText} />
      </React.Fragment>);
    } else {
      return (<React.Fragment>
        <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" media='(max-width: 599px)' />
        <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" media='(max-width: 599px)' />
        <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" media='(max-width: 599px)' />
        <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" />
        <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" />
        <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" />
        <img loading="lazy" src={image.jpg350} data-width="350" data-height="260" alt={altText} />
      </React.Fragment>);
    }
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
    avif55: require(`../../${imagePathAvif}_55.avif`)?.default,
    avif350: require(`../../${imagePathAvif}_350.avif`)?.default,
    avif540: require(`../../${imagePathAvif}_540.avif`)?.default,
    webp55: require(`../../${imagePathWebp}_55.webp`)?.default,
    webp350: require(`../../${imagePathWebp}_350.webp`)?.default,
    webp540: require(`../../${imagePathWebp}_540.webp`)?.default,
    jpg55: require(`../../${imagePathJpg}_55.jpg`)?.default,
    jpg350: require(`../../${imagePathJpg}_350.jpg`)?.default,
    jpg540: require(`../../${imagePathJpg}_540.jpg`)?.default
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
          ? <Helmet>
              <link rel="preload" as="image" href={image.avif350} fetchpriority="high" type="image/avif" media='(max-width: 407px)'/>
              <link rel="preload" as="image" href={image.avif540} fetchpriority="high" type="image/avif" media='(min-width: 408px)'/>
            </Helmet>
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
