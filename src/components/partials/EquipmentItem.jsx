// Dependencies
import React from 'react';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet-async';

// Components
import ExpansionPanel from '../template/ExpansionPanel';
import List from '../template/List';
import ListItem from '../template/List/ListItem';
import ListItemContent from '../template/List/ListItem/ListItemContent';
import ListItemContentHeader from '../template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from '../template/List/ListItem/ListItemThumbnail';
import Release from './Portfolio/Release';

// Selectors
import { getLanguageSlug } from '../../reducers/AvailableLanguagesReducer';

// Helpers
import { getInstrumentReleases } from '../../helpers/instrumentReleases';

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
    if (compact) {
        return (<React.Fragment>
            <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" />
            <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" />
            <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" />
            <img loading="lazy" src={image.jpg55} data-width="55" data-height="55" alt={itemName} />
        </React.Fragment>);
    } else if (fullscreen){
        return (<React.Fragment>
            <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" media='(max-width: 407px)' />
            <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" media='(max-width: 407px)' />
            <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" media='(max-width: 407px)' />
            <source srcSet={`${image.avif540} 1x, ${image.avif540} 2x`} type="image/avif" media='(max-width: 741px)' />
            <source srcSet={`${image.webp540} 1x, ${image.webp540} 2x`} type="image/webp" media='(max-width: 741px)' />
            <source srcSet={`${image.jpg540} 1x, ${image.jpg540} 2x`} type="image/jpg" media='(max-width: 741px)' />
            <source srcSet={`${image.avif945} 1x, ${image.avif945} 2x`} type="image/avif" />
            <source srcSet={`${image.webp945} 1x, ${image.webp945} 2x`} type="image/webp" />
            <source srcSet={`${image.jpg945} 1x, ${image.jpg945} 2x`} type="image/jpg" />
            <img fetchpriority="high" src={image.jpg945} data-width="945" data-height="700" alt={itemName} />
        </React.Fragment>);
    } else {
        return (<React.Fragment>
            <source srcSet={`${image.avif55} 1x, ${image.avif55} 2x`} type="image/avif" media='(max-width: 599px)' />
            <source srcSet={`${image.webp55} 1x, ${image.webp55} 2x`} type="image/webp" media='(max-width: 599px)' />
            <source srcSet={`${image.jpg55} 1x, ${image.jpg55} 2x`} type="image/jpg" media='(max-width: 599px)' />
            <source srcSet={`${image.avif350} 1x, ${image.avif350} 2x`} type="image/avif" />
            <source srcSet={`${image.webp350} 1x, ${image.webp350} 2x`} type="image/webp" />
            <source srcSet={`${image.jpg350} 1x, ${image.jpg350} 2x`} type="image/jpg" />
            <img loading="lazy" src={image.jpg350} data-width="350" data-height="260" alt={itemName} />
    </React.Fragment>);
    }
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
    avif55: require(`../../${imagePathAvif}_55.avif`)?.default,
    avif350: require(`../../${imagePathAvif}_350.avif`)?.default,
    avif540: require(`../../${imagePathAvif}_540.avif`)?.default,
    avif945: require(`../../${imagePathAvif}_945.avif`)?.default,
    webp55: require(`../../${imagePathWebp}_55.webp`)?.default,
    webp350: require(`../../${imagePathWebp}_350.webp`)?.default,
    webp540: require(`../../${imagePathWebp}_540.webp`)?.default,
    webp945: require(`../../${imagePathWebp}_945.webp`)?.default,
    jpg55: require(`../../${imagePathJpg}_55.jpg`)?.default,
    jpg350: require(`../../${imagePathJpg}_350.jpg`)?.default,
    jpg540: require(`../../${imagePathJpg}_540.jpg`)?.default,
    jpg945: require(`../../${imagePathJpg}_945.jpg`)?.default
  };
  const itemPath = `/${languageSlug}equipment/${itemType}/${itemId}/`;
  const itemName = `${item.brand} ${item.model}`;

  const link = {
    to: itemPath,
    title: itemName
  };

  return item
    ? (<React.Fragment>
      {
        fullscreen 
          ? <Helmet>
              <link rel="preload" as="image" href={image.avif350} fetchpriority="high" type="image/avif" media='(max-width: 407px)'/>
              <link rel="preload" as="image" href={image.avif540} fetchpriority="high" type="image/avif" media='(min-width: 408px) and (max-width: 741px)'/>
              <link rel="preload" as="image" href={image.avif945} fetchpriority="high" type="image/avif" media='(min-width: 742px)'/>
            </Helmet>
          : ""
      }
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
