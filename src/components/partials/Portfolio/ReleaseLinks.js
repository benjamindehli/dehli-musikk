// Stylesheets
import style from 'components/partials/Portfolio/ReleaseLinks.module.scss';

const getLinkIcon = (linkKey) => {
  const icons = {
    amazonMusic: '/images/amazonMusic.svg',
    amazonStore: '/images/amazonStore.svg',
    anghami: '/images/anghami.svg',
    appleMusic: '/images/appleMusic.svg',
    audiomack: '/images/audiomack.svg',
    boomplay: '/images/boomplay.svg',
    deezer: '/images/deezer.svg',
    google: '/images/google.svg',
    googleStore: '/images/googleStore.svg',
    itunes: '/images/itunes.svg',
    napster: '/images/napster.svg',
    pandora: '/images/pandora.svg',
    soundcloud: '/images/soundcloud.svg',
    spotify: '/images/spotify.svg',
    tidal: '/images/tidal.svg',
    yandex: '/images/yandex.svg',
    youtube: '/images/youtube.svg',
    youtubeMusic: '/images/youtubeMusic.svg'
  };
  const src = icons[linkKey];
  return src ? <img src={src} alt="" aria-hidden="true" /> : null;
};

const getLinkName = (linkKey) => {
  switch (linkKey) {
    case 'amazonMusic': return 'Amazon Music';
    case 'amazonStore': return 'Amazon';
    case 'anghami': return 'Anghami';
    case 'appleMusic': return 'Apple Music';
    case 'audiomack': return 'Audiomack';
    case 'boomplay': return 'Boomplay';
    case 'deezer': return 'Deezer';
    case 'google': return 'Google Play Music';
    case 'googleStore': return 'Google Play';
    case 'itunes': return 'iTunes';
    case 'napster': return 'Napster';
    case 'pandora': return 'Pandora';
    case 'soundcloud': return 'SoundCloud';
    case 'spotify': return 'Spotify';
    case 'tidal': return 'Tidal';
    case 'yandex': return 'Yandex';
    case 'youtube': return 'YouTube';
    case 'youtubeMusic': return 'YouTube Music';
    default: return linkKey;
  }
};

const ReleaseLinks = ({ release, lang }) => {
  const links = release.links;
  return (
    <div className={style.releaseLinks}>
      {Object.keys(links).map((linkKey) => {
        const url = links[linkKey];
        const name = getLinkName(linkKey);
        const linkTitle = `${lang === 'en' ? 'Listen to' : 'Lytt til'} ${release.title} ${lang === 'en' ? 'on' : 'på'} ${name}`;
        return (
          <a
            href={url}
            data-tabable={true}
            key={linkKey}
            aria-label={linkTitle}
            title={linkTitle}
            target="_blank"
            rel="noopener noreferrer"
            className={style.link}
          >
            {getLinkIcon(linkKey)} {name}
          </a>
        );
      })}
    </div>
  );
};

export default ReleaseLinks;
