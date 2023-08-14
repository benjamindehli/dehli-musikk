// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';

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


const Video = ({ video, fullscreen }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));

  const renderVideoSnippet = (video, videoId, videoThumbnailSrc) => {
    const videoDate = new Date(video.timestamp).toISOString();
    const snippet = {
      "@context": "http://schema.org",
      "@type": "VideoObject",
      "@id": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/`,
      "name": video.title[selectedLanguageKey],
      "description": video.content[selectedLanguageKey]
        ? formatContentAsString(video.content[selectedLanguageKey])
        : '',
      "duration": video.duration,
      "url": `https://www.dehlimusikk.no/${languageSlug}videos/${videoId}/`,
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
        "@id": "#BenjaminDehli"
      };
    }
    if (video.clips) {
      snippet.hasPart = video.clips.map(clip => {
        return {
          "@type": "Clip",
          "name": clip.name[selectedLanguageKey],
          "startOffset": clip.startOffset,
          "endOffset": clip.endOffset,
          "url": `https://www.youtube.com/watch?v=${video.youTubeId}&t=${clip.startOffset}`
        }
      })
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>);
  }

  const renderVideoThumbnail = (image, altText, fullscreen) => {
    const imageSize = fullscreen
      ? '540px'
      : '350px';
    
    const srcSets = {
      avif: `${image.avif55} 55w, ${image.avif350} 350w ${fullscreen ? `, ${image.avif540} 540w` : ""}`,
      webp: `${image.webp55} 55w, ${image.webp350} 350w ${fullscreen ? `, ${image.webp540} 540w` : ""}`,
      jpg: `${image.jpg55} 55w, ${image.jpg350} 350w ${fullscreen ? `, ${image.jpg540} 540w` : ""}`
    };

    return (<React.Fragment>
      <source sizes={imageSize} srcSet={srcSets.avif} type="image/avif" />
      <source sizes={imageSize} srcSet={srcSets.webp} type="image/webp" />
      <source sizes={imageSize} srcSet={srcSets.jpg} type="image/jpg" />
      <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} />
    </React.Fragment>);
  }

  const imagePathAvif = `data/videos/thumbnails/web/avif/${video.thumbnailFilename}`;
  const imagePathWebp = `data/videos/thumbnails/web/webp/${video.thumbnailFilename}`;
  const imagePathJpg = `data/videos/thumbnails/web/jpg/${video.thumbnailFilename}`;
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
  const videoDate = new Date(video.timestamp);
  const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
  const videoPath = `/${languageSlug}videos/${videoId}/`;
  const videoContentString = video?.content?.[selectedLanguageKey] || '';
  const videoDescription = fullscreen ? formatContentWithReactLinks(videoContentString, languageSlug) : <p>{convertStringToExcerpt(videoContentString)}</p>;

  const link = {
    to: videoPath,
    title: video.title[selectedLanguageKey]
  };

  return video && video.content && video.content[selectedLanguageKey]
    ? (<React.Fragment>
      {
        fullscreen
          ? (
            <React.Fragment>
              {renderVideoSnippet(video, videoId, image.jpg540)}
              <ListItemVideo youTubeId={video.youTubeId} videoTitle={video.title[selectedLanguageKey]} />
            </React.Fragment>
          ) : (
            <ListItemThumbnail fullscreen={fullscreen} link={link}>
              {renderVideoThumbnail(image, video.thumbnailDescription, fullscreen)}
            </ListItemThumbnail>
          )
      }
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          <h2>
            {video.title[selectedLanguageKey]}
            <span>{video.youTubeUser}</span>
          </h2>
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
