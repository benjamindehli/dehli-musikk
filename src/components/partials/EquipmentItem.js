// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Helpers
import {getPrettyDate} from 'helpers/dateFormatter';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Components
import Button from 'components/partials/Button';

// Stylesheets
import style from 'components/partials/Post.module.scss';

class EquipmentItem extends Component {

  renderPostThumbnail(image, itemName, fullscreen, itemPath) {
    const copyrightString = 'cc-by 2020 Benjamin Dehli dehlimusikk.no';
    const thumbnailElement = (<figure className={style.thumbnail}>
      <picture>
        <source sizes={fullscreen
            ? '540px'
            : '175px'} srcSet={`${image.webp350} 350w, ${image.webp540} 540w, ${image.webp945} 945w`} type="image/webp"/>
        <source sizes={fullscreen
            ? '540px'
            : '175px'} srcSet={`${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`} type="image/jpg"/>
        <img loading="lazy" src={image.jpg350} alt={itemName} copyright={copyrightString} />
      </picture>
    </figure>);
    return fullscreen
      ? thumbnailElement
      : (<Link to={itemPath} title={itemName}>{thumbnailElement}</Link>);
  }

  render() {
    const selectedLanguageKey = this.props.selectedLanguageKey
      ? this.props.selectedLanguageKey
      : 'no';
    const item = this.props.item;
    const itemId = this.props.itemId;
    const itemType = this.props.itemType;
    const hasImage = this.props.item.hasImage;

    const imagePathWebp = `data/equipment/thumbnails/web/webp/${itemId}`;
    const imagePathJpg = `data/equipment/thumbnails/web/jpg/${itemId}`;
    const image = hasImage ? {
      webp350: require(`../../${imagePathWebp}_350.webp`),
      webp540: require(`../../${imagePathWebp}_540.webp`),
      webp945: require(`../../${imagePathWebp}_945.webp`),
      jpg350: require(`../../${imagePathJpg}_350.jpg`),
      jpg540: require(`../../${imagePathJpg}_540.jpg`),
      jpg945: require(`../../${imagePathJpg}_945.jpg`)
    } : null;
    const itemPath = `/${this.props.getLanguageSlug(this.props.selectedLanguageKey)}equipment/${itemType}/${itemId}/`;
    const itemName = `${item.brand} ${item.model}`;
    return item
      ? (<article className={`${style.gridItem} ${this.props.fullscreen
          ? style.fullscreen
          : ''}`}>
        {hasImage ? this.renderPostThumbnail(image, itemName, this.props.fullscreen, itemPath) : ''}
        <div className={style.contentContainer}>
          <div className={style.content}>
            <div className={style.header}>
              {
                this.props.fullscreen
                  ? (<h2>{item.model}<small>{item.brand}</small></h2>)
                  : (<Link to={itemPath} title={itemName}>
                    <h2>{item.model}<small>{item.brand}</small></h2>
                  </Link>)
              }
            </div>
            <div className={style.body}>
            </div>
          </div>
        </div>
      </article>)
      : '';
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(EquipmentItem);
