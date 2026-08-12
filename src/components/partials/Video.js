// Dependencies
import JsonLd from 'components/JsonLd';
import React from 'react';
import Link from 'next/link';

// Helpers
import { getPrettyDate } from 'helpers/dateFormatter';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'
import { convertStringToExcerpt } from 'helpers/search';
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';

// Components
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemVideo from 'components/template/List/ListItem/ListItemVideo';

// Stylesheets
import style from "components/partials/Video.module.scss";
import Button from './Button';

const Video = ({ video, fullscreen = false, compact = false, priority = false, isTheaterMode = false, startOffset = null, lang, languageSlug }) => {

  const renderVideoSnippet = (video, videoId, videoThumbnailSrc) => {
    const videoDate = new Date(video.timestamp).toISOString();
    const snippet = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "@id": `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/video/`,
      "name": video.title[lang],
      "description": video.content[lang]
        ? formatContentAsString(video.content[lang])
        : '',
      "duration": video.duration,
      "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/video/`,
      "embedUrl": `https://www.youtube.com/embed/${video.youTubeId}`,
      "thumbnailUrl": `https://www.dehlimusikk.no${videoThumbnailSrc}`,
      "thumbnail": {
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${videoThumbnailSrc}`,
        "contentUrl": `https://www.dehlimusikk.no${videoThumbnailSrc}`
      },
      "datePublished": videoDate,
      "uploadDate": videoDate
    };
    if (video.copyright) {
      snippet.thumbnail.license = "https://creativecommons.org/licenses/by/4.0/legalcode";
      snippet.thumbnail.acquireLicensePage = "https://www.dehlimusikk.no/#contact";
      snippet.thumbnail.copyrightNotice = "Benjamin Dehli";
      snippet.thumbnail.creditText = "Dehli Musikk";
      snippet.thumbnail.creator = {
        "@type": "Person",
        "name": "Benjamin Dehli"
      }
    }
    if (video.clips) {
      snippet.hasPart = video.clips.map(clip => {
        return {
          "@type": "Clip",
          "name": clip.name[lang],
          "startOffset": clip.startOffset,
          "endOffset": clip.endOffset,
          "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/video/?t=${clip.startOffset}`
        }
      })
    }
    return (
      <JsonLd data={snippet} />
    );
  }

  // The first card on a list page is usually the LCP element, so it loads eagerly
  // with a priority hint rather than being lazy like the cards below the fold.
  const loadingAttributes = priority ? { fetchPriority: 'high' } : { loading: 'lazy' };

  const renderVideoThumbnail = (image, altText, compact) => {
    if (compact) {
      return (<React.Fragment>
        <source srcSet={`${image.avif55} 1x, ${image.avif110} 2x`} type="image/avif" />
        <source srcSet={`${image.webp55} 1x, ${image.webp110} 2x`} type="image/webp" />
        <source srcSet={`${image.jpg55} 1x, ${image.jpg110} 2x`} type="image/jpeg" />
        <img {...loadingAttributes} src={image.jpg55} data-width="55" data-height="55" alt={altText} />
      </React.Fragment>);
    }
    return (<React.Fragment>
        <source srcSet={`${image.avif55} 1x, ${image.avif110} 2x`} type="image/avif" media='(max-width: 599px)' />
        <source srcSet={`${image.webp55} 1x, ${image.webp110} 2x`} type="image/webp" media='(max-width: 599px)' />
        <source srcSet={`${image.jpg55} 1x, ${image.jpg110} 2x`} type="image/jpeg" media='(max-width: 599px)' />
        <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" />
        <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" />
        <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" />
        <img {...loadingAttributes} src={image.jpg350} data-width="350" data-height="197" alt={altText} />
    </React.Fragment>);
  }

  const image = {
    avif55: `/data/videos/web/avif/${video.thumbnailFilename}_55.avif`,
    avif110: `/data/videos/web/avif/${video.thumbnailFilename}_110.avif`,
    avif350: `/data/videos/web/avif/${video.thumbnailFilename}_350.avif`,
    avif540: `/data/videos/web/avif/${video.thumbnailFilename}_540.avif`,
    webp55: `/data/videos/web/webp/${video.thumbnailFilename}_55.webp`,
    webp110: `/data/videos/web/webp/${video.thumbnailFilename}_110.webp`,
    webp350: `/data/videos/web/webp/${video.thumbnailFilename}_350.webp`,
    webp540: `/data/videos/web/webp/${video.thumbnailFilename}_540.webp`,
    jpg55: `/data/videos/web/jpg/${video.thumbnailFilename}_55.jpg`,
    jpg110: `/data/videos/web/jpg/${video.thumbnailFilename}_110.jpg`,
    jpg350: `/data/videos/web/jpg/${video.thumbnailFilename}_350.jpg`,
    jpg540: `/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`
  };
  const videoDate = new Date(video.timestamp);
  const videoId = convertToUrlFriendlyString(video.title[lang]);
  const videoPath = `/${languageSlug}videos/${videoId}/`;
  const videoContentString = video?.content?.[lang] || '';
  const videoDescription = fullscreen ? formatContentWithReactLinks(videoContentString, languageSlug) : <p>{convertStringToExcerpt(videoContentString)}</p>;

  const link = {
    to: videoPath,
    title: video.title[lang]
  };

  let theaterModeToPath;
  if (isTheaterMode) {
    theaterModeToPath = videoPath;
    if (startOffset) {
      theaterModeToPath += `?t=${startOffset}`;
    }
  } else {
    theaterModeToPath = `${videoPath}video/`;
    if (startOffset) {
      theaterModeToPath += `?t=${startOffset}`;
    }
  }

  const theaterModeLabel = isTheaterMode
    ? lang === "en"
      ? "Reduce"
      : "Forminsk"
    : lang === "en"
      ? "Enlarge"
      : "Forstørr";

  const theaterModeLink = {
    to: theaterModeToPath,
    label: theaterModeLabel,
    // The accessible name leads with the visible label so speech input users can
    // activate the link by saying what they see, then names the video for anyone
    // hearing the link out of context (WCAG 2.5.3 Label in Name).
    ariaLabel: `${theaterModeLabel} - ${video.title[lang]}`
  };

  return video && video.content && video.content[lang]
    ? (<React.Fragment>
      {
        fullscreen
          ? (
            <React.Fragment>
              {renderVideoSnippet(video, videoId, image.jpg540)}
              <ListItemVideo youTubeId={video.youTubeId} videoTitle={video.title[lang]} startOffset={startOffset} image={image} lang={lang} />
            </React.Fragment>
          ) : (
            <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
              {renderVideoThumbnail(image, video.thumbnailDescription, compact)}
            </ListItemThumbnail>
          )
      }
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          {fullscreen ? (
            <div className={style.theaterModeHeader}>
            {
              fullscreen ? <h1>{video.title[lang]}<span>{video.youTubeUser}</span></h1> : <h2>{video.title[lang]}<span>{video.youTubeUser}</span></h2>
            }
              <Link href={theaterModeLink.to} aria-label={theaterModeLink.ariaLabel}>
                <Button buttontype="minimal">
                  <span className={style.label}>{theaterModeLink.label}</span>
                  {isTheaterMode ? <img src="/images/minimize.svg" className={style.icon} alt="" aria-hidden="true" /> : <img src="/images/maximize.svg" className={style.icon} alt="" aria-hidden="true" />}
                </Button>
              </Link>
          </div>
          ) : (
            <h2>
              {video.title[lang]}
              <span>{video.youTubeUser}</span>
            </h2>
          )}
          {!compact && (
            <time dateTime={videoDate.toISOString()}>{getPrettyDate(videoDate, lang)}</time>
          )}
        </ListItemContentHeader>
        {!compact && (
          <ListItemContentBody fullscreen={fullscreen}>
            {
              videoDescription
            }
          </ListItemContentBody>
        )}
      </ListItemContent>
    </React.Fragment>)
    : '';
}

export default Video;
