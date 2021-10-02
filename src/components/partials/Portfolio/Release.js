// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';

// Components
import EquipmentItem from 'components/partials/EquipmentItem';
import ExpansionPanel from 'components/template/ExpansionPanel';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ReleaseLinks from 'components/partials/Portfolio/ReleaseLinks';

// Actions
import { fetchReleasesThumbnail } from 'actions/PortfolioActions';
import { getLanguageSlug } from 'actions/LanguageActions';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Helpers
import { getReleaseInstruments } from 'helpers/releaseInstruments';


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
    this.setState({ showLinks: true });
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.setState({ showLinks: false });
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  renderReleaseThumbnail(image, fullscreen, release, compact) {
    const imageSize = compact
      ? '55px'
      : fullscreen
        ? '540px'
        : '350px';

    return (<React.Fragment>
      <source sizes={imageSize} srcSet={`${image.avif55} 55w, ${image.avif350} 350w, ${image.avif540} 540w`} type="image/avif" />
      <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w`} type="image/webp" />
      {
        release.unreleased
          ? <source sizes={imageSize} srcSet={`${image.png55} 55w, ${image.png350} 350w, ${image.png540} 540w`} type="image/png" />
          : <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w`} type="image/jpg" />
      }
      <img loading="lazy" src={release.unreleased ? image.png540 : image.jpg540} width="540" height="540" alt={`${release.unreleased ? 'Coming soon:' : 'Album cover for'} ${release.title} by ${release.artistName}`} />
    </React.Fragment>);
  }

  renderReleaseSnippet(release, releaseInstruments, releaseThumbnailSrc) {
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
    let snippet = {
      "@context": "http://schema.org",
      "@type": "MusicRecording",
      "@id": `https://www.dehlimusikk.no/portfolio/${releaseId}/`,
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
      "thumbnailUrl": `https://www.dehlimusikk.no${releaseThumbnailSrc}`,
      "contributor": {
        "@type": "OrganizationRole",
        "contributor": {
          "@id": "#BenjaminDehli",
        }
      }
    }
    if (release.composedByDehliMusikk) {
      snippet.recordingOf.composer = {
        "@id": "#BenjaminDehli"
      }
    }
    if (release.producedByDehliMusikk) {
      snippet.producer = {
        "@id": "#BenjaminDehli"
      }
    }
    if (release.isrcCode) {
      snippet.isrcCode = release.isrcCode;
    }
    if (releaseInstruments && releaseInstruments.length) {
      snippet.contributor.roleName = releaseInstruments.map(instrument => {
        return `${instrument.brand} ${instrument.model}`;
      })
    }
    if (Object.values(release.links)?.length) {
      snippet.sameAs = Object.values(release.links);
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  renderInstrumentsList(instruments, selectedLanguageKey) {
    if (instruments && instruments.length) {
      const listItems = instruments.map(instrument => {
        return (<ListItem key={instrument.equipmentItemId} compact={true}>
          <EquipmentItem item={instrument} itemId={instrument.equipmentItemId} itemType='instruments' compact={true} />
        </ListItem>)
      });
      return (
        <ExpansionPanel panelTitle={selectedLanguageKey === 'en' ? 'Instruments used on the song' : 'Instrumenter som er brukt på låta'}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    } else {
      return '';
    }
  }

  renderLinkList(release, selectedLanguageKey) {
    return (
      <ExpansionPanel panelTitle={selectedLanguageKey === 'en' ? `Listen to ${release.title}` : `Lytt til ${release.title}`}>
        <ReleaseLinks release={release} />
      </ExpansionPanel>
    );
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const release = this.props.release;
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const releaseInstruments = getReleaseInstruments(releaseId);

    const imagePathAvif = !release.unreleased ? `data/releases/thumbnails/web/avif/${release.thumbnailFilename}` : `assets/images/comingSoon_${selectedLanguageKey}`;
    const imagePathWebp = !release.unreleased ? `data/releases/thumbnails/web/webp/${release.thumbnailFilename}` : `assets/images/comingSoon_${selectedLanguageKey}`;
    const imagePathJpg = !release.unreleased ? `data/releases/thumbnails/web/jpg/${release.thumbnailFilename}` : null;
    const imagePathPng = !release.unreleased ? null : `assets/images/comingSoon_${selectedLanguageKey}`;
    const image = {
      avif55: require(`../../../${imagePathAvif}_55.avif`).default,
      avif350: require(`../../../${imagePathAvif}_350.avif`).default,
      avif540: require(`../../../${imagePathAvif}_540.avif`).default,
      webp55: require(`../../../${imagePathWebp}_55.webp`).default,
      webp350: require(`../../../${imagePathWebp}_350.webp`).default,
      webp540: require(`../../../${imagePathWebp}_540.webp`).default,
      jpg55: !release.unreleased ? require(`../../../${imagePathJpg}_55.jpg`).default : null,
      jpg350: !release.unreleased ? require(`../../../${imagePathJpg}_350.jpg`).default : null,
      jpg540: !release.unreleased ? require(`../../../${imagePathJpg}_540.jpg`).default : null,
      png55: release.unreleased ? require(`../../../${imagePathPng}_55.png`).default : null,
      png350: release.unreleased ? require(`../../../${imagePathPng}_350.png`).default : null,
      png540: release.unreleased ? require(`../../../${imagePathPng}_540.png`).default : null,
    };

    const link = {
      to: `/${this.props.getLanguageSlug(selectedLanguageKey)}portfolio/${releaseId}/`,
      title: `${selectedLanguageKey === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`
    };

    return !release.unreleased
      ? (<React.Fragment>
        {this.props.fullscreen ? this.renderReleaseSnippet(release, releaseInstruments, image['jpg540']) : ''}
        <ListItemThumbnail fullscreen={this.props.fullscreen} link={link} compact={this.props.compact}>
          {this.renderReleaseThumbnail(image, this.props.fullscreen, release, this.props.compact)}
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
          this.props.fullscreen ? this.renderInstrumentsList(releaseInstruments, selectedLanguageKey) : ''
        }
        {
          this.props.fullscreen ? this.renderLinkList(release, selectedLanguageKey) : ''
        }
      </React.Fragment>)
      : (
        <React.Fragment>
          {this.props.fullscreen ? this.renderReleaseSnippet(release, releaseInstruments) : ''}
          <ListItemThumbnail fullscreen={this.props.fullscreen} link={link} compact={this.props.compact}>
            {this.renderReleaseThumbnail(image, this.props.fullscreen, release, this.props.compact)}
          </ListItemThumbnail>
          <ListItemContent fullscreen={this.props.fullscreen}>
            <ListItemContentHeader fullscreen={this.props.fullscreen} link={link}>
              <h2>{release.title}
                <span>{release.artistName}</span>
              </h2>
            </ListItemContentHeader>
          </ListItemContent>
        </React.Fragment>
      );
  }
}

Release.propTypes = {
  release: PropTypes.object.isRequired,
  fullscreen: PropTypes.bool,
  compact: PropTypes.bool
};

Release.defaultProps = {
  fullscreen: false,
  compact: false
}

const mapStateToProps = state => ({ selectedLanguageKey: state.selectedLanguageKey });

const mapDispatchToProps = {
  fetchReleasesThumbnail,
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Release);
