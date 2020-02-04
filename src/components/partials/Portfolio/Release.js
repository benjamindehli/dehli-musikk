// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';

// Components
import ReleaseLinks from 'components/partials/Portfolio/ReleaseLinks';
import Button from 'components/partials//Button';

// Actions
import {fetchReleasesThumbnail} from 'actions/PortfolioActions';
import {getLanguageSlug} from 'actions/LanguageActions';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Stylesheets
import style from 'components/partials/Portfolio/Release.module.scss';

class Release extends Component {
  constructor(props) {
    super(props);
    this.state = {
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
  }

  renderReleaseThumbnail_old(releaseThumbnail, release) {
    const srcSets = Object.keys(releaseThumbnail).map(fileType => {
      const srcSet = Object.keys(releaseThumbnail[fileType]).map(imageSize => {
        return releaseThumbnail[fileType][imageSize].srcSet;
      })
      return (<source sizes={this.props.fullscreen
          ? '400px'
          : '55px'} key={fileType} srcSet={`${srcSet}`} type={`image/${fileType}`}/>)
    })
    const thumbnailImageSrc = releaseThumbnail.jpg[400] && releaseThumbnail.jpg[400].url
      ? releaseThumbnail.jpg[400].url
      : '';
    return (<picture>{srcSets}<img src={thumbnailImageSrc} alt={`Album cover for ${release.title} by ${release.artistName}`}/></picture>);
  }

  renderReleaseThumbnail(image, fullscreen, release) {
    const imageSize = fullscreen
      ? '400px'
      : '55px';

    return (<picture>
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp400} 400w`} type="image/webp"/>
      <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg400} 400w`} type="image/jpg"/>
      <img src={image.jpg400} alt={`Album cover for ${release.title} by ${release.artistName}`}/>
    </picture>);
  }

  renderReleaseSnippet(release, releaseThumbnailSrc) {
    const snippet = {
      "@context": "http://schema.org",
      "@type": "MusicRecording",
      "@id": `https://www.dehlimusikk.no/portfolio/#${release.id}`,
      "name": release.title,
      "duration": release.durationISO,
      "genre": release.genre,
      "byArtist": {
        "@type": "MusicGroup",
        "name": release.artistName
      },
      "recordingOf": {
        "@type": "MusicComposition",
        "name": release.title
      },
      "thumbnailUrl": `https://www.dehlimusikk.no/portfolio${releaseThumbnailSrc}`
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  render() {

    const release = this.props.release;
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);

    const imagePathWebp = `data/releases/thumbnails/web/webp/${release.thumbnailFilename}`;
    const imagePathJpg = `data/releases/thumbnails/web/jpg/${release.thumbnailFilename}`;
    const image = {
      webp55: require(`../../../${imagePathWebp}_55.webp`),
      webp400: require(`../../../${imagePathWebp}_400.webp`),
      jpg55: require(`../../../${imagePathJpg}_55.jpg`),
      jpg400: require(`../../../${imagePathJpg}_400.jpg`)
    };

    return (<div className={this.props.fullscreen
        ? style.fullscreen
        : style.listItem}>
      {this.renderReleaseSnippet(release, image['jpg400'])}
      <div className={style.thumbnail}>
        {this.renderReleaseThumbnail(image, this.props.fullscreen, release)}
      </div>
      <div className={style.content}>
        <div className={style.header}>
          <h2>{release.title}</h2>
        </div>
        <div className={style.body}>
          <span>{release.artistName}</span>
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
      {
        !this.props.fullscreen
          ? (<div className={style.actionButton}>

            <Link to={`/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${releaseId}/`}>
              <Button onClick={() => this.handleShowLinksClick()} buttontype='minimal'>{
                  this.props.selectedLanguageKey === 'en'
                    ? 'Listen to '
                    : 'Lytt til '
                }
                {release.title}</Button>
            </Link>
          </div>)
          : ''
      }
      {
        this.props.fullscreen
          ? (<div className={style.links}>
            <ReleaseLinks release={release}/>
          </div>)
          : ''
      }
    </div>);
  }
}

Release.propTypes = {
  release: PropTypes.object.isRequired,
  fullscreen: PropTypes.bool
};

Release.defaultProps = {
  fullscreen: false
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  fetchReleasesThumbnail,
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Release);
