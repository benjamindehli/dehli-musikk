import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

const getInstrument = (instruments, equipmentId) => {
  return instruments.items.find(instrument => {
    return convertToUrlFriendlyString(`${instrument.brand} ${instrument.model}`) === equipmentId;
  })
}

export const getReleaseInstruments = (releasesInstruments, releaseId) => {
  const releaseInstrumentConnections = releasesInstruments.filter(releaseInstrument => {
    return releaseInstrument.releaseId === releaseId;
  })
  return releaseInstrumentConnections.map(releaseInstrumentConnection => {
    return {
        ...getInstrument(releaseInstrumentConnection.equipmentId), 
        equipmentItemId: releaseInstrumentConnection.equipmentId 
    };
  })
}