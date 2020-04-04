// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';

// Actions
import {getLanguageSlug, updateMultilingualRoutes, updateSelectedLanguageKey} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Data
import {allPosts} from 'data/posts';
import releases from 'data/portfolio';


class Sitemap extends Component {
  renderUrlElement(url){
    return `<url><loc>https://www.dehlimusikk.no/${url}</loc></url>\n`;
  }

  renderNewsUrlElement(url, post, languageKey){
    const date = new Date(post.timestamp);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1 }` : date.getMonth() + 1;
    const dateDay = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
    const dateString = `${date.getFullYear()}-${dateMonth}-${dateDay}`;
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

  renderPostsDetails() {
    return allPosts && allPosts.length
      ? allPosts.map(post => {
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
      })
      : '';
  }

  getImagesFromPost(post, languageKey) {
    let images = [];
    const formats = ['webp', 'jpg'];
    const sizes = [350, 540];
    const languageKeys = ['en', 'no'];
    formats.forEach(format => {
      const imagePath = `data/posts/thumbnails/web/${format}/${post.thumbnailFilename}`;
      sizes.forEach(size => {
        const imageLoc = require(`../../${imagePath}_${size}.${format}`);
        let image = {
          loc: imageLoc,
          caption: post.thumbnailDescription,
          title: post.title[languageKey]
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

  renderPostsListImages(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/`;
    let norwegianImages = [];
    let englishImages = [];
    if (allPosts && allPosts.length){
      allPosts.forEach(post => {
        norwegianImages = norwegianImages.concat(this.getImagesFromPost(post, 'no'));
        englishImages = englishImages.concat(this.getImagesFromPost(post, 'en'));
      })
    }
    return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
  }

  renderPostsDetailsImages() {
    return allPosts && allPosts.length
      ? allPosts.map(post => {
        const norwegianImages = this.getImagesFromPost(post, 'no');
        const englishImages = this.getImagesFromPost(post, 'en');
        const urlNorwegianPage = `${this.props.getLanguageSlug('no')}posts/${convertToUrlFriendlyString(post.title.no)}/`;
        const urlEnglishPage = `${this.props.getLanguageSlug('en')}posts/${convertToUrlFriendlyString(post.title.en)}/`;
        return [this.renderImagePageUrlElement(urlNorwegianPage, norwegianImages), this.renderImagePageUrlElement(urlEnglishPage, englishImages)]
      })
      : '';
  }

  renderReleasesList(){
    const urlNorwegianPage = `${this.props.getLanguageSlug('no')}portfolio/`;
    const urlEnglishPage = `${this.props.getLanguageSlug('en')}portfolio/`;
    return [this.renderUrlElement(urlNorwegianPage), this.renderUrlElement(urlEnglishPage)]
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

  renderNewsPostsDetails() {
    return allPosts && allPosts.length
      ? allPosts.map(post => {
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
            {this.renderReleasesList()}
            {this.renderPostsDetails()}
            {this.renderReleasesDetails()}
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
