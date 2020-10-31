// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Helpers
import {getPrettyDate} from 'helpers/dateFormatter';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'
import {convertStringToExcerpt} from 'helpers/search';

// Components
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemVideo from 'components/template/List/ListItem/ListItemVideo';


class Video extends Component {

  renderVideoSnippet(video, videoId, videoThumbnailSrc){
    const videoDate = new Date(video.timestamp).toISOString();
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const snippet = {
      "@context": "http://schema.org",
      "@type": "VideoObject",
      "@id": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}videos/${videoId}/`,
      "name": video.title[selectedLanguageKey],
      "description": video.content[selectedLanguageKey]
        ? video.content[selectedLanguageKey].replace("\n", " ")
        : '',
      "duration": video.duration,
      "url": `https://www.dehlimusikk.no/${this.props.getLanguageSlug(selectedLanguageKey)}videos/${videoId}/`,
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
    if (video.copyright){
      snippet.thumbnail.license = "https://creativecommons.org/licenses/by/4.0/legalcode";
      snippet.thumbnail.acquireLicensePage = "https://www.dehlimusikk.no/#contact";
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>);
  }

  renderVideoThumbnail(image, altText, fullscreen, videoPath, videoTitle, copyright, videoDate) {
    const copyrightString = copyright && videoDate ? `cc-by ${videoDate.getFullYear()} Benjamin Dehli dehlimusikk.no` : null;
    const imageSize = fullscreen
      ? '540px'
      : '350px';
    return (<React.Fragment>
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp"/>
      <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg"/>
      <img loading="lazy" src={image.jpg350} width="350" height="260" alt={altText} copyright={copyrightString} />
    </React.Fragment>);
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const video = this.props.video;
    const imagePathWebp = `data/videos/thumbnails/web/webp/${video.thumbnailFilename}`;
    const imagePathJpg = `data/videos/thumbnails/web/jpg/${video.thumbnailFilename}`;
    const image = {
      webp55: require(`../../${imagePathWebp}_55.webp`).default,
      webp350: require(`../../${imagePathWebp}_350.webp`).default,
      webp540: require(`../../${imagePathWebp}_540.webp`).default,
      jpg55: require(`../../${imagePathJpg}_55.jpg`).default,
      jpg350: require(`../../${imagePathJpg}_350.jpg`).default,
      jpg540: require(`../../${imagePathJpg}_540.jpg`).default
    };
    const videoDate = new Date(video.timestamp);
    const videoId = convertToUrlFriendlyString(video.title[selectedLanguageKey]);
    const videoPath = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}videos/${videoId}/`;
    const videoDescription = this.props.fullscreen ? video.content[selectedLanguageKey] : convertStringToExcerpt(video.content[selectedLanguageKey]);

    const link = {
      to: videoPath,
      title: video.title[selectedLanguageKey]
    };

    return video && video.content && video.content[selectedLanguageKey]
      ? (<React.Fragment>
        {
          this.props.fullscreen
          ? (
            <React.Fragment>
              {this.renderVideoSnippet(video, videoId, image.jpg540)}
              <ListItemVideo youTubeId={video.youTubeId} videoTitle={video.title[selectedLanguageKey]}/>
            </React.Fragment>
          ) : (
            <ListItemThumbnail fullscreen={this.props.fullscreen} link={link}>
              {this.renderVideoThumbnail(image, video.thumbnailDescription, this.props.fullscreen, videoPath, video.title[selectedLanguageKey], video.copyright, videoDate)}
            </ListItemThumbnail>
          )
        }
        <ListItemContent fullscreen={this.props.fullscreen}>
          <ListItemContentHeader fullscreen={this.props.fullscreen} link={link}>
            <h2>
              {video.title[selectedLanguageKey]}
              <span>{video.youTubeUser}</span>
            </h2>
            <time dateTime={videoDate.toISOString()}>{getPrettyDate(videoDate, selectedLanguageKey)}</time>
          </ListItemContentHeader>
          <ListItemContentBody fullscreen={this.props.fullscreen}>
              {
                videoDescription.split('\n').map((paragraph, key) => {
                  return (<p key={key}>{paragraph}</p>)
                })
              }
          </ListItemContentBody>
        </ListItemContent>
      </React.Fragment>)
      : '';
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Video);
