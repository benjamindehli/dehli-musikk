import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

const camelize = string => {
  if (string && string.length) {
    let camelizedString = string.replace('Æ', 'Ae');
    camelizedString = camelizedString.replace('æ', 'ae');
    camelizedString = camelizedString.replace('Ø', 'Oe');
    camelizedString = camelizedString.replace('ø', 'oe');
    camelizedString = camelizedString.replace('Å', 'Aa');
    camelizedString = camelizedString.replace('å', 'aa');
    camelizedString = camelizedString.replace('Ë', 'E');
    camelizedString = camelizedString.replace('ë', 'e');
    camelizedString = camelizedString.replace(/[^a-zA-Z0-9]/g, '');
    camelizedString = camelizedString.replace(/^\w/, c => c.toLowerCase());
    return camelizedString.replace(/\s+/g, '');
  } else
    return '';
}

export const renderFileName = (artistName, title) => {
  return `${camelize(artistName)}_${camelize(title)}`;
}

export const convertMillisToIsoDuration = duration => {
  const dateObject = new Date(duration);
  const hours = dateObject.getHours() - 1 > 0
    ? dateObject.getHours() - 1
    : '';
  const minutes = dateObject.getMinutes() > 0 || hours !== ''
    ? dateObject.getMinutes()
    : '';
  const seconds = dateObject.getSeconds() > 0 || minutes !== ''
    ? dateObject.getSeconds()
    : '';
  return `P${hours}T${minutes}M${seconds}S`;
}

const convertReleaseDate = releaseDate => {
  let convertedReleaseDate = new Date(releaseDate.year, releaseDate.month, releaseDate.day);
  const dateOffset = convertedReleaseDate.getTimezoneOffset();
  convertedReleaseDate.setMinutes(convertedReleaseDate.getMinutes() - dateOffset);
  return convertedReleaseDate.valueOf();
}

const convertPageApiData = (apiData, releaseId) => {
  const releaseData = apiData?.entityData;
  if (releaseData) {
    return {
      id: releaseId,
      slug: convertToUrlFriendlyString(`${releaseData.artistName} ${releaseData.title}`),
      artistName: releaseData.artistName,
      title: releaseData.title,
      duration: releaseData.duration,
      durationISO: convertMillisToIsoDuration(releaseData.duration),
      isrcCode: releaseData.isrc,
      genre: releaseData.genre || '',
      releaseDate: convertReleaseDate(releaseData.releaseDate),
      spotifyThumbnailUrl: releaseData.thumbnailUrl,
      thumbnailFilename: renderFileName(releaseData.artistName, releaseData.title, releaseId)
    };
  } else
    return null;
}

const convertLinksApiData = apiData => {
  if (apiData && apiData.linksByPlatform && Object.keys(apiData.linksByPlatform).length) {
    let convertedLinksResults = {};
    Object.keys(apiData.linksByPlatform).forEach(platform => {
      convertedLinksResults[platform] = apiData.linksByPlatform[platform].url;
    });
    return convertedLinksResults;
  } else
    return null;
}

export const fetchReleaseData = (releaseId) => {
  let responseData = {};
  return fetch(`https://api.song.link/page?url=https:%2F%2Fsong.link%2Fs%2F${releaseId}`).then(res => res.json()).then((apiData) => {
    responseData = convertPageApiData(apiData, releaseId)
  }, (error) => {
    this.setState({ isLoaded: true, error });
  }).then(() => {
    if (responseData) {
      return fetch(`https://api.song.link/v1-alpha.1/links?url=spotify%3Atrack%3A${releaseId}`).then(res => res.json()).then((apiData) => {
        responseData.links = convertLinksApiData(apiData);
        return responseData;
      }, (error) => {
        console.log(error);
        return null;
      })
    } else {
      console.log('Something went insanely wrong');
      return null;
    }
  })
}
