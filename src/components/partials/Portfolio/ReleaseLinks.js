// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

// Components
import {withFirebase} from '../../Firebase';

// Assets
import {ReactComponent as AmazonStoreIcon} from '../../../assets/svg/amazonStore.svg'
import {ReactComponent as AmazonMusicIcon} from '../../../assets/svg/amazonMusic.svg'
import {ReactComponent as AppleMusicIcon} from '../../../assets/svg/appleMusic.svg'
import {ReactComponent as DeezerIcon} from '../../../assets/svg/deezer.svg'
import {ReactComponent as GoogleIcon} from '../../../assets/svg/google.svg'
import {ReactComponent as GoogleStoreIcon} from '../../../assets/svg/googleStore.svg'
import {ReactComponent as ItunesIcon} from '../../../assets/svg/itunes.svg'
import {ReactComponent as NapsterIcon} from '../../../assets/svg/napster.svg'
import {ReactComponent as PandoraIcon} from '../../../assets/svg/pandora.svg'
import {ReactComponent as SoundcloudIcon} from '../../../assets/svg/soundcloud.svg'
import {ReactComponent as SpotifyIcon} from '../../../assets/svg/spotify.svg'
import {ReactComponent as TidalIcon} from '../../../assets/svg/tidal.svg'
import {ReactComponent as YandexIcon} from '../../../assets/svg/yandex.svg'
import {ReactComponent as YoutubeIcon} from '../../../assets/svg/youtube.svg'
import {ReactComponent as YoutubeMusicIcon} from '../../../assets/svg/youtubeMusic.svg'

// Stylesheets
import style from './ReleaseLinks.module.scss';

class ReleaseLinks extends Component {

  getLinkIcon(linkKey) {
    switch (linkKey) {
      case 'amazonStore':
        return <AmazonStoreIcon/>
      case 'amazonMusic':
        return <AmazonMusicIcon/>
      case 'appleMusic':
        return <AppleMusicIcon/>
      case 'deezer':
        return <DeezerIcon/>
      case 'google':
        return <GoogleIcon/>
      case 'googleStore':
        return <GoogleStoreIcon/>
      case 'itunes':
        return <ItunesIcon/>
      case 'napster':
        return <NapsterIcon/>
      case 'pandora':
        return <PandoraIcon/>
      case 'soundcloud':
        return <SoundcloudIcon/>
      case 'spotify':
        return <SpotifyIcon/>
      case 'tidal':
        return <TidalIcon/>
      case 'yandex':
        return <YandexIcon/>
      case 'youtube':
        return <YoutubeIcon/>
      case 'youtubeMusic':
        return <YoutubeMusicIcon/>
      default:
        return 'Missing icon'
    }
  }

  renderReleaseLinks(release) {
    const links = release.links;
    return Object.keys(links).map(linkKey => {
      const url = links[linkKey];
      return <a href={url} key={linkKey} aria-label={`Listen to ${release.title} at ${linkKey}`} className={style.link}>{this.getLinkIcon(linkKey)}</a>;
    });
  }

  render() {
    return (<div className={style.releaseLinks}>
      {this.renderReleaseLinks(this.props.release)}
    </div>);
  }
}

ReleaseLinks.propTypes = {
  release: PropTypes.object.isRequired
};

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(withFirebase(ReleaseLinks));
