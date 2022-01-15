// Stylesheets
import style from 'components/template/List/ListItem/ListItemContent/ListItemContentBody.module.scss';

const ListItemContentBody = ({ fullscreen, children }) => {
  return (
    <div className={`${style.listItemContentBody} ${fullscreen ? style.fullscreen : ''}`}>
      {children}
    </div>
  )
};

export default ListItemContentBody;
