// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Components
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';

// Stylesheets
import style from 'components/partials/SearchResult.module.scss';


const SearchResult = ({ searchResult }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)

  const renderThumbnail = (thumbnailPaths, alt) => {
    return (<picture>
      <source sizes='55' srcSet={`${thumbnailPaths.webp} 55w`} type="image/webp" />
      {thumbnailPaths.jpg ? <source sizes='55' srcSet={`${thumbnailPaths.jpg} 55w`} type="image/jpg" /> : ''}
      {thumbnailPaths.png ? <source sizes='55' srcSet={`${thumbnailPaths.png} 55w`} type="image/png" /> : ''}
      <img src={thumbnailPaths.jpg ? thumbnailPaths.jpg : thumbnailPaths.png} width='55' height='55' alt={alt} />
    </picture>);
  }

  if (searchResult) {
    const itemTypeIcons = {
      post: ['fas', 'photo-video'],
      video: ['fas', 'film'],
      product: ['fas', 'shopping-cart'],
      release: ['fas', 'music'],
      instruments: ['fas', 'guitar'],
      amplifiers: ['fas', 'bullhorn'],
      effects: ['fas', 'sliders-h'],
      faq: ['fas', 'comments']
    };

    const link = {
      to: searchResult.link,
      title: searchResult.linkTitle
    };

    return (<React.Fragment>
      <ListItemThumbnail link={link} compact={true}>
        {searchResult.thumbnailPaths && searchResult.thumbnailDescription ? renderThumbnail(searchResult.thumbnailPaths, searchResult.thumbnailDescription) : ''}
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

export default SearchResult;
