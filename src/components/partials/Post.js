// Dependencies
import React from 'react';
import Link from 'next/link';

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


const Post = ({ post, fullscreen = false, lang, languageSlug }) => {

  const renderPostSnippet = (post, postId, postThumbnailSrc) => {
    const postDate = new Date(post.timestamp).toISOString();
    const snippet = {
      "@context": "http://schema.org",
      "@type": "NewsArticle",
      "@id": `https://www.dehlimusikk.no/posts/${postId}/`,
      "url": `https://www.dehlimusikk.no/${languageSlug}posts/${postId}/`,
      "author": {
        "@id": "https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f"
      },
      "publisher": {
        "@id": "https://www.dehlimusikk.no/",
      },
      "headline": post.title[lang],
      "inLanguage": lang,
      "articleBody": post.content[lang]
        ? formatContentAsString(post.content[lang])
        : '',
      "dateCreated": postDate,
      "dateModified": postDate,
      "datePublished": postDate,
      "name": post.title[lang],
      "image": {
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${postThumbnailSrc}`,
        "contentUrl": `https://www.dehlimusikk.no${postThumbnailSrc}`,
        "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "caption": post.title[lang],
        "description": post.thumbnailDescription,
        "uploadDate": postDate,
        "copyrightNotice": "Benjamin Dehli",
        "creditText": "Dehli Musikk",
        "creator": {
          "@id": "https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f"
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
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(snippet) }}
      />
    );
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
      ? (<Link href={`/${languageSlug}${link.url[lang]}`} title={link.text[lang]}>
        <Button buttontype='minimal'>
          {link.text[lang]}
        </Button>
      </Link>)
      : (<a href={link.url} target="_blank" rel="noopener noreferrer" title={link.text[lang]}>
        <Button buttontype='minimal'>
          {link.text[lang]}
        </Button>
      </a>);
  }

  const image = {
    avif55: `/data/posts/web/avif/${post.thumbnailFilename}_55.avif`,
    avif350: `/data/posts/web/avif/${post.thumbnailFilename}_350.avif`,
    avif540: `/data/posts/web/avif/${post.thumbnailFilename}_540.avif`,
    webp55: `/data/posts/web/webp/${post.thumbnailFilename}_55.webp`,
    webp350: `/data/posts/web/webp/${post.thumbnailFilename}_350.webp`,
    webp540: `/data/posts/web/webp/${post.thumbnailFilename}_540.webp`,
    jpg55: `/data/posts/web/jpg/${post.thumbnailFilename}_55.jpg`,
    jpg350: `/data/posts/web/jpg/${post.thumbnailFilename}_350.jpg`,
    jpg540: `/data/posts/web/jpg/${post.thumbnailFilename}_540.jpg`
  };
  const postDate = new Date(post.timestamp);
  const postId = convertToUrlFriendlyString(post.title[lang]);
  const postPath = `/${languageSlug}posts/${postId}/`;

  const link = {
    to: postPath,
    title: post.title[lang]
  };

  return post && post.content && post.content[lang]
    ? (<React.Fragment>
      {fullscreen ? renderPostSnippet(post, postId, image.jpg540) : ''}
      <ListItemThumbnail fullscreen={fullscreen} link={link}>
        {renderPostThumbnail(image, post.thumbnailDescription, fullscreen)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          {
            fullscreen ? <h1>{post.title[lang]}</h1> : <h2>{post.title[lang]}</h2>
          }
          <time dateTime={postDate.toISOString()}>{getPrettyDate(postDate, lang)}</time>
        </ListItemContentHeader>
        <ListItemContentBody fullscreen={fullscreen}>
          {
            formatContentWithReactLinks(post.content[lang], languageSlug)
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
