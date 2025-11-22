// Dependencies
import React from 'react';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

// Components
import ExpansionPanel from 'components/template/ExpansionPanel';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import Release from 'components/partials/Portfolio/Release';

// Selectors
import { getLanguageSlug } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { getInstrumentReleases } from 'helpers/instrumentReleases';

const EquipmentItem = ({ fullscreen, compact, item, itemType, itemId }) => {


  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)
  const languageSlug = useSelector(state => getLanguageSlug(state));


  const renderEquipmentItemImagesSnippet = (images) => {
    const snippet = Object.keys(images).map(format => {
      const imagePath = images[format];
      return {
        "@context": "http://schema.org",
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${imagePath}`,
        "contentUrl": `https://www.dehlimusikk.no${imagePath}`,
        "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "acquireLicensePage": "https://www.dehlimusikk.no/#contact",
        "copyrightNotice": "Benjamin Dehli",
        "creditText": "Dehli Musikk",
        "creator": {
          "@id": "https://www.dehlimusikk.no/artists/benjamin-dehli"
        }
      }
    });
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>);
  }

  const renderEquipmentItemSnippet = (item, images) => {

    const imagePath = images['jpg945'];
    const itemName = `${item.brand} ${item.model}`;

    const snippet = {
      "@context": "http://schema.org",
      "@type": "Thing",
      "@id": `https://www.dehlimusikk.no/equipment/${itemType}/${itemId}/`,
      "name": itemName,
      "image": `https://www.dehlimusikk.no${imagePath}`,
      "description": itemName
    }

    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>);
  }

  const renderPostThumbnail = (image, itemName, fullscreen, compact) => {
    const imageSize = compact
      ? '55px'
      : fullscreen
        ? '945px'
        : '350px';

    const srcSets = {
      avif: `${image.avif55} 55w, ${image.avif350} 350w ${fullscreen ? `, ${image.avif540} 540w, ${image.avif945} 945w` : ""}`,
      webp: `${image.webp55} 55w, ${image.webp350} 350w ${fullscreen ? `, ${image.webp540} 540w, ${image.webp945} 945w` : ""}`,
      jpg: `${image.jpg55} 55w, ${image.jpg350} 350w ${fullscreen ? `, ${image.jpg540} 540w, ${image.jpg945} 945w` : ""}`
    };

    return (<React.Fragment>
      <source sizes={imageSize} srcSet={srcSets.avif} type="image/avif" />
      <source sizes={imageSize} srcSet={srcSets.webp} type="image/webp" />
      <source sizes={imageSize} srcSet={srcSets.jpg} type="image/jpg" />
      <img loading="lazy" src={image.jpg350} width="350" height="260" alt={itemName} />
    </React.Fragment>);
  }

  const renderReleasesList = (releases, selectedLanguageKey, item) => {
    const elementId = `equipment-item-releases-${item.equipmentItemId}`;
    if (releases && releases.length) {
      const listItems = releases.map(release => {
        return (<ListItem key={release.releaseId} compact={true}>
          <Release release={release} compact={true} />
        </ListItem>)
      });
      return (
        <ExpansionPanel elementId={elementId} panelTitle={selectedLanguageKey === 'en' ? `Recordings with the ${item.brand} ${item.model}` : `Utgivelser med ${item.brand} ${item.model}`}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    } else {
      return '';
    }
  }


  const imagePathAvif = `data/equipment/thumbnails/${itemType}/web/avif/${itemId}`;
  const imagePathWebp = `data/equipment/thumbnails/${itemType}/web/webp/${itemId}`;
  const imagePathJpg = `data/equipment/thumbnails/${itemType}/web/jpg/${itemId}`;
  const image = {
    avif55: require(`../../${imagePathAvif}_55.avif`),
    avif350: require(`../../${imagePathAvif}_350.avif`),
    avif540: require(`../../${imagePathAvif}_540.avif`),
    avif945: require(`../../${imagePathAvif}_945.avif`),
    webp55: require(`../../${imagePathWebp}_55.webp`),
    webp350: require(`../../${imagePathWebp}_350.webp`),
    webp540: require(`../../${imagePathWebp}_540.webp`),
    webp945: require(`../../${imagePathWebp}_945.webp`),
    jpg55: require(`../../${imagePathJpg}_55.jpg`),
    jpg350: require(`../../${imagePathJpg}_350.jpg`),
    jpg540: require(`../../${imagePathJpg}_540.jpg`),
    jpg945: require(`../../${imagePathJpg}_945.jpg`)
  };
  const itemPath = `/${languageSlug}equipment/${itemType}/${itemId}/`;
  const itemName = `${item.brand} ${item.model}`;

  const link = {
    to: itemPath,
    title: itemName
  };

  return item
    ? (<React.Fragment>
      {fullscreen ? renderEquipmentItemImagesSnippet(image) : ''}
      {fullscreen ? renderEquipmentItemSnippet(item, image) : ''}
      <ListItemThumbnail fullscreen={fullscreen} link={link} compact={compact}>
        {renderPostThumbnail(image, itemName, fullscreen, compact)}
      </ListItemThumbnail>
      <ListItemContent fullscreen={fullscreen}>
        <ListItemContentHeader fullscreen={fullscreen} link={link}>
          {
            fullscreen ? <h1>{item.model}<span>{item.brand}</span></h1> : <h2>{item.model}<span>{item.brand}</span></h2>
          }
        </ListItemContentHeader>
      </ListItemContent>
      {
        fullscreen && itemType === 'instruments' ? renderReleasesList(getInstrumentReleases(itemId), selectedLanguageKey, item) : ''
      }
    </React.Fragment>)
    : '';
}

EquipmentItem.propTypes = {
  fullscreen: PropTypes.bool,
  compact: PropTypes.bool,
  item: PropTypes.exact({
    brand: PropTypes.string,
    model: PropTypes.string,
    equipmentItemId: PropTypes.string,
    nextEquipmentItemId: PropTypes.string,
    previousEquipmentItemId: PropTypes.string
  })
};

EquipmentItem.defaultProps = {
  fullscreen: false,
  compact: false
};

const mapStateToProps = state => ({ selectedLanguageKey: state.selectedLanguageKey });

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(EquipmentItem);
