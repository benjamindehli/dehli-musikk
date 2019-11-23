// Dependencies
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Helmet} from 'react-helmet';

// Assets
import {ReactComponent as AmazonStoreIcon} from '../../assets/svg/amazonStore.svg'
import {ReactComponent as AmazonMusicIcon} from '../../assets/svg/amazonMusic.svg'
import {ReactComponent as AppleMusicIcon} from '../../assets/svg/appleMusic.svg'
import {ReactComponent as DeezerIcon} from '../../assets/svg/deezer.svg'
import {ReactComponent as GoogleIcon} from '../../assets/svg/google.svg'
import {ReactComponent as GoogleStoreIcon} from '../../assets/svg/googleStore.svg'
import {ReactComponent as ItunesIcon} from '../../assets/svg/itunes.svg'
import {ReactComponent as NapsterIcon} from '../../assets/svg/napster.svg'
import {ReactComponent as PandoraIcon} from '../../assets/svg/pandora.svg'
import {ReactComponent as SoundcloudIcon} from '../../assets/svg/soundcloud.svg'
import {ReactComponent as SpotifyIcon} from '../../assets/svg/spotify.svg'
import {ReactComponent as TidalIcon} from '../../assets/svg/tidal.svg'
import {ReactComponent as YandexIcon} from '../../assets/svg/yandex.svg'
import {ReactComponent as YoutubeIcon} from '../../assets/svg/youtube.svg'
import {ReactComponent as YoutubeMusicIcon} from '../../assets/svg/youtubeMusic.svg'

// Stylesheets
import style from './Portfolio.module.scss';

// Data
import releases from '../../data/portfolio';

class Portfolio extends Component {

  componentDidMount() {}

  getReleaseThumbnailSrc(release) {
    return require(`../../data/releases/thumbnails/${release.thumbnailFilename}`);
  }

  getReleaseSnippet(release) {
    const snippet = {
      "@context": "http://schema.org",
      "@type": "MusicRecording",
      "@id": `${window.location.origin}${window.location.pathname}#${release.id}`,
      "name": release.title,
      "duration": release.durationISO,
      "genre": release.genre,
      "byArtist": {
        "@type": "MusicGroup",
        "name": release.artistName
      },
      "recordingOf": {
        "@type": "MusicComposition",
        "name": release.title
      },
      "thumbnailUrl": `${window.location.origin}${this.getReleaseThumbnailSrc(release)}`
    }
    return (<Helmet>
      <script type="application/ld+json">{`${JSON.stringify(snippet)}`}</script>
    </Helmet>)
  }

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

  renderReleaseLinks(links) {
    return Object.keys(links).map(linkKey => {
      const url = links[linkKey];
      return <a href={url} key={linkKey} className={style.link}>{this.getLinkIcon(linkKey)}</a>;
    });
  }

  renderRelease(release) {
    return (<div>
      <div className={style.header}>
        <h2>{release.artistName} - {release.title}</h2>
      </div>
      <img src={this.getReleaseThumbnailSrc(release)} alt={`Album cover for ${release.title} by ${release.artistName}`}/>
      <div className={style.links}>
        {this.renderReleaseLinks(release.links)}
      </div>
    </div>)
  }

  renderReleases() {
    return releases.map(release => {
      return (<div key={release.id} id={release.id} className={style.gridItem}>
        {this.getReleaseSnippet(release)}
        {this.renderRelease(release)}
      </div>)
    });
  }

  render() {
    return (<>
      <h1>Portfolio</h1>
      <div className ={style.releases}>
        <div className={style.grid}>
          {this.renderReleases()}
        </div>
      </div>
    < />)
  }
}

const mapStateToProps = null;

const mapDispatchToProps = null;

export default connect(mapStateToProps, mapDispatchToProps)(Portfolio);
