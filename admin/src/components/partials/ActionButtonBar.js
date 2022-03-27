// Stylesheets
import style from 'components/partials/ActionButtonBar.module.scss';

const ActionButtonBar = ({children}) => {
  return (<div className={style.actionButtonBar}>
    {children}
  </div>)
}

export default ActionButtonBar;
