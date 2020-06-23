// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Stylesheets
import style from 'components/partials/NavigationBar/SearchField.module.scss';

// Data
import releases from 'data/portfolio';
import posts from 'data/posts';
import products from 'data/products';
import equipmentTypes from 'data/equipment';

class SearchField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showResultsList: false,
      results: null
    };
    this.setResultsListWrapperRef = this.setResultsListWrapperRef.bind(this);
    this.handleClickOutsideResultsList = this.handleClickOutsideResultsList.bind(this);
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutsideResultsList);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutsideResultsList);
  }

  componentDidUpdate(prevProps){

  }

  setResultsListWrapperRef(node) {
    this.resultsListWrapperRef = node;
  }

  renderReleaseThumbnail(thumbnailPaths, alt) {
    return (<picture>
      <source sizes='55' srcSet={`${thumbnailPaths.webp} 55w`} type="image/webp"/>
      <source sizes='55' srcSet={`${thumbnailPaths.jpg} 55w`} type="image/jpg"/>
      <img src={thumbnailPaths.jpg} width='55' height='55' alt={alt}/>
    </picture>);
  }

  getSearchPointsFromRelease(release, searchStringWords){
    const selectedLanguageKey = this.props.selectedLanguageKey;

    const id = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
    const link = `/${this.props.getLanguageSlug(selectedLanguageKey)}portfolio/${id}/`;
    const linkTitle = `${selectedLanguageKey === 'en' ? 'Listen to' : 'Lytt til'} ${release.title}`;

    let artistNamePoints = 0;
    let titlePoints = 0;
    let genrePoints = 0;

    searchStringWords.forEach(searchStringWord => {
      const regex = new RegExp(searchStringWord, "gi");

      const artistNameMatch = release.artistName.match(regex);
      const titleMatch = release.title.match(regex);
      const genreMatch = release.genre.match(regex);

      artistNamePoints += artistNameMatch ? artistNameMatch.length * 15 : 0;
      titlePoints += titleMatch ? titleMatch.length * 15 : 0;
      genrePoints += genreMatch ? genreMatch.length * 5 : 0;
    });

    const points = (artistNamePoints + titlePoints + genrePoints) / searchStringWords.length;

    const thumbnailPaths = {
      webp: require(`../../../data/releases/thumbnails/web/webp/${release.thumbnailFilename}_55.webp`),
      jpg: require(`../../../data/releases/thumbnails/web/jpg/${release.thumbnailFilename}_55.jpg`)
    };
    const thumbnailDescription = selectedLanguageKey === 'en' ? `Cover image for ${release.title} by ${release.artistName}` : `Coverbilde til ${release.title} av ${release.artistName}`;

    return {
      type: 'release',
      text: `${release.artistName} - ${release.title} (${release.genre})`,
      label: selectedLanguageKey === 'en' ? 'Releases' : 'Utgivelser',
      thumbnailPaths,
      thumbnailDescription,
      points,
      link,
      linkTitle
    }
  }

  getSearchResultsFromReleases(releases, searchStringWords){
    const searchResultsFromReleases = releases.map(release => {
      return this.getSearchPointsFromRelease(release, searchStringWords);
    })
    return searchResultsFromReleases.filter(result => {
      return result.points && result.points >= 1;
    });
  }

  getSearchPointsFromPost(post, searchStringWords){
    const selectedLanguageKey = this.props.selectedLanguageKey;

    const id = convertToUrlFriendlyString(post.title[selectedLanguageKey]);
    const link = `/${this.props.getLanguageSlug(selectedLanguageKey)}posts/${id}/`;
    const linkTitle = post.title[selectedLanguageKey];

    let titlePoints = 0;
    let contentPoints = 0;

    searchStringWords.forEach(searchStringWord => {
      const regex = new RegExp(searchStringWord, "gi");

      const titleMatch = post.title[selectedLanguageKey].match(regex);
      const contentMatch = post.content[selectedLanguageKey].match(regex);

      titlePoints += titleMatch ? titleMatch.length * 5 : 0;
      contentPoints += contentMatch ? contentMatch.length : 0;
    });

    const points = (titlePoints + contentPoints) / searchStringWords.length;

    const thumbnailPaths = {
      webp: require(`../../../data/posts/thumbnails/web/webp/${post.thumbnailFilename}_55.webp`),
      jpg: require(`../../../data/posts/thumbnails/web/jpg/${post.thumbnailFilename}_55.jpg`)
    };
    const thumbnailDescription = post.thumbnailDescription;

    return {
      type: 'post',
      text: post.title[selectedLanguageKey],
      label: selectedLanguageKey === 'en' ? 'Posts' : 'Innlegg',
      thumbnailPaths,
      thumbnailDescription,
      points,
      link,
      linkTitle
    }
  }

  getSearchResultsFromPosts(posts, searchStringWords){
    const searchResultsFromPosts = posts.map(post => {
      return this.getSearchPointsFromPost(post, searchStringWords);
    })
    return searchResultsFromPosts.filter(result => {
      return result.points && result.points >= 1;
    });
  }

  getSearchPointsFromProduct(product, searchStringWords){
    const selectedLanguageKey = this.props.selectedLanguageKey;

    const id = convertToUrlFriendlyString(product.title);
    const link = `/${this.props.getLanguageSlug(selectedLanguageKey)}products/${id}/`;
    const linkTitle = product.title;

    let titlePoints = 0;
    let contentPoints = 0;

    searchStringWords.forEach(searchStringWord => {
      const regex = new RegExp(searchStringWord, "gi");

      const titleMatch = product.title.match(regex);
      const contentMatch = product.content[selectedLanguageKey].match(regex);

      titlePoints += titleMatch ? titleMatch.length * 10 : 0;
      contentPoints += contentMatch ? contentMatch.length*2 : 0;
    });

    const points = (titlePoints + contentPoints) / searchStringWords.length;

    const thumbnailPaths = {
      webp: require(`../../../data/products/thumbnails/web/webp/${id}_55.webp`),
      jpg: require(`../../../data/products/thumbnails/web/jpg/${id}_55.jpg`)
    };
    const thumbnailDescription = linkTitle;

    return {
      type: 'product',
      text: product.title,
      label: selectedLanguageKey === 'en' ? 'Products' : 'Produkter',
      thumbnailPaths,
      thumbnailDescription,
      points,
      link,
      linkTitle
    }
  }

  getSearchResultsFromProducts(products, searchStringWords){
    const searchResultsFromProducts = products.map(product => {
      return this.getSearchPointsFromProduct(product, searchStringWords);
    })
    return searchResultsFromProducts.filter(result => {
      return result.points && result.points >= 1;
    });
  }

  getSearchPointsFromEquipmentItems(item, equipmentType, equipmentTypeKey, searchStringWords){
    const selectedLanguageKey = this.props.selectedLanguageKey;

    const id = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
    const link = `/${this.props.getLanguageSlug(selectedLanguageKey)}equipment/${equipmentTypeKey}/${id}/`;
    const linkTitle = `${item.brand} ${item.model}`;

    let brandPoints = 0;
    let modelPoints = 0;
    let equipmentTypePoints = 0;

    searchStringWords.forEach(searchStringWord => {
      const regex = new RegExp(searchStringWord, "gi");

      const brandMatch = item.brand.match(regex);
      const modelMatch = item.model.match(regex);
      const equipmentTypeMatch = equipmentType.name[selectedLanguageKey].match(regex);

      brandPoints += brandMatch ? brandMatch.length * 7 : 0;
      modelPoints += modelMatch ? modelMatch.length * 7 : 0;
      equipmentTypePoints += equipmentTypeMatch ? equipmentTypeMatch.length * 1 : 0;
    });

    const points = (brandPoints + modelPoints + equipmentTypePoints) / searchStringWords.length;

    const thumbnailPaths = {
      webp: require(`../../../data/equipment/thumbnails/${equipmentTypeKey}/web/webp/${id}_55.webp`),
      jpg: require(`../../../data/equipment/thumbnails/${equipmentTypeKey}/web/jpg/${id}_55.jpg`)
    };
    const thumbnailDescription = `${item.brand} ${item.model}`;

    return {
      type: equipmentTypeKey,
      text: `${item.brand} ${item.model}`,
      label: equipmentType.name[selectedLanguageKey],
      thumbnailPaths,
      thumbnailDescription,
      points,
      link,
      linkTitle
    };
  }

  getSearchResultsFromEquipmentType(equipmentType, equipmentTypeKey, searchStringWords){
    const searchResultsFromEquipmentItems = equipmentType.items.map(item => {
      return this.getSearchPointsFromEquipmentItems(item, equipmentType, equipmentTypeKey, searchStringWords);
    })
    return searchResultsFromEquipmentItems.filter(result => {
      return result.points && result.points >= 1;
    });
  }

  getSearchResultsFromEquipmentTypes(equipmentTypes, searchStringWords){
    let searchResultsFromEquipmentTypes = [];
    Object.keys(equipmentTypes).forEach(equipmentTypeKey => {
      const equipmentType = equipmentTypes[equipmentTypeKey];
      const searchResultsFromEquipmentType = this.getSearchResultsFromEquipmentType(equipmentType, equipmentTypeKey, searchStringWords);
      searchResultsFromEquipmentTypes = searchResultsFromEquipmentTypes.concat(searchResultsFromEquipmentType);
    })
    return searchResultsFromEquipmentTypes;
  }

  handleShowResultsList(event) {
    let searchString = event.target.value.replace(/[^a-å0-9- ]+/ig, ""); // Removes unwanted characters
    searchString = searchString.replace(/\s\s+/g, ' '); // Remove redundant whitespace
    const searchStringWords = searchString.split(" ").filter(searchStringWord => {
      return searchStringWord.length > 1;
    });
    if (searchString.length > 1) {
      const searchResultsFromReleases = this.getSearchResultsFromReleases(releases, searchStringWords);
      const searchResultsFromPosts = this.getSearchResultsFromPosts(posts, searchStringWords);
      const searchResultsFromProducts = this.getSearchResultsFromProducts(products, searchStringWords);
      const searchResultsFromEquipmentTypes = this.getSearchResultsFromEquipmentTypes(equipmentTypes, searchStringWords);
      const results = searchResultsFromReleases.concat(searchResultsFromPosts, searchResultsFromProducts, searchResultsFromEquipmentTypes);

      this.setState({
        showResultsList: true,
        results: results.sort((a, b) => b.points - a.points)
      });

    } else {
      this.hideResultsList();
    }
  }

  handleClickOutsideResultsList(event) {
    if (this.resultsListWrapperRef && !this.resultsListWrapperRef.contains(event.target) && this.state.showResultsList) {
      this.hideResultsList();
    }
  }


  hideResultsList() {
    this.setState({showResultsList: false});
  }

  renderResultsList(results, selectedLanguageKey) {
    if (results && results.length) {
      const itemTypeIcons = {
        post: ['fas', 'photo-video'],
        product: ['fas', 'shopping-cart'],
        release: ['fas', 'music'],
        instruments: ['fas', 'guitar'],
        amplifiers: ['fas', 'bullhorn'],
        effects: ['fas', 'sliders-h']
      };
      const resultsElements = results.map((result, resultKey) => {
        return (<a href={result.link} title={result.linkTitle} key={resultKey} className={style.resultsListItem}>
          {result.thumbnailPaths && result.thumbnailDescription ? this.renderReleaseThumbnail(result.thumbnailPaths, result.thumbnailDescription) : ''}
          <span className={style.resultsListItemText}>{result.text}</span>
          <span className={`${style.resultsListItemTypeLabel} ${style[result.type]}`}><span><FontAwesomeIcon icon={itemTypeIcons[result.type]}/> {result.label}</span></span>
        </a>)
      });
      return resultsElements;
    } else {
      return (<span className={style.resultsListItem}>{selectedLanguageKey === 'en' ? 'No results' : 'Ingen resultat'}</span>);
    }
  }

  render() {
    return (<React.Fragment>
      <div className={style.searchFieldContainer}>
        <FontAwesomeIcon icon={['fas', 'search']}/>
        <label htmlFor="search" className={style.hidden}>{this.props.selectedLanguageKey === 'en' ? 'Search' : 'Søk'}</label>
        <input type="search" autoComplete="off" id="search" onChange={(event) => this.handleShowResultsList(event)} placeholder={this.props.selectedLanguageKey === 'en' ? 'Search' : 'Søk'} className={style.searchField} />
      </div>
      <div className={`${style.resultsListContainer} ${this.state.showResultsList
          ? style.active
          : ''}`}>
        <div ref={this.setResultsListWrapperRef} className={style.resultsList}>
          {this.renderResultsList(this.state.results, this.props.selectedLanguageKey)}
        </div>
      </div>
    </React.Fragment>)
  }
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey,
  location: state.router.location
});

const mapDispatchToProps = {
  getLanguageSlug
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchField);
