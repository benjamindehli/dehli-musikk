// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import PropTypes from 'prop-types';

// Components
import ReleaseLinks from 'components/partials/Portfolio/ReleaseLinks';

// Template
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';

// Actions
import {fetchReleasesThumbnail} from 'actions/PortfolioActions';
import {getLanguageSlug} from 'actions/LanguageActions';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'


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

  renderReleaseThumbnail(image, fullscreen, release) {
    const imageSize = fullscreen
      ? '540px'
      : '350px';

    return (<React.Fragment>
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp"/>
      <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg"/>
      <img loading="lazy" src={image.jpg540} width="540" height="540" alt={`Album cover for ${release.title} by ${release.artistName}`}/>
    </React.Fragment>);
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
      "thumbnailUrl": `https://www.dehlimusikk.no${releaseThumbnailSrc}`
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
      webp350: require(`../../../${imagePathWebp}_350.webp`),
      webp540: require(`../../../${imagePathWebp}_540.webp`),
      jpg55: require(`../../../${imagePathJpg}_55.jpg`),
      jpg350: require(`../../../${imagePathJpg}_350.jpg`),
      jpg540: require(`../../../${imagePathJpg}_540.jpg`)
    };

    const link = {
      to: `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}portfolio/${releaseId}/`,
      title: `${this.props.selectedLanguageKey === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`
    };

    return (<React.Fragment>
      {this.renderReleaseSnippet(release, image['jpg540'])}
      <ListItemThumbnail fullscreen={this.props.fullscreen} link={link}>
        {this.renderReleaseThumbnail(image, this.props.fullscreen, release)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={this.props.fullscreen}>
        <ListItemContentHeader fullscreen={this.props.fullscreen} link={link}>
          <h2>{release.title}
            <span>{release.artistName}</span>
          </h2>
        </ListItemContentHeader>
        <ListItemContentBody fullscreen={this.props.fullscreen}>
          <ul>
            <li>{release.genre}</li>
            <li><time dateTime={release.durationISO}>
              {new Date(release.duration).getMinutes()}:{
                new Date(release.duration).getSeconds() > 9
                  ? new Date(release.duration).getSeconds()
                  : '0' + new Date(release.duration).getSeconds()
              }</time></li>
            <li><time dateTime={new Date(release.releaseDate).toISOString()}>{new Date(release.releaseDate).getFullYear()}</time></li>
          </ul>
        </ListItemContentBody>
      </ListItemContent>
      {
        this.props.fullscreen ? <ReleaseLinks release={release}/> : ''
      }
    </React.Fragment>);
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
