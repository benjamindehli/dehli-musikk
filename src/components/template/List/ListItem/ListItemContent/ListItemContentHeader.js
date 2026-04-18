// Dependencies
import Link from 'next/link';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader.module.scss';

const ListItemContentHeader = ({ fullscreen = false, link = null, children }) => {

  const renderContent = (link, children) => {
    return link && !fullscreen
      ? (<Link href={link.to} title={link.title} data-tabable={true}>{children}</Link>)
      : children
  }

  return (
    <header className={`${style.listItemContentHeader} ${fullscreen ? style.fullscreen : ''}`}>
      {renderContent(link, children)}
    </header>
  )
};

export default ListItemContentHeader;
