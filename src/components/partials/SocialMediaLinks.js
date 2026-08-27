// Dependencies
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRss } from '@fortawesome/free-solid-svg-icons';
import {
    faFacebookF,
    faGithub,
    faInstagram,
    faYoutube,
    faVimeoV,
    faSoundcloud,
    faTumblr,
    faXTwitter
} from '@fortawesome/free-brands-svg-icons';

// Stylesheets
import style from 'components/partials/SocialMediaLinks.module.scss';

const SocialMediaLinks = ({ lang }) => {
  return (<div className={style.socialMediaLinks}>
    <a href='https://www.facebook.com/DehliMusikk/' title='Link to Facebook page' aria-label='Link to Facebook page' target='_blank' rel="noopener noreferrer" className={style.facebook}>
      <FontAwesomeIcon icon={faFacebookF} />
    </a>
    <a href='https://www.instagram.com/benjamindehli/' title='Link to Instagram page' aria-label='Link to Instagram page' target='_blank' rel="noopener noreferrer" className={style.instagram}>
      <FontAwesomeIcon icon={faInstagram} />
    </a>
    <a href='https://youtube.com/@BenjaminDehli' title='Link to Youtube channel' aria-label='Link to Youtube channel' target='_blank' rel="noopener noreferrer" className={style.youtube}>
      <FontAwesomeIcon icon={faYoutube} />
    </a>
    <a href='https://vimeo.com/benjamindehli' title='Link to Vimeo page' aria-label='Link to Vimeo page' target='_blank' rel="noopener noreferrer" className={style.vimeo}>
      <FontAwesomeIcon icon={faVimeoV} />
    </a>
    <a href='https://soundcloud.com/benjamin-dehli' title='Link to SoundCloud page' aria-label='Link to SoundCloud page' target='_blank' rel="noopener noreferrer" className={style.soundcloud}>
      <FontAwesomeIcon icon={faSoundcloud} />
    </a>
    <a href='https://benjamindehli.tumblr.com/' title='Link to Tumblr page' aria-label='Link to Tumblr page' target='_blank' rel="noopener noreferrer" className={style.tumblr}>
      <FontAwesomeIcon icon={faTumblr} />
    </a>
    <a href='https://twitter.com/BenjaminDehli' title='Link to Twitter page' aria-label='Link to Twitter page' target='_blank' rel="noopener noreferrer" className={style.twitter}>
      <FontAwesomeIcon icon={faXTwitter} />
    </a>
    <a href='https://github.com/benjamindehli' title='Link to GitHub profile' aria-label='Link to GitHub profile' target='_blank' rel="noopener noreferrer" className={style.github}>
      <FontAwesomeIcon icon={faGithub} />
    </a>
    <a href='https://store.dehlimusikk.no/' title='Link to Gumroad page' aria-label='Link to Gumroad page' target='_blank' rel="noopener noreferrer" className={style.gumroad}>
      <img src="/images/gumroad.svg" alt="" aria-hidden="true" width="45" height="45" />
    </a>
    <a href='https://ko-fi.com/benjamindehli' title='Link to Ko-fi page' aria-label='Link to Ko-fi page' target='_blank' rel="noopener noreferrer" className={style.kofi}>
      <img src="/images/kofi.svg" alt="" aria-hidden="true" width="49" height="32" />
    </a>
    <a href={lang === 'en' ? '/feed-en.rss' : '/feed-no.rss'} title='Link to RSS feed' aria-label='Link to RSS feed' target='_blank' rel="noopener noreferrer" className={style.rss}>
      <FontAwesomeIcon icon={faRss} />
    </a>
  </div>)
}

export default SocialMediaLinks;
