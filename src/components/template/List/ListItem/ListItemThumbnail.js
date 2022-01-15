// Dependencies
import { Link } from 'react-router-dom';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemThumbnail.module.scss';

const ListItemThumbnail = ({ fullscreen, compact, link, children }) => {

  const childElements = (
    <figure className={`${style.listItemThumbnail} ${fullscreen ? style.fullscreen : ''} ${compact ? style.compact : ''}`}>
      <picture>{children}</picture>
    </figure>
  );

  return link && !fullscreen
    ? <Link to={link.to} title={link.title} tabIndex="-1">{childElements}</Link>
    : childElements;

};


export default ListItemThumbnail;
