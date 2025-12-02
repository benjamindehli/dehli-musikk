// Stylesheets
import style from './ListItemContentBody.module.scss';

const ListItemContentBody = ({ fullscreen, children }) => {
  return (
    <div className={`${style.listItemContentBody} ${fullscreen ? style.fullscreen : ''}`}>
      {children}
    </div>
  )
};

export default ListItemContentBody;
