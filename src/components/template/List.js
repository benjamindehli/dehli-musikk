// Stylesheets
import style from 'components/template/List.module.scss';

const List = ({ compact = false, children }) => {
  return (
    <div className={`${style.list} ${compact ? style.compact : ''}`}>
      {children}
    </div>
  )
};

export default List;
