// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {Helmet} from 'react-helmet';


// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Components
import Release from 'components/partials/Portfolio/Release';

// Template
import ExpansionPanel from 'components/template/ExpansionPanel';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';

// Helpers
import {getInstrumentReleases} from 'helpers/instrumentReleases';

class EquipmentItem extends Component {

  renderEquipmentItemImagesSnippet(images){
    const snippet = Object.keys(images).map(format => {
      const imagePath = images[format];
      return {
        "@context": "http://schema.org",
        "@type": "ImageObject",
        "url": `https://www.dehlimusikk.no${imagePath}`,
        "contentUrl": `https://www.dehlimusikk.no${imagePath}`,
        "license": "https://creativecommons.org/licenses/by/4.0/legalcode",
        "acquireLicensePage": "https://www.dehlimusikk.no/#contact"
      }
    });

    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>);
  }

  renderPostThumbnail(image, itemName, fullscreen, compact) {
    const copyrightString = 'cc-by 2020 Benjamin Dehli dehlimusikk.no';
    const imageSize = compact
      ? '55px'
      : fullscreen
        ? '945px'
        : '350px';
    return (<React.Fragment>
        <source sizes={imageSize} srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w, ${image.webp945} 945w`} type="image/webp"/>
        <source sizes={imageSize} srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`} type="image/jpg"/>
        <img loading="lazy" src={image.jpg350} width="350" height="260" alt={itemName} copyright={copyrightString} />
    </React.Fragment>);
  }

  renderReleasesList(releases, selectedLanguageKey, item) {
    if (releases && releases.length){
      const listItems = releases.map(release => {
        return (<ListItem key={release.releaseId} compact={true}>
                  <Release release={release} compact={true}/>
                </ListItem>)
      });
      return (
        <ExpansionPanel panelTitle={selectedLanguageKey === 'en' ? `Recordings with the ${item.brand} ${item.model}` : `Utgivelser med ${item.brand} ${item.model}`}>
          <List compact={true}>
            {listItems}
          </List>
        </ExpansionPanel>
      );
    } else {
      return '';
    }
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const item = this.props.item;
    const itemId = this.props.itemId;
    const itemType = this.props.itemType;

    const imagePathWebp = `data/equipment/thumbnails/${itemType}/web/webp/${itemId}`;
    const imagePathJpg = `data/equipment/thumbnails/${itemType}/web/jpg/${itemId}`;
    const image = {
      webp55: require(`../../${imagePathWebp}_55.webp`).default,
      webp350: require(`../../${imagePathWebp}_350.webp`).default,
      webp540: require(`../../${imagePathWebp}_540.webp`).default,
      webp945: require(`../../${imagePathWebp}_945.webp`).default,
      jpg55: require(`../../${imagePathJpg}_55.jpg`).default,
      jpg350: require(`../../${imagePathJpg}_350.jpg`).default,
      jpg540: require(`../../${imagePathJpg}_540.jpg`).default,
      jpg945: require(`../../${imagePathJpg}_945.jpg`).default
    };
    const itemPath = `/${this.props.getLanguageSlug(selectedLanguageKey)}equipment/${itemType}/${itemId}/`;
    const itemName = `${item.brand} ${item.model}`;

    const link = {
      to: itemPath,
      title: itemName
    };

    return item
      ? (<React.Fragment>
          {this.props.fullscreen ? this.renderEquipmentItemImagesSnippet(image) : ''}
          <ListItemThumbnail fullscreen={this.props.fullscreen} link={link} compact={this.props.compact}>
            {this.renderPostThumbnail(image, itemName, this.props.fullscreen, this.props.compact)}
          </ListItemThumbnail>
          <ListItemContent fullscreen={this.props.fullscreen}>
            <ListItemContentHeader fullscreen={this.props.fullscreen} link={link}>
                <h2>
                  {item.model}
                  <span>{item.brand}</span>
                </h2>
            </ListItemContentHeader>
        </ListItemContent>
        {
          this.props.fullscreen && itemType === 'instruments' ? this.renderReleasesList(getInstrumentReleases(itemId), selectedLanguageKey, item) : ''
        }
      </React.Fragment>)
      : '';
  }
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

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(EquipmentItem);
