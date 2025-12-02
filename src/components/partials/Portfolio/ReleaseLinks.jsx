// Dependencies
import { useSelector } from 'react-redux';

// Assets
import AmazonMusicIcon from '../../../assets/svg/amazonMusic.svg?react'
import AmazonStoreIcon from '../../../assets/svg/amazonStore.svg?react'
import AnghamiIcon from '../../../assets/svg/anghami.svg?react'
import AppleMusicIcon from '../../../assets/svg/appleMusic.svg?react'
import AudiomackIcon from '../../../assets/svg/audiomack.svg?react'
import BoomplayIcon from '../../../assets/svg/boomplay.svg?react'
import DeezerIcon from '../../../assets/svg/deezer.svg?react'
import GoogleIcon from '../../../assets/svg/google.svg?react'
import GoogleStoreIcon from '../../../assets/svg/googleStore.svg?react'
import ItunesIcon from '../../../assets/svg/itunes.svg?react'
import NapsterIcon from '../../../assets/svg/napster.svg?react'
import PandoraIcon from '../../../assets/svg/pandora.svg?react'
import SoundcloudIcon from '../../../assets/svg/soundcloud.svg?react'
import SpotifyIcon from '../../../assets/svg/spotify.svg?react'
import TidalIcon from '../../../assets/svg/tidal.svg?react'
import YandexIcon from '../../../assets/svg/yandex.svg?react'
import YoutubeIcon from '../../../assets/svg/youtube.svg?react'
import YoutubeMusicIcon from '../../../assets/svg/youtubeMusic.svg?react'

// Stylesheets
import style from './ReleaseLinks.module.scss';

const ReleaseLinks = ({ release }) => {

  // Redux store
  const selectedLanguageKey = useSelector(state => state.selectedLanguageKey)

  const getLinkIcon = (linkKey) => {
    switch (linkKey) {
      case 'amazonMusic':
        return <AmazonMusicIcon />
      case 'amazonStore':
        return <AmazonStoreIcon />
      case 'anghami':
        return <AnghamiIcon />
      case 'appleMusic':
        return <AppleMusicIcon />
      case 'audiomack':
        return <AudiomackIcon />
      case 'boomplay':
        return <BoomplayIcon />
      case 'deezer':
        return <DeezerIcon />
      case 'google':
        return <GoogleIcon />
      case 'googleStore':
        return <GoogleStoreIcon />
      case 'itunes':
        return <ItunesIcon />
      case 'napster':
        return <NapsterIcon />
      case 'pandora':
        return <PandoraIcon />
      case 'soundcloud':
        return <SoundcloudIcon />
      case 'spotify':
        return <SpotifyIcon />
      case 'tidal':
        return <TidalIcon />
      case 'yandex':
        return <YandexIcon />
      case 'youtube':
        return <YoutubeIcon />
      case 'youtubeMusic':
        return <YoutubeMusicIcon />
      default:
        return 'Missing icon'
    }
  }

  const getLinkName = (linkKey) => {
    switch (linkKey) {
      case 'amazonMusic':
        return 'Amazon Music'
      case 'amazonStore':
        return 'Amazon'
      case 'anghami':
        return 'Anghami'
      case 'appleMusic':
        return 'Apple Music'
      case 'audiomack':
        return 'Audiomack'
      case 'boomplay':
        return 'Boomplay'
      case 'deezer':
        return 'Deezer'
      case 'google':
        return 'Google Play Music'
      case 'googleStore':
        return 'Google Play'
      case 'itunes':
        return 'iTunes'
      case 'napster':
        return 'Napster'
      case 'pandora':
        return 'Pandora'
      case 'soundcloud':
        return 'SoundCloud'
      case 'spotify':
        return 'Spotify'
      case 'tidal':
        return 'Tidal'
      case 'yandex':
        return 'Yandex'
      case 'youtube':
        return 'YouTube'
      case 'youtubeMusic':
        return 'YouTube Music'
      default:
        return linkKey
    }
  }

  const renderReleaseLinks = (release) => {
    const links = release.links;
    return Object.keys(links).map(linkKey => {
      const url = links[linkKey];
      const linkTitle = `${selectedLanguageKey === 'en' ? 'Listen to' : 'Lytt til'} ${release.title} ${selectedLanguageKey === 'en' ? 'on' : 'på'} ${getLinkName(linkKey)}`;
      return <a href={url} data-tabable={true} key={linkKey} aria-label={linkTitle} title={linkTitle} target='_blank' rel='noopener noreferrer' className={style.link}>{getLinkIcon(linkKey)} {getLinkName(linkKey)}</a>;
    });
  }

  return (<div className={style.releaseLinks}>
    {renderReleaseLinks(release)}
  </div>);
}

export default ReleaseLinks;
