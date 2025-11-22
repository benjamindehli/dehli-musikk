// Dependencies
import { Link } from 'react-router-dom';

// Stylesheets
import style from 'components/template/List/ListItem/ListItemThumbnail.module.scss';

const ListItemThumbnail = ({ fullscreen, compact, link, children }) => {
const getImageSize = () => {
    const image = children?.props?.children?.find(child => {
      if (child?.type === 'img' && child?.props?.height && child?.props?.width) {
        return true;
      }
    });
    if (image) {
      return {
        width: image.props.width,
        height: image.props.height
      };
    }
    return null;
  }
const imageSize = getImageSize();
  const childElements = (
    <figure className={`${style.listItemThumbnail} ${fullscreen ? style.fullscreen : ''} ${compact ? style.compact : ''}`} style={imageSize ? { aspectRatio: `${imageSize.width} / ${imageSize.height}` } : {}}>
      <picture>{children}</picture>
    </figure>
  );

  return link && !fullscreen
    ? <Link to={link.to} title={link.title} tabIndex="-1">{childElements}</Link>
    : childElements;

};


export default ListItemThumbnail;
