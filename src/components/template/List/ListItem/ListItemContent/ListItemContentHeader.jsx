// Dependencies
import { Link } from 'react-router-dom';

// Stylesheets
import style from './ListItemContentHeader.module.scss';

const ListItemContentHeader = ({ fullscreen, link, children }) => {

  const renderContent = (link, children) => {
    return link && !fullscreen
      ? (<Link to={link.to} title={link.title} data-tabable={true}>{children}</Link>)
      : children
  }

  return (
    <header className={`${style.listItemContentHeader} ${fullscreen ? style.fullscreen : ''}`}>
      {renderContent(link, children)}
    </header>
  )
};

export default ListItemContentHeader;
