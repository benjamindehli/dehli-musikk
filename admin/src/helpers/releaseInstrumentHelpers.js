import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

const getInstrument = (instruments, equipmentId) => {
  return instruments.items.find(instrument => {
    return convertToUrlFriendlyString(`${instrument.brand} ${instrument.model}`) === equipmentId;
  })
}

export const getReleaseInstruments = (releasesInstruments, releaseId, instruments) => {
  const releaseInstrumentConnections = releasesInstruments.filter(releaseInstrument => {
    return releaseInstrument.releaseId === releaseId;
  })
  return releaseInstrumentConnections.map(releaseInstrumentConnection => {
    return {
        ...getInstrument(instruments, releaseInstrumentConnection.equipmentId), 
        equipmentItemId: releaseInstrumentConnection.equipmentId 
    };
  })
}