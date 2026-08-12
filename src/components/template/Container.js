// Stylesheets
import style from 'components/template/Container.module.scss';

/*
 * blur is only ever used for the content behind an open modal on a detail page,
 * where a fixed 75%-black overlay and a 5px filter make it unreadable. Content a
 * sighted user cannot see should not be reachable by keyboard or announced by a
 * screen reader either, so blurred containers are inert: without it, tabbing out
 * of the modal moves focus onto links hidden behind the overlay, where the focus
 * ring is invisible.
 *
 * inert only affects interaction and the accessibility tree. The markup stays in
 * the DOM and remains crawlable and indexable, unlike display: none.
 */
const Container = ({ blur = false, children }) => {
  return (
    <div className={`${style.container} ${blur ? style.blur : ''}`} inert={blur}>
      {children}
    </div>
  )
};

export default Container;
