// Dependencies
import React from 'react';
import { Helmet } from 'react-helmet-async';

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
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { getReleaseInstruments } from 'helpers/releaseInstruments';
import { useSelector } from 'react-redux';
import { getRichSnippetDateString } from 'helpers/dateFormatter';


const Release = ({ release, fullscreen, compact }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));


  const renderReleaseThumbnail = (image, fullscreen, release, compact) => {
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

  const renderReleaseSnippet = (release, releaseInstruments, releaseThumbnailSrc) => {
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
    const releaseDate = new Date(release.releaseDate);
    let snippet = {
      "@context": "http://schema.org",
      "@type": "MusicRecording",
      "@id": `https://www.dehlimusikk.no/portfolio/${releaseId}/`,
      "name": release.title,
      "duration": release.durationISO,
      "genre": release.genre,
      "description": `This is a music recording made by ${release.artistName}. The song is ${release.duration} long and belongs to the genre ${release.genre}.`,
      "byArtist": {
        "@type": "MusicGroup",
        "@id": `#${convertToUrlFriendlyString(release.artistName)}`,
        "name": release.artistName
      },
      "recordingOf": {
        "@type": "MusicComposition",
        "name": release.title
      },
      "contributor": {
        "@type": "OrganizationRole",
        "contributor": {
          "@id": "#BenjaminDehli",
        }
      }
    }
    if (!release.unreleased && releaseThumbnailSrc) {
      snippet.thumbnailUrl = `https://www.dehlimusikk.no${releaseThumbnailSrc}`;
      snippet.image = `https://www.dehlimusikk.no${releaseThumbnailSrc}`;
    }
    if (releaseDate) {
      snippet.datePublished = getRichSnippetDateString(releaseDate);
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

  const renderInstrumentsList = (instruments, selectedLanguageKey) => {
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

  const renderLinkList = (release, selectedLanguageKey) => {
    return (
      <ExpansionPanel panelTitle={selectedLanguageKey === 'en' ? `Listen to ${release.title}` : `Lytt til ${release.title}`}>
        <ReleaseLinks release={release} />
      </ExpansionPanel>
    );
  }

  const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
  const releaseInstruments = getReleaseInstruments(releaseId);

  const imagePathAvif = !release.unreleased ? `data/releases/thumbnails/web/avif/${release.thumbnailFilename}` : `assets/images/comingSoon_${selectedLanguageKey}`;
  const imagePathWebp = !release.unreleased ? `data/releases/thumbnails/web/webp/${release.thumbnailFilename}` : `assets/images/comingSoon_${selectedLanguageKey}`;
  const imagePathJpg = !release.unreleased ? `data/releases/thumbnails/web/jpg/${release.thumbnailFilename}` : null;
  const imagePathPng = !release.unreleased ? null : `assets/images/comingSoon_${selectedLanguageKey}`;
  const image = {
    avif55: require(`../../../${imagePathAvif}_55.avif`),
    avif350: require(`../../../${imagePathAvif}_350.avif`),
    avif540: require(`../../../${imagePathAvif}_540.avif`),
    webp55: require(`../../../${imagePathWebp}_55.webp`),
    webp350: require(`../../../${imagePathWebp}_350.webp`),
    webp540: require(`../../../${imagePathWebp}_540.webp`),
    jpg55: !release.unreleased ? require(`../../../${imagePathJpg}_55.jpg`) : null,
    jpg350: !release.unreleased ? require(`../../../${imagePathJpg}_350.jpg`) : null,
    jpg540: !release.unreleased ? require(`../../../${imagePathJpg}_540.jpg`) : null,
    png55: release.unreleased ? require(`../../../${imagePathPng}_55.png`) : null,
    png350: release.unreleased ? require(`../../../${imagePathPng}_350.png`) : null,
    png540: release.unreleased ? require(`../../../${imagePathPng}_540.png`) : null,
  };

  const link = {
    to: `/${languageSlug}portfolio/${releaseId}/`,
    title: `${selectedLanguageKey === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`
  };

  return !release.unreleased
    ? (<React.Fragment>
      {fullscreen ? renderReleaseSnippet(release, releaseInstruments, image['jpg540']) : ''}
      <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
        {renderReleaseThumbnail(image, fullscreen, release, compact)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          <h2>{release.title}
            <span>{release.artistName}</span>
          </h2>
        </ListItemContentHeader>
        <ListItemContentBody fullscreen={fullscreen}>
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
        fullscreen ? renderInstrumentsList(releaseInstruments, selectedLanguageKey) : ''
      }
      {
        fullscreen ? renderLinkList(release, selectedLanguageKey) : ''
      }
    </React.Fragment>)
    : (
      <React.Fragment>
        {fullscreen ? renderReleaseSnippet(release, releaseInstruments) : ''}
        <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
          {renderReleaseThumbnail(image, fullscreen, release, compact)}
        </ListItemThumbnail>
        <ListItemContent fullscreen={fullscreen}>
          <ListItemContentHeader fullscreen={fullscreen} link={link}>
            <h2>{release.title}
              <span>{release.artistName}</span>
            </h2>
          </ListItemContentHeader>
        </ListItemContent>
        {
          fullscreen ? renderInstrumentsList(releaseInstruments, selectedLanguageKey) : ''
        }
      </React.Fragment>
    );
}

export default Release;
