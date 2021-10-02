// Dependencies
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Actions
import { getLanguageSlug } from 'actions/LanguageActions';
import { updateSearchResults } from 'actions/SearchResultsActions';

// Components
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';

// Stylesheets
import style from 'components/partials/SearchResult.module.scss';


class SearchResult extends Component {

  renderThumbnail(thumbnailPaths, alt) {
    return (<picture>
      <source sizes='55' srcSet={`${thumbnailPaths.webp} 55w`} type="image/webp" />
      {thumbnailPaths.jpg ? <source sizes='55' srcSet={`${thumbnailPaths.jpg} 55w`} type="image/jpg" /> : ''}
      {thumbnailPaths.png ? <source sizes='55' srcSet={`${thumbnailPaths.png} 55w`} type="image/png" /> : ''}
      <img src={thumbnailPaths.jpg ? thumbnailPaths.jpg : thumbnailPaths.png} width='55' height='55' alt={alt} />
    </picture>);
  }

  render() {
    const searchResult = this.props.searchResult;
    const selectedLanguageKey = this.props.selectedLanguageKey;
    if (searchResult) {
      const itemTypeIcons = {
        post: ['fas', 'photo-video'],
        video: ['fas', 'film'],
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
              <span><FontAwesomeIcon icon={itemTypeIcons[searchResult.type]} /> {searchResult.label}</span>
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
