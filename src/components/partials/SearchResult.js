// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Redirect} from 'react-router-dom';

// Actions
import {getLanguageSlug} from 'actions/LanguageActions';
import {updateSearchResults} from 'actions/SearchResultsActions';

// Helpers
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

// Template
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';

// Stylesheets
import style from 'components/partials/SearchResult.module.scss';

// Data
import releases from 'data/portfolio';
import posts from 'data/posts';
import products from 'data/products';
import equipmentTypes from 'data/equipment';

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidUpdate(prevProps){
  }

  setResultsListWrapperRef(node) {
  }

  renderThumbnail(thumbnailPaths, alt) {
    return (<picture>
      <source sizes='55' srcSet={`${thumbnailPaths.webp} 55w`} type="image/webp"/>
      <source sizes='55' srcSet={`${thumbnailPaths.jpg} 55w`} type="image/jpg"/>
      <img src={thumbnailPaths.jpg} width='55' height='55' alt={alt}/>
    </picture>);
  }



  renderResultsList(results, selectedLanguageKey) {

  }

  render() {
    const searchResult = this.props.searchResult;
    const selectedLanguageKey = this.props.selectedLanguageKey;
    if (searchResult) {
      const itemTypeIcons = {
        post: ['fas', 'photo-video'],
        product: ['fas', 'shopping-cart'],
        release: ['fas', 'music'],
        instruments: ['fas', 'guitar'],
        amplifiers: ['fas', 'bullhorn'],
        effects: ['fas', 'sliders-h']
      };

      const link = {
        to: searchResult.link,
        title: searchResult.linkTitle
      };

      return (<React.Fragment>
        <ListItemThumbnail link={link} compact={true}>
          {searchResult.thumbnailPaths && searchResult.thumbnailDescription ? this.renderThumbnail(searchResult.thumbnailPaths, searchResult.thumbnailDescription) : ''}
        </ListItemThumbnail>
        <ListItemContent>
          <div className={style.searchResultContent}>
            <div className={style.searchResultContentText}>
              <ListItemContentHeader link={link}>
                <h2>{searchResult.text}</h2>
              </ListItemContentHeader>
              <ListItemContentBody>
                {searchResult.excerpt}
              </ListItemContentBody>
            </div>
            <div className={`${style.searchResultContentBadge} ${style[searchResult.type]}`}>
              <span><FontAwesomeIcon icon={itemTypeIcons[searchResult.type]}/> {searchResult.label}</span>
            </div>
          </div>
        </ListItemContent>
      </React.Fragment>)

    } else {
      return (<span className={style.resultsListItem}>{selectedLanguageKey === 'en' ? 'No results' : 'Ingen resultat'}</span>);
    }
  }
}

const mapStateToProps = state => ({
  selectedLanguageKey: state.selectedLanguageKey,
  location: state.router.location
});

const mapDispatchToProps = {
  getLanguageSlug,
  updateSearchResults
};

export default connect(mapStateToProps, mapDispatchToProps)(SearchResult);
