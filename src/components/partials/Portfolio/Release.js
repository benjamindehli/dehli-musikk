// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet-async';
import PropTypes from 'prop-types';

// Components
import {withFirebase} from '../../Firebase';
import ReleaseLinks from './ReleaseLinks';
import Button from '../Button';

// Stylesheets
import style from './Release.module.scss';

class Release extends Component {
  constructor(props) {
    super(props);
    this.state = {
      releaseThumbnail: {
        webp: {},
        jpg: {}
      },
      showLinks: false,
      isLoaded: false
    };
    this.setWrapperRef = this.setWrapperRef.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  setWrapperRef(node) {
    this.wrapperRef = node;
  }

  handleShowLinksClick() {
    this.setState({showLinks: true});
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({showLinks: false});
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);

    const releaseThumbnail = this.props.firebase.getReleaseThumbnail(this.props.release.thumbnailFilename);
    if (releaseThumbnail) {
      Object.keys(releaseThumbnail).forEach(fileType => {
        const releaseThumbnailWithFileType = releaseThumbnail[fileType];
        Object.keys(releaseThumbnailWithFileType).forEach(imageSize => {
          releaseThumbnailWithFileType[imageSize].getDownloadURL().then(url => {
            this.setState({
              releaseThumbnail: {
                ...this.state.releaseThumbnail,
                [fileType]: {
                  ...this.state.releaseThumbnail[fileType],
                  [imageSize]: {
                    srcSet: `${url} ${imageSize}w`,
                    url: url
                  }
                }
              }
            }, () => {
              this.setState({isLoaded: true})
            })
          })
        });
      })
    }
  }

  renderReleaseThumbnail(releaseThumbnail, artist, release) {
    const srcSets = Object.keys(releaseThumbnail).map(fileType => {
      const srcSet = Object.keys(releaseThumbnail[fileType]).map(imageSize => {
        return releaseThumbnail[fileType][imageSize].srcSet;
      })
      return (<source sizes={this.props.viewType === 'list'
          ? '55px'
          : '350px'} key={fileType} srcSet={`${srcSet}`} type={`image/${fileType}`}/>)
    })
    const thumbnailImageSrc = releaseThumbnail.jpg[350] && releaseThumbnail.jpg[350].url
      ? releaseThumbnail.jpg[350].url
      : '';
    return (<picture>{srcSets}<img src={thumbnailImageSrc} alt={`Album cover for ${release.title} by ${artist.artistName}`} /></picture>);
  }

  renderReleaseSnippet(artist, release, releaseThumbnailSrc) {
    const snippet = {
      "@context": "http://schema.org",
      "@type": "MusicRecording",
      "@id": `${window.location.origin}${window.location.pathname}#${release.id}`,
      "name": release.title,
      "duration": release.durationISO,
      "genre": release.genre,
      "byArtist": {
        "@type": "MusicGroup",
        "name": artist.artistName
      },
      "recordingOf": {
        "@type": "MusicComposition",
        "name": release.title
      },
      "thumbnailUrl": releaseThumbnailSrc
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  render() {
    const release = this.props.release;
    const artist = this.props.artist;
    const releaseThumbnailSrc = this.state.releaseThumbnail.jpg[350] && this.state.releaseThumbnail.jpg[350].url
      ? this.state.releaseThumbnail.jpg[350].url
      : null;
    return this.state.isLoaded
      ? (<div className={this.props.viewType === 'list'
          ? style.listItem
          : style.gridItem}>
        {this.renderReleaseSnippet(artist, release, releaseThumbnailSrc)}
        <div className={style.thumbnail}>
          {this.renderReleaseThumbnail(this.state.releaseThumbnail, artist, release)}
        </div>
        <div className={style.content}>
          <div className={style.header}>
            <h2>{release.title}</h2>
          </div>
          <div className={style.body}>
            <span>{artist.artistName}</span>
            <ul>
              <li>{release.genre}</li>
              <li>{new Date(release.duration).getMinutes()}:{
                  new Date(release.duration).getSeconds() > 9
                    ? new Date(release.duration).getSeconds()
                    : '0' + new Date(release.duration).getSeconds()
                }</li>
              <li>{new Date(release.releaseDate).getFullYear()}</li>
            </ul>
          </div>
        </div>
        <div className={style.actionButton}>
          <Button onClick={() => this.handleShowLinksClick()} buttontype='minimal'>{this.props.selectedLanguageKey == 'en' ? 'Listen to' : 'Lytt til'} {release.title}</Button>
        </div>
        {
          this.state.showLinks
            ? (<div className={style.linksModalOverlay}>
              <div ref={this.setWrapperRef} className={style.linksModalContent}>
                <h3>{this.props.selectedLanguageKey == 'en' ? 'Listen to' : 'Lytt til'} {release.title}</h3>
                <ReleaseLinks release={release}/>
              </div>
            </div>)
            : ''
        }
      </div>)
      : '';
  }
}

Release.propTypes = {
  artist: PropTypes.object.isRequired,
  release: PropTypes.object.isRequired,
  viewType: PropTypes.string
};

Release.defaultProps = {
  viewType: 'list'
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey
});

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(Release));
