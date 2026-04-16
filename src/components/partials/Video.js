// Dependencies
import React from 'react';
import Link from 'next/link';

// Assets
import { ReactComponent as MaximizeIcon } from "assets/svg/maximize.svg";
import { ReactComponent as MinimizeIcon } from "assets/svg/minimize.svg";

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { getPrettyDate } from 'helpers/dateFormatter';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'
import { convertStringToExcerpt } from 'helpers/search';

// Components
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemVideo from 'components/template/List/ListItem/ListItemVideo';
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';

// Stylesheets
import style from "components/partials/Video.module.scss";
import Button from './Button';

const Video = ({ video, fullscreen, isTheaterMode, startOffset }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  const renderVideoSnippet = (video, videoId, videoThumbnailSrc) => {
    const videoDate = new Date(video.timestamp).toISOString();
    const snippet = {
      "@context": "http://schema.org",
      "@type": "VideoObject",
      "@id": `https://www.dehlimusikk.no/videos/${videoId}/video/`,
      "name": video.title[selectedLanguageKey],
      "description": video.content[selectedLanguageKey]
        ? formatContentAsString(video.content[selectedLanguageKey])
        : '',
      "duration": video.duration,
      "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/video/`,
      "embedURL": `https://www.youtube.com/watch?v=${video.youTubeId}`,
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
          "name": clip.name[selectedLanguageKey],
          "startOffset": clip.startOffset,
          "endOffset": clip.endOffset,
          "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/video/?t=${clip.startOffset}`
        }
      })
    }
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(snippet) }}
      />
    );
  }

  const renderVideoThumbnail = (image, altText) => {
    return (<React.Fragment>
        <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" media='(max-width: 599px)' />
        <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" media='(max-width: 599px)' />
        <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" media='(max-width: 599px)' />
        <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" />
        <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" />
        <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" />
        <img loading="lazy" src={image.jpg350} data-width="350" data-height="197" alt={altText} />
    </React.Fragment>);
  }

  const image = {
    avif55: `/data/videos/web/avif/${video.thumbnailFilename}_55.avif`,
    avif350: `/data/videos/web/avif/${video.thumbnailFilename}_350.avif`,
    avif540: `/data/videos/web/avif/${video.thumbnailFilename}_540.avif`,
    webp55: `/data/videos/web/webp/${video.thumbnailFilename}_55.webp`,
    webp350: `/data/videos/web/webp/${video.thumbnailFilename}_350.webp`,
    webp540: `/data/videos/web/webp/${video.thumbnailFilename}_540.webp`,
    jpg55: `/data/videos/web/jpg/${video.thumbnailFilename}_55.jpg`,
    jpg350: `/data/videos/web/jpg/${video.thumbnailFilename}_350.jpg`,
    jpg540: `/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`
  };
  const videoDate = new Date(video.timestamp);
  const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
  const videoPath = `/${languageSlug}videos/${videoId}/`;
  const videoContentString = video?.content?.[selectedLanguageKey] || '';
  const videoDescription = fullscreen ? formatContentWithReactLinks(videoContentString, languageSlug) : <p>{convertStringToExcerpt(videoContentString)}</p>;

  const link = {
    to: videoPath,
    title: video.title[selectedLanguageKey]
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

  const theaterModeLink = {
    to: theaterModeToPath,
    title: video.title[selectedLanguageKey],
    label: isTheaterMode
            ? selectedLanguageKey === "en"
              ? "Reduce"
              : "Forminsk"
            : selectedLanguageKey === "en"
              ? "Enlarge"
              : "Forstørr"
    
  };

  return video && video.content && video.content[selectedLanguageKey]
    ? (<React.Fragment>
      {
        fullscreen
          ? (
            <React.Fragment>
              {renderVideoSnippet(video, videoId, image.jpg540)}
              <ListItemVideo youTubeId={video.youTubeId} videoTitle={video.title[selectedLanguageKey]} startOffset={startOffset} /> 
            </React.Fragment>
          ) : (
            <ListItemThumbnail fullscreen={fullscreen} link={link}>
              {renderVideoThumbnail(image, video.thumbnailDescription)}
            </ListItemThumbnail>
          )
      }
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          {fullscreen ? (
            <div className={style.theaterModeHeader}>
            {
              fullscreen ? <h1>{video.title[selectedLanguageKey]}<span>{video.youTubeUser}</span></h1> : <h2>{video.title[selectedLanguageKey]}<span>{video.youTubeUser}</span></h2>
            }
              <Link href={theaterModeLink.to} aria-label={theaterModeLink.title}>
                <Button buttontype="minimal">
                  <span className={style.label}>{theaterModeLink.label}</span>
                  {isTheaterMode ? <MinimizeIcon className={style.icon} /> : <MaximizeIcon className={style.icon} />}
                </Button>
              </Link>
          </div>
          ) : (
            <h2>
              {video.title[selectedLanguageKey]}
              <span>{video.youTubeUser}</span>
            </h2>
          )}
          <time dateTime={videoDate.toISOString()}>{getPrettyDate(videoDate, selectedLanguageKey)}</time>
        </ListItemContentHeader>
        <ListItemContentBody fullscreen={fullscreen}>
          { 
            videoDescription
          }
        </ListItemContentBody>
      </ListItemContent>
    </React.Fragment>)
    : '';
}

export default Video;
