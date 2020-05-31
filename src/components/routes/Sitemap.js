// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter';
import {convertToXmlFriendlyString} from 'helpers/xmlStringFormatter';

// Data
import posts from 'data/posts';
import products from 'data/products';
import releases from 'data/portfolio';
import equipmentTypes from 'data/equipment';


class Sitemap extends Component {
  renderUrlElement(url){
    return `<url><loc>https://www.dehlimusikk.no/${url}</loc></url>\n`;
  }

  renderNewsUrlElement(url, post, languageKey){
    const date = new Date(post.timestamp);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1 }` : date.getMonth() + 1;
    const dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const dateString = `${dateYear}-${dateMonth}-${dateDay}`;
    return `  <url>
    <loc>https://www.dehlimusikk.no/${url}</loc>
    <news:news>
      <news:publication><news:name>Dehli Musikk</news:name><news:language>${languageKey}</news:language></news:publication>
      <news:publication_date>${dateString}</news:publication_date>
      <news:title>${post.title[languageKey]}</news:title>
    </news:news>
  </url>\n`;
  }

  renderImageUrlElement(image){
    const imageLicense = image.license ? `<image:license>${image.license}</image:license>` : '';
    const imageGeoLocation = image.geoLocation ? `<image:geo_location>${image.geoLocation}</image:geo_location>` : '';
    return `<image:image><image:loc>https://www.dehlimusikk.no${image.loc}</image:loc><image:title>${image.title}</image:title><image:caption>${image.caption}</image:caption>${imageLicense}${imageGeoLocation}</image:image>`;
  }

  renderImagePageUrlElement(url, images){
    let imageUrlElements = ''
    images.forEach(image => {
      imageUrlElements += this.renderImageUrlElement(image);
    })
    return `  <url>
    <loc>https://www.dehlimusikk.no/${url}</loc>
    ${imageUrlElements}
  </url>\n`;
  }

  renderHome(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}`;
    return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
  }

  renderPostsList(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/`;
    return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
  }

  renderProductsList(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}products/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}products/`;
    return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
  }

  renderReleasesList(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}portfolio/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}portfolio/`;
    return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
  }

  renderEquipmentTypesList() {
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}equipment/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}equipment/`;

    const equipmentTypeElements = [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)];
    if (equipmentTypes && Object.keys(equipmentTypes).length){
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        equipmentTypeElements.push(this.renderUrlElement(`${urlNorwegianPage}${equipmentTypeKey}/`));
        equipmentTypeElements.push(this.renderUrlElement(`${urlEnglishPage}${equipmentTypeKey}/`));
      })
    }
    return equipmentTypeElements;
  }

  renderPostsDetails() {
    return posts && posts.length
      ? posts.map(post => {
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
      })
      : '';
  }

  renderProductsDetails() {
    return products && products.length
      ? products.map(product => {
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}products/${convertToUrlFriendlyString(product.title)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}products/${convertToUrlFriendlyString(product.title)}/`;
        return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
      })
      : '';
  }

  renderReleasesDetails() {
    return releases && releases.length
      ? releases.map(release => {
        const relaseId = `${release.artistName} ${release.title}`;
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}portfolio/${convertToUrlFriendlyString(relaseId)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}portfolio/${convertToUrlFriendlyString(relaseId)}/`;
        return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
      })
      : '';
  }

  renderEquipmentDetails() {
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}equipment/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}equipment/`;

    const equipmentDetailsElements = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length){
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentItems = equipmentTypes[equipmentTypeKey].items;
        equipmentItems.forEach(item => {
          const itemId = `${item.brand} ${item.model}`;
          equipmentDetailsElements.push(this.renderUrlElement(`${urlNorwegianPage}${equipmentTypeKey}/${convertToUrlFriendlyString(itemId)}/`));
          equipmentDetailsElements.push(this.renderUrlElement(`${urlEnglishPage}${equipmentTypeKey}/${convertToUrlFriendlyString(itemId)}/`));
        })
      })
    }
    return equipmentDetailsElements;
  }

  getImagesFromPost(post, languageKey) {
    let images = [];
    const formats = ['webp', 'jpg'];
    const sizes = [55, 350, 540];
    formats.forEach(format => {
      const imagePath = `data/posts/thumbnails/web/${format}/${post.thumbnailFilename}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(post.thumbnailDescription),
          title: convertToXmlFriendlyString(post.title[languageKey])
        };
        if (post.copyright){
          image.license = 'https://creativecommons.org/licenses/by-sa/4.0/';
          image.geoLocation = 'Bø i Telemark, Norway';
        }
        images.push(image);
      })
    });
    return images;
  }

  getImagesFromProduct(product, languageKey) {
    let images = [];
    const formats = ['webp', 'jpg'];
    const sizes = [55, 350, 540];
    formats.forEach(format => {
      const imagePath = `data/products/thumbnails/web/${format}/${convertToUrlFriendlyString(product.title)}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(product.thumbnailDescription),
          title: convertToXmlFriendlyString(product.title),
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          geoLocation: 'Bø i Telemark, Norway'
        };
        images.push(image);
      })
    });
    return images;
  }

  getImagesFromEquipmentType(equipmentType, languageKey) {
    let images = [];
    const formats = ['webp', 'jpg'];
    const sizes = [350, 540, 945];

    formats.forEach(format => {
      const imagePath = `data/equipment/thumbnails/web/${format}/${equipmentType.equipmentType}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(equipmentType.name[languageKey]),
          title: convertToXmlFriendlyString(equipmentType.name[languageKey]),
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          geoLocation: 'Bø i Telemark, Norway'
        };
        images.push(image);
      })
    });
    return images;
  }

  getImagesFromEquipmentItem(equipmentItem, equipmentType) {
    let images = [];
    const formats = ['webp', 'jpg'];
    const sizes = [55, 350, 540, 945];

    const imageFileName = convertToUrlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`);
    formats.forEach(format => {
      const imagePath = `data/equipment/thumbnails/${equipmentType}/web/${format}/${imageFileName}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: convertToXmlFriendlyString(`${equipmentItem.model} by ${equipmentItem.brand}`),
          title: convertToXmlFriendlyString(`${equipmentItem.brand} ${equipmentItem.model}`),
          license: 'https://creativecommons.org/licenses/by-sa/4.0/',
          geoLocation: 'Bø i Telemark, Norway'
        };
        images.push(image);
      })
    });
    return images;
  }

  renderPostsListImages(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/`;
    let norwegianImages = [];
    let englishImages = [];
    if (posts && posts.length){
      posts.forEach(post => {
        norwegianImages = norwegianImages.concat(this.getImagesFromPost(post, 'no'));
        englishImages = englishImages.concat(this.getImagesFromPost(post, 'en'));
      })
    }
    return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
  }

  renderProductsListImages(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}products/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}products/`;
    let norwegianImages = [];
    let englishImages = [];
    if (products && products.length){
      products.forEach(product => {
        norwegianImages = norwegianImages.concat(this.getImagesFromProduct(product, 'no'));
        englishImages = englishImages.concat(this.getImagesFromProduct(product, 'en'));
      })
    }
    return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
  }

  renderEquipmentTypesListImages(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}equipment/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}equipment/`;
    let norwegianImages = [];
    let englishImages = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length){
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentType = equipmentTypes[equipmentTypeKey];
        norwegianImages = norwegianImages.concat(this.getImagesFromEquipmentType(equipmentType, 'no'));
        englishImages = englishImages.concat(this.getImagesFromEquipmentType(equipmentType, 'en'));
      })
    }
    return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
  }

  renderEquipmentListImages(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}equipment/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}equipment/`;
    const equipmentDetailsElements = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length){
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentItems = equipmentTypes[equipmentTypeKey].items;
        const urlNorwegianItemListPage = `${urlNorwegianPage}${equipmentTypeKey}/`;
        const urlEnglishItemListPage = `${urlEnglishPage}${equipmentTypeKey}/`;
        let images = [];
        equipmentItems.forEach(item => {
          images = images.concat(this.getImagesFromEquipmentItem(item, equipmentTypeKey));
        });
        equipmentDetailsElements.push(this.renderImagePageUrlElement(urlNorwegianItemListPage, images));
        equipmentDetailsElements.push(this.renderImagePageUrlElement(urlEnglishItemListPage, images));
      })
    }
    return equipmentDetailsElements;
  }

  renderPostsDetailsImages() {
    return posts && posts.length
      ? posts.map(post => {
        const norwegianImages = this.getImagesFromPost(post, 'no');
        const englishImages = this.getImagesFromPost(post, 'en');
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
      })
      : '';
  }

  renderProductsDetailsImages() {
    return products && products.length
      ? products.map(product => {
        const norwegianImages = this.getImagesFromProduct(product, 'no');
        const englishImages = this.getImagesFromProduct(product, 'en');
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}products/${convertToUrlFriendlyString(product.title)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}products/${convertToUrlFriendlyString(product.title)}/`;
        return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
      })
      : '';
  }

  renderEquipmentDetailsImages() {
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}equipment/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}equipment/`;

    const equipmentDetailsElements = [];
    if (equipmentTypes && Object.keys(equipmentTypes).length){
      Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
        const equipmentItems = equipmentTypes[equipmentTypeKey].items;
        equipmentItems.forEach(item => {
          const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
          const urlNorwegianItemPage = `${urlNorwegianPage}${equipmentTypeKey}/${itemId}/`;
          const urlEnglishItemPage = `${urlEnglishPage}${equipmentTypeKey}/${itemId}/`;
          const images = this.getImagesFromEquipmentItem(item, equipmentTypeKey);
          equipmentDetailsElements.push(this.renderImagePageUrlElement(urlNorwegianItemPage, images));
          equipmentDetailsElements.push(this.renderImagePageUrlElement(urlEnglishItemPage, images));
        })
      })
    }
    return equipmentDetailsElements;
  }

  renderNewsPostsDetails() {
    return posts && posts.length
      ? posts.map(post => {
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [this.renderNewsUrlElement(urlNorwegianPage, post, 'no'), this.renderNewsUrlElement(urlEnglishPage, post, 'en')]
      })
      : '';
  }


  render() {
      return (
        <div>

          <h2>sitemap.xml</h2>
          <pre>
          {`<?xml version="1.0" encoding="UTF-8"?>\n`}
          {`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`}
            {this.renderHome()}
            {this.renderPostsList()}
            {this.renderProductsList()}
            {this.renderReleasesList()}
            {this.renderEquipmentTypesList()}
            {this.renderPostsDetails()}
            {this.renderProductsDetails()}
            {this.renderReleasesDetails()}
            {this.renderEquipmentDetails()}
          {`</urlset>\n`}
          </pre>

          <hr />

          <h2>news-sitemap.xml</h2>
          <pre>
          {`<?xml version="1.0" encoding="UTF-8"?>\n`}
          {`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n`}
            {this.renderNewsPostsDetails()}
          {`</urlset>\n`}
          </pre>

          <hr />

          <h2>image-sitemap.xml</h2>
          <pre>
          {`<?xml version="1.0" encoding="UTF-8"?>\n`}
          {`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`}
            {this.renderPostsListImages()}
            {this.renderPostsDetailsImages()}
            {this.renderEquipmentTypesListImages()}
            {this.renderEquipmentListImages()}
            {this.renderEquipmentDetailsImages()}
            {this.renderProductsListImages()}
            {this.renderProductsDetailsImages()}
          {`</urlset>\n`}
          </pre>

        </div>)
  }
}

const mapStateToProps = state => ({selectedLanguageKey: state.selectedLanguageKey});

const mapDispatchToProps = {
  getLanguageSlug,
  updateMultilingualRoutes,
  updateSelectedLanguageKey
};

export default connect(mapStateToProps, mapDispatchToProps)(Sitemap);
