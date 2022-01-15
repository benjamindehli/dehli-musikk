// Stylesheets
import style from 'components/template/List/ListItem/ListItemActionButtons.module.scss';

const ListItemActionButtons = ({ fullscreen, children }) => {
  return (
    <div className={`${style.listItemActionButtons} ${fullscreen ? style.fullscreen : ''}`}>
      {children}
    </div>
  )
};

export default ListItemActionButtons;
