// Stylesheets
import style from './ListItemContent.module.scss';

const ListItemContent = ({ fullscreen, children }) => {
  return (
    <div className={`${style.listItemContent} ${fullscreen ? style.fullscreen : ''}`}>
      {children}
    </div>
  )
};

export default ListItemContent;
