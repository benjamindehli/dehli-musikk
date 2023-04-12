// Dependencies
import { useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// Assets
import { ReactComponent as PianobookIcon } from 'assets/svg/pianobook.svg'
import { ReactComponent as KofiIcon } from 'assets/svg/kofi.svg'


// Stylesheets
import style from 'components/partials/SocialMediaLinks.module.scss';

const SocialMediaLinks = () => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)

  return (<div className={style.socialMediaLinks}>
    <a href='https://www.facebook.com/DehliMusikk/' title='Link to Facebook page' aria-label='Link to Facebook page' target='_blank' rel="noopener noreferrer" className={style.facebook}>
      <FontAwesomeIcon icon={['fab', 'facebook-f']} />
    </a>
    <a href='https://www.instagram.com/benjamindehli/' title='Link to Instagram page' aria-label='Link to Instagram page' target='_blank' rel="noopener noreferrer" className={style.instagram}>
      <FontAwesomeIcon icon={['fab', 'instagram']} />
    </a>
    <a href='https://youtube.com/@BenjaminDehli' title='Link to Youtube channel' aria-label='Link to Youtube channel' target='_blank' rel="noopener noreferrer" className={style.youtube}>
      <FontAwesomeIcon icon={['fab', 'youtube']} />
    </a>
    <a href='https://vimeo.com/benjamindehli' title='Link to Vimeo page' aria-label='Link to Vimeo page' target='_blank' rel="noopener noreferrer" className={style.vimeo}>
      <FontAwesomeIcon icon={['fab', 'vimeo-v']} />
    </a>
    <a href='https://benjamindehli.tumblr.com/' title='Link to Tumblr page' aria-label='Link to Tumblr page' target='_blank' rel="noopener noreferrer" className={style.tumblr}>
      <FontAwesomeIcon icon={['fab', 'tumblr']} />
    </a>
    <a href='https://twitter.com/BenjaminDehli' title='Link to Twitter page' aria-label='Link to Twitter page' target='_blank' rel="noopener noreferrer" className={style.twitter}>
      <FontAwesomeIcon icon={['fab', 'twitter']} />
    </a>
    <a href='https://www.pianobook.co.uk/profile/benjamindehli/' title='Link to Pianobook profile' aria-label='Link to Pianobook profile' target='_blank' rel="noopener noreferrer" className={style.pianobook}>
      <PianobookIcon />
    </a>
    <a href='https://ko-fi.com/benjamindehli' title='Link to Ko-fi page' aria-label='Link to Ko-fi page' target='_blank' rel="noopener noreferrer" className={style.kofi}>
      <KofiIcon />
    </a>
    <a href={selectedLanguageKey === 'en' ? '/feed-en.rss' : '/feed-no.rss'} title='Link to RSS feed' aria-label='Link to RSS feed' target='_blank' rel="noopener noreferrer" className={style.rss}>
      <FontAwesomeIcon icon={['fas', 'rss']} />
    </a>
  </div>)
}


export default SocialMediaLinks;
