// Dependencies
import React from 'react';
import { Helmet } from 'react-helmet-async';

// Components
import EquipmentItem from '../EquipmentItem';
import ReleaseLinks from './ReleaseLinks';
import Product from '../Product';
import ExpansionPanel from '../../template/ExpansionPanel';
import List from '../../template/List';
import ListItem from '../../template/List/ListItem';
import ListItemContent from '../../template/List/ListItem/ListItemContent';
import ListItemContentBody from '../../template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from '../../template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from '../../template/List/ListItem/ListItemThumbnail';

// Actions
import { convertToUrlFriendlyString } from '../../../helpers/urlFormatter'

// Selectors
import { getLanguageSlug } from '../../../reducers/AvailableLanguagesReducer';

// Helpers
import { getReleaseInstruments, getReleaseProducts } from '../../../helpers/releaseInstruments';
import { useSelector } from 'react-redux';
import { getRichSnippetDateString } from '../../../helpers/dateFormatter';


const Release = ({ release, fullscreen, compact }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));


  const renderReleaseThumbnail = (image, fullscreen, release, compact) => {

      const altText = `${release.unreleased ? 'Coming soon:' : 'Album cover for'} ${release.title} by ${release.artistName}`

      if (compact) {
        return (<React.Fragment>
            <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" />
            <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" />
            { release?.unreleased 
                ? <source srcSet={`${image.png55} 1x, ${image.png55} 2x`} type="image/png" /> 
                : <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" /> 
            }
            {
              release?.unreleased 
                ? <img loading="lazy" src={image.png55} data-width="55" data-height="55" alt={altText} />
                : <img loading="lazy" src={image.jpg55} data-width="55" data-height="55" alt={altText} />
            }
        </React.Fragment>);
      } else if (fullscreen){
        return (<React.Fragment>
          <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" media='(max-width: 407px)' />
          <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" media='(max-width: 407px)' />
          {
            release?.unreleased 
              ? <source srcSet={`${image.png350} 1x, ${image.png350} 2x`} type="image/png" media='(max-width: 407px)' />
              : <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" media='(max-width: 407px)' />
          }
          <source srcSet={`${image.avif540} 1x, ${image.avif540} 2x`} type="image/avif" />
          <source srcSet={`${image.webp540} 1x, ${image.webp540} 2x`} type="image/webp" />
          {
            release?.unreleased
              ? <source srcSet={`${image.png540} 1x, ${image.png540} 2x`} type="image/png" />
              : <source srcSet={`${image.jpg540} 1x, ${image.jpg540} 2x`} type="image/jpg" />
          }
          {
            release?.unreleased
              ? <img fetchpriority="high" src={image.png540} data-width="540" data-height="540" alt={altText} />
              : <img fetchpriority="high" src={image.jpg540} data-width="540" data-height="540" alt={altText} />
          }
        </React.Fragment>);
      } else {
        return (<React.Fragment>
          <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" media='(max-width: 599px)' />
          <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" media='(max-width: 599px)' />
          {
            release?.unreleased
              ? <source srcSet={`${image.png55} 1x, ${image.png55} 2x`} type="image/png" media='(max-width: 599px)' />
              : <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" media='(max-width: 599px)' />
          }
          <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" />
          <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" />
          {
            release?.unreleased
              ? <source srcSet={`${image.png350} 1x, ${image.png350} 2x`} type="image/png" />
              : <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" />
          }
          {
            release?.unreleased
              ? <img loading="lazy" src={image.png350} data-width="350" data-height="350" alt={altText} />
              : <img loading="lazy" src={image.jpg350} data-width="350" data-height="350" alt={altText} />
          }
        </React.Fragment>);
      }
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
        "@id": `https://www.dehlimusikk.no/artists/${convertToUrlFriendlyString(release.artistName)}`,
        "name": release.artistName
      },
      "recordingOf": {
        "@type": "MusicComposition",
        "name": release.title
      },
      "contributor": {
        "@type": "OrganizationRole",
        "contributor": {
          "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli",
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
        "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli"
      }
    }
    if (release.producedByDehliMusikk) {
      snippet.producer = {
        "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli"
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
      const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
      const elementId = `release-instruments-${releaseId}`;
      return (
        <ExpansionPanel elementId={elementId} panelTitle={selectedLanguageKey === 'en' ? 'Instruments used on the song' : 'Instrumenter som er brukt på låta'}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    } else {
      return '';
    }
  }

  const renderProductsList = (products, selectedLanguageKey) => {
    if (products && products.length) {
      const listItems = products.map(product => {
        return (<ListItem key={product.equipmentItemId} compact={true}>
          <Product product={product} itemId={product.equipmentItemId} compact={true} />
        </ListItem>)
      });
      const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
      const elementId = `release-products-${releaseId}`;
      return (
        <ExpansionPanel elementId={elementId} panelTitle={selectedLanguageKey === 'en' ? 'Products used on the song' : 'Produkter som er brukt på låta'}>
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
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
    const elementId = `release-links-${releaseId}`;
    return (
      <ExpansionPanel elementId={elementId} panelTitle={selectedLanguageKey === 'en' ? `Listen to ${release.title}` : `Lytt til ${release.title}`}>
        <ReleaseLinks release={release} />
      </ExpansionPanel>
    );
  }

  const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
  const releaseInstruments = getReleaseInstruments(releaseId);
  const releaseProducts = getReleaseProducts(releaseId);

  const imagePathAvif = !release.unreleased ? `data/releases/thumbnails/web/avif/${release.thumbnailFilename}` : `assets/images/comingSoon_${selectedLanguageKey}`;
  const imagePathWebp = !release.unreleased ? `data/releases/thumbnails/web/webp/${release.thumbnailFilename}` : `assets/images/comingSoon_${selectedLanguageKey}`;
  const imagePathJpg = !release.unreleased ? `data/releases/thumbnails/web/jpg/${release.thumbnailFilename}` : null;
  const imagePathPng = !release.unreleased ? null : `assets/images/comingSoon_${selectedLanguageKey}`;
  const image = {
    avif55: require(`../../../${imagePathAvif}_55.avif`)?.default,
    avif350: require(`../../../${imagePathAvif}_350.avif`)?.default,
    avif540: require(`../../../${imagePathAvif}_540.avif`)?.default,
    webp55: require(`../../../${imagePathWebp}_55.webp`)?.default,
    webp350: require(`../../../${imagePathWebp}_350.webp`)?.default,
    webp540: require(`../../../${imagePathWebp}_540.webp`)?.default,
    jpg55: !release.unreleased ? require(`../../../${imagePathJpg}_55.jpg`)?.default : null,
    jpg350: !release.unreleased ? require(`../../../${imagePathJpg}_350.jpg`)?.default : null,
    jpg540: !release.unreleased ? require(`../../../${imagePathJpg}_540.jpg`)?.default : null,
    png55: release.unreleased ? require(`../../../${imagePathPng}_55.png`)?.default : null,
    png350: release.unreleased ? require(`../../../${imagePathPng}_350.png`)?.default : null,
    png540: release.unreleased ? require(`../../../${imagePathPng}_540.png`)?.default : null,
  };

  const link = {
    to: `/${languageSlug}portfolio/${releaseId}/`,
    title: `${selectedLanguageKey === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`
  };

  return !release.unreleased
    ? (<React.Fragment>
      {
        fullscreen 
          ? <Helmet>
              <link rel="preload" as="image" href={image.avif350} fetchpriority="high" type="image/avif" media='(max-width: 407px)'/>
              <link rel="preload" as="image" href={image.avif540} fetchpriority="high" type="image/avif" media='(min-width: 408px)'/>
            </Helmet>
          : ""
      }
      {fullscreen ? renderReleaseSnippet(release, releaseInstruments, image['jpg540']) : ''}
      <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
        {renderReleaseThumbnail(image, fullscreen, release, compact)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          {
            fullscreen ? <h1>{release.title}<span>{release.artistName}</span></h1> : <h2>{release.title}<span>{release.artistName}</span></h2>
          }
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
        fullscreen ? renderProductsList(releaseProducts, selectedLanguageKey) : ''
      }
      {
        fullscreen ? renderLinkList(release, selectedLanguageKey) : ''
      }
    </React.Fragment>)
    : (
      <React.Fragment>
        {
        fullscreen 
          ? <Helmet><link rel="preload" as="image" href={image.png540} fetchpriority="high" type="image/png"/></Helmet>
          : ""
        }
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
        {
          fullscreen ? renderProductsList(releaseProducts, selectedLanguageKey) : ''
        }
      </React.Fragment>
    );
}

export default Release;
