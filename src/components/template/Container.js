// Stylesheets
import style from 'components/template/Container.module.scss';

const Container = ({ blur, children }) => {
  return (
    <div className={`${style.container} ${blur ? style.blur : ''}`}>
      {children}
    </div>
  )
};

export default Container;
