import {convertToUrlFriendlyString} from 'helpers/urlFormatter'

export const getReleasesInstrumentsWithInstrument = (releasesInstruments, instrument) => {
  return releasesInstruments?.length
  ?  releasesInstruments.filter(releasesInstrument => {
    return convertToUrlFriendlyString(`${instrument.brand} ${instrument.model}`) === releasesInstrument.equipmentId;
  }) : [];
}

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

const instrumentIsSelected = (instrument, selectedInstruments) => {
  return selectedInstruments.some(selectedInstrument => {
    return selectedInstrument.brand === instrument.brand && selectedInstrument.model === instrument.model;
  });
}

export const getNotSelectedReleaseInstruments = (instruments, selectedInstruments) => {
  return instruments.items.filter(instrument => {
    return !instrumentIsSelected(instrument, selectedInstruments)
  })
}