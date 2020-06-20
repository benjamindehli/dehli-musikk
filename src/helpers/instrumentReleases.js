import releasesInstruments from 'data/releasesInstruments';
import releases from 'data/portfolio';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'


const getRelease = releaseId => {
  return releases.find(release => {
    return convertToUrlFriendlyString(`${release.artistName} ${release.title}`) === releaseId;
  })
}

export const getInstrumentReleases = instrumentId => {
  const instrumentReleaseConnections = releasesInstruments.filter(instrumentRelease => {
    return instrumentRelease.equipmentId === instrumentId;
  })
  return instrumentReleaseConnections.map(instrumentReleaseConnection => {
    return {...getRelease(instrumentReleaseConnection.releaseId), releaseId: instrumentReleaseConnection.releaseId };
  })
}
