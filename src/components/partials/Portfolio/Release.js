// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import PropTypes from 'prop-types';

// Components
import ReleaseLinks from 'components/partials/Portfolio/ReleaseLinks';
import EquipmentItem from 'components/partials/EquipmentItem';

// Template
import ExpansionPanel from 'components/template/ExpansionPanel';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';

// Actions
import {fetchReleasesThumbnail} from 'actions/PortfolioActions';
import {getLanguageSlug} from 'actions/LanguageActions';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Helpers
import {getReleaseInstruments} from 'helpers/releaseInstruments';

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

  renderReleaseThumbnail(image, fullscreen, release, compact) {
    const imageSize = compact
      ? '55px'
      : fullscreen
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
      "thumbnailUrl": `https://www.dehlimusikk.no${releaseThumbnailSrc}`,
      "contributor": {
        "@type": "Person",
        "name": "Benjamin Dehli",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bø i Telemark",
          "postalCode": "3804",
          "streetAddress": "Margretes veg 15",
          "addressCountry": {
            "name": "NO"
          }
        },
        "naics": "711130",
        "jobTitle": {
          "@context": "http://schema.org/",
          "@type": "DefinedTerm",
          "termCode": "711130",
          "name": "Musical Groups and Artists",
          "url": "https://www.naics.com/naics-code-description/?code=711130",
          "inDefinedTermSet": "NAICS (North American Industry Classification System)"
        },
        "brand": {
          "@context": "http://schema.org",
          "@type": "Organization",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15",
            "addressCountry": {
              "name": "NO"
            }
          },
          "naics": "711130",
          "sameAs": [
            "https://www.facebook.com/DehliMusikk/",
          	"https://twitter.com/BenjaminDehli",
            "https://www.instagram.com/benjamindehli/",
          	"https://www.youtube.com/c/BenjaminDehli",
            "https://www.linkedin.com/in/benjamindehli/",
            "https://vimeo.com/benjamindehli",
            "https://flickr.com/photos/projectdehli/",
            "https://benjamindehli.tumblr.com/",
            "https://github.com/benjamindehli"
          ],
          "hasPos": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bø i Telemark",
              "postalCode": "3804",
              "streetAddress": "Margretes veg 15",
              "addressCountry": {
                "name": "NO"
              }
            },
            "hasMap": "https://www.google.com/maps?cid=13331960642102658320"
          },
          "location": {
            "@type": "PostalAddress",
            "addressLocality": "Bø i Telemark",
            "postalCode": "3804",
            "streetAddress": "Margretes veg 15",
            "addressCountry": {
              "name": "NO"
            }
          },
          "foundingDate": "	2019-10-01",
          "foundingLocation": {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bø i Telemark",
              "postalCode": "3804",
              "streetAddress": "Margretes veg 15",
              "addressCountry": {
                "name": "NO"
              }
            },
            "hasMap": "https://www.google.com/maps?cid=13331960642102658320"
          },
          "logo": "https://www.dehlimusikk.no/DehliMusikkLogo.png",
          "image": "https://www.dehlimusikk.no/DehliMusikkLogo.png",
          "email": "superelg(at)gmail.org",
          "founder": {
            "@type": "Person",
            "name": "Benjamin Dehli",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Bø i Telemark",
              "postalCode": "3804",
              "streetAddress": "Margretes veg 15",
              "addressCountry": {
                "name": "NO"
              }
            }
          },
          "name": "Dehli Musikk",
          "telephone": "+47 92 29 27 19",
          "url": "https://www.dehlimusikk.no"
        }
      }
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

  renderInstrumentsList(instruments, selectedLanguageKey){
    if (instruments && instruments.length){
      const listItems = instruments.map(instrument => {
        return (<ListItem key={instrument.equipmentItemId} compact={true}>
                  <EquipmentItem item={instrument} itemId={instrument.equipmentItemId} itemType='instruments' compact={true}/>
                </ListItem>)
      });
      return (
        <ExpansionPanel panelTitle={selectedLanguageKey === 'en' ? 'Instruments used on the song' : 'Instrumenter som er brukt på låta'}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    }else {
      return '';
    }
  }

  renderLinkList(release, selectedLanguageKey) {
    return (
      <ExpansionPanel panelTitle={selectedLanguageKey === 'en' ? `Listen to ${release.title}` : `Lytt til ${release.title}`}>
        <ReleaseLinks release={release}/>
      </ExpansionPanel>
    );
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
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
      to: `/${this.props.getLanguageSlug(selectedLanguageKey)}portfolio/${releaseId}/`,
      title: `${selectedLanguageKey === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`
    };

    return (<React.Fragment>
      {this.renderReleaseSnippet(release, image['jpg540'])}
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
        this.props.fullscreen ? this.renderInstrumentsList(getReleaseInstruments(releaseId), selectedLanguageKey) : ''
      }
      {
        this.props.fullscreen ? this.renderLinkList(release, selectedLanguageKey) : ''
      }
    </React.Fragment>);
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

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  fetchReleasesThumbnail,
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(Release);
