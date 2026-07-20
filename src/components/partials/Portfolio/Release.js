// Dependencies
import React from 'react';

// Components
import EquipmentItem from 'components/partials/EquipmentItem';
import ReleaseLinks from 'components/partials/Portfolio/ReleaseLinks';
import Product from 'components/partials/Product';
import ExpansionPanel from 'components/template/ExpansionPanel';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';

// Helpers
import { convertToUrlFriendlyString } from 'helpers/urlFormatter'
import { getReleaseInstruments, getReleaseProducts } from 'helpers/releaseInstruments';
import { getRichSnippetDateString } from 'helpers/dateFormatter';
import { getJsonLdForArtist, getJsonLdIdForArtist, getJsonLdIdForRelease } from 'helpers/releaseHelpers';
import { millisecondsToReadableTime } from 'helpers/timeFormatter';


const Release = ({ release, fullscreen = false, compact = false, lang, languageSlug }) => {

  const renderReleaseThumbnail = (image, fullscreen, release, compact) => {

      const altText = `${release.unreleased ? 'Coming soon:' : 'Album cover for'} ${release.title} by ${release.artistName}`

      if (compact) {
        return (<React.Fragment>
            <source srcSet={`${image.avif55} 1x, ${image.avif350} 2x`} type="image/avif" />
            <source srcSet={`${image.webp55} 1x, ${image.webp350} 2x`} type="image/webp" />
            { release?.unreleased
                ? <source srcSet={`${image.png55} 1x, ${image.png350} 2x`} type="image/png" />
                : <source srcSet={`${image.jpg55} 1x, ${image.jpg350} 2x`} type="image/jpeg" />
            }
            {
              release?.unreleased
                ? <img loading="lazy" src={image.png55} data-width="55" data-height="55" alt={altText} />
                : <img loading="lazy" src={image.jpg55} data-width="55" data-height="55" alt={altText} />
            }
        </React.Fragment>);
      } else if (fullscreen){
        return (<React.Fragment>
          <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" media='(max-width: 407px)' />
          <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" media='(max-width: 407px)' />
          {
            release?.unreleased
              ? <source srcSet={`${image.png350} 1x, ${image.png540} 2x`} type="image/png" media='(max-width: 407px)' />
              : <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" media='(max-width: 407px)' />
          }
          <source srcSet={`${image.avif540}`} type="image/avif" />
          <source srcSet={`${image.webp540}`} type="image/webp" />
          {
            release?.unreleased
              ? <source srcSet={`${image.png540}`} type="image/png" />
              : <source srcSet={`${image.jpg540}`} type="image/jpeg" />
          }
          {
            release?.unreleased
              ? <img fetchPriority="high" src={image.png540} data-width="540" data-height="540" alt={altText} />
              : <img fetchPriority="high" src={image.jpg540} data-width="540" data-height="540" alt={altText} />
          }
        </React.Fragment>);
      } else {
        return (<React.Fragment>
          <source srcSet={`${image.avif55} 1x, ${image.avif350} 2x`} type="image/avif" media='(max-width: 599px)' />
          <source srcSet={`${image.webp55} 1x, ${image.webp350} 2x`} type="image/webp" media='(max-width: 599px)' />
          {
            release?.unreleased
              ? <source srcSet={`${image.png55} 1x, ${image.png350} 2x`} type="image/png" media='(max-width: 599px)' />
              : <source srcSet={`${image.jpg55} 1x, ${image.jpg350} 2x`} type="image/jpeg" media='(max-width: 599px)' />
          }
          <source srcSet={`${image.avif350} 1x, ${image.avif540} 2x`} type="image/avif" />
          <source srcSet={`${image.webp350} 1x, ${image.webp540} 2x`} type="image/webp" />
          {
            release?.unreleased
              ? <source srcSet={`${image.png350} 1x, ${image.png540} 2x`} type="image/png" />
              : <source srcSet={`${image.jpg350} 1x, ${image.jpg540} 2x`} type="image/jpeg" />
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
    const releaseDate = new Date(release.releaseDate);
    let snippet = {
      "@context": "https://schema.org",
      "@type": "MusicRecording",
      "@id": getJsonLdIdForRelease(release),
      "name": release.title,
      "duration": release.durationISO,
      "genre": release.genre,
      "description": `This is a music recording made by ${release.artistName}. The song is ${millisecondsToReadableTime(release.duration)} long and belongs to the ${release.genre?.toLowerCase()} genre.`,
      "byArtist": getJsonLdForArtist(release.artistName),
      "recordingOf": {
        "@type": "MusicComposition",
        "name": release.title
      },
      "contributor": {
        "@type": "OrganizationRole",
        "contributor": {
          "@type": "MusicGroup",
          "@id": getJsonLdIdForArtist("Benjamin Dehli"),
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
        "@id": getJsonLdIdForArtist("Benjamin Dehli")
      }
    }
    if (release.producedByDehliMusikk) {
      snippet.producer = {
        "@id": getJsonLdIdForArtist("Benjamin Dehli")
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
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(snippet) }}
      />
    );
  }

  const renderInstrumentsList = (instruments, lang) => {
    if (instruments && instruments.length) {
      const listItems = instruments.map(instrument => {
        return (<ListItem key={instrument.equipmentItemId} compact={true}>
          <EquipmentItem item={instrument} itemId={instrument.equipmentItemId} itemType='instruments' compact={true} lang={lang} languageSlug={languageSlug} />
        </ListItem>)
      });
      const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
      const elementId = `release-instruments-${releaseId}`;
      return (
        <ExpansionPanel elementId={elementId} panelTitle={lang === 'en' ? 'Instruments used on the song' : 'Instrumenter som er brukt på låta'}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    } else {
      return '';
    }
  }

  const renderProductsList = (products, lang) => {
    if (products && products.length) {
      const listItems = products.map(product => {
        return (<ListItem key={product.equipmentItemId} compact={true}>
          <Product product={product} itemId={product.equipmentItemId} compact={true} lang={lang} languageSlug={languageSlug} />
        </ListItem>)
      });
      const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
      const elementId = `release-products-${releaseId}`;
      return (
        <ExpansionPanel elementId={elementId} panelTitle={lang === 'en' ? 'Products used on the song' : 'Produkter som er brukt på låta'}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    } else {
      return '';
    }
  }

  const renderLinkList = (release, lang) => {
    const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
    const elementId = `release-links-${releaseId}`;
    return (
      <ExpansionPanel elementId={elementId} panelTitle={lang === 'en' ? `Listen to ${release.title}` : `Lytt til ${release.title}`}>
        <ReleaseLinks release={release} lang={lang} />
      </ExpansionPanel>
    );
  }

  const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
  const releaseInstruments = getReleaseInstruments(releaseId);
  const releaseProducts = getReleaseProducts(releaseId);

  const image = release.unreleased
    ? {
        avif55: `/images/comingSoon_${lang}_55.avif`,
        avif350: `/images/comingSoon_${lang}_350.avif`,
        avif540: `/images/comingSoon_${lang}_540.avif`,
        webp55: `/images/comingSoon_${lang}_55.webp`,
        webp350: `/images/comingSoon_${lang}_350.webp`,
        webp540: `/images/comingSoon_${lang}_540.webp`,
        png55: `/images/comingSoon_${lang}_55.png`,
        png350: `/images/comingSoon_${lang}_350.png`,
        png540: `/images/comingSoon_${lang}_540.png`,
        jpg55: null, jpg350: null, jpg540: null,
      }
    : {
        avif55: `/data/releases/web/avif/${release.thumbnailFilename}_55.avif`,
        avif350: `/data/releases/web/avif/${release.thumbnailFilename}_350.avif`,
        avif540: `/data/releases/web/avif/${release.thumbnailFilename}_540.avif`,
        webp55: `/data/releases/web/webp/${release.thumbnailFilename}_55.webp`,
        webp350: `/data/releases/web/webp/${release.thumbnailFilename}_350.webp`,
        webp540: `/data/releases/web/webp/${release.thumbnailFilename}_540.webp`,
        jpg55: `/data/releases/web/jpg/${release.thumbnailFilename}_55.jpg`,
        jpg350: `/data/releases/web/jpg/${release.thumbnailFilename}_350.jpg`,
        jpg540: `/data/releases/web/jpg/${release.thumbnailFilename}_540.jpg`,
        png55: null, png350: null, png540: null,
      };

  const link = {
    to: `/${languageSlug}portfolio/${releaseId}/`,
    title: `${lang === 'en' ? 'Listen to ' : 'Lytt til '} ${release.title}`
  };

  return !release.unreleased
    ? (<React.Fragment>
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
        fullscreen ? renderInstrumentsList(releaseInstruments, lang) : ''
      }
      {
        fullscreen ? renderProductsList(releaseProducts, lang) : ''
      }
      {
        fullscreen ? renderLinkList(release, lang) : ''
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
          fullscreen ? renderInstrumentsList(releaseInstruments, lang) : ''
        }
        {
          fullscreen ? renderProductsList(releaseProducts, lang) : ''
        }
      </React.Fragment>
    );
}

export default Release;
