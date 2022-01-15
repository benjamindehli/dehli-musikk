// Stylesheets
import style from 'components/template/List/ListItem.module.scss';

const ListItem = ({ fullscreen, article, compact, children }) => {
  const CustomTag = article ? 'article' : 'div';
  return (
    <CustomTag className={`${style.listItem} ${fullscreen ? style.fullscreen : ''} ${compact ? style.compact : ''}`}>
      {children}
    </CustomTag>
  )
};

export default ListItem;
