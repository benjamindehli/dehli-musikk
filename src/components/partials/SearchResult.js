// Dependencies
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faPhotoFilm,
    faFilm,
    faCartShopping,
    faMusic,
    faGuitar,
    faBullhorn,
    faSliders,
    faComments
} from '@fortawesome/free-solid-svg-icons';

// Components
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentBody from 'components/template/List/ListItem/ListItemContent/ListItemContentBody';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';

// Stylesheets
import style from 'components/partials/SearchResult.module.scss';


const SearchResult = ({ searchResult, lang }) => {

  // The box is a fixed 55px, so the candidates vary by pixel ratio rather than by
  // layout width: x descriptors, and no sizes attribute to get wrong.
  const renderThumbnail = (thumbnailPaths, alt) => {
    return (<picture>
      <source srcSet={`${thumbnailPaths.avif} 1x, ${thumbnailPaths.avif110} 2x`} type="image/avif" />
      <source srcSet={`${thumbnailPaths.webp} 1x, ${thumbnailPaths.webp110} 2x`} type="image/webp" />
      {thumbnailPaths.jpg ? <source srcSet={`${thumbnailPaths.jpg} 1x, ${thumbnailPaths.jpg110} 2x`} type="image/jpeg" /> : ''}
      {thumbnailPaths.png ? <source srcSet={`${thumbnailPaths.png} 1x, ${thumbnailPaths.png110} 2x`} type="image/png" /> : ''}
      <img src={thumbnailPaths.jpg ? thumbnailPaths.jpg : thumbnailPaths.png} width='55' height='55' alt={alt} />
    </picture>);
  }

  if (searchResult) {
    const itemTypeIcons = {
      post: faPhotoFilm,
      video: faFilm,
      product: faCartShopping,
      release: faMusic,
      instruments: faGuitar,
      amplifiers: faBullhorn,
      effects: faSliders,
      faq: faComments
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
    return (<span className={style.resultsListItem}>{lang === 'en' ? 'No results' : 'Ingen resultat'}</span>);
  }
}

export default SearchResult;
