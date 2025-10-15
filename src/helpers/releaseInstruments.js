import releasesInstruments from 'data/releasesInstruments';
import {instruments} from 'data/equipment';
import products from 'data/products';
import {convertToUrlFriendlyString} from 'helpers/urlFormatter'


const getInstrument = equipmentId => {
  return instruments.items.find(instrument => {
    return convertToUrlFriendlyString(`${instrument.brand} ${instrument.model}`) === equipmentId;
  })
}

const getProduct = equipmentId => {
  return products.find(product => {
    return convertToUrlFriendlyString(product.title) === equipmentId;
  })
}

export const getReleaseInstruments = releaseId => {
  const releaseInstrumentConnections = releasesInstruments.filter(instrumentRelease => !instrumentRelease.isProduct).filter(releaseInstrument => {
    return releaseInstrument.releaseId === releaseId;
  })
  return releaseInstrumentConnections.map(releaseInstrumentConnection => {
    return {...getInstrument(releaseInstrumentConnection.equipmentId), equipmentItemId: releaseInstrumentConnection.equipmentId };
  })
}

export const getReleaseProducts = releaseId => {
  const releaseProductConnections = releasesInstruments.filter(releaseInstrument => releaseInstrument.isProduct).filter(releaseProduct => {
    return releaseProduct.releaseId === releaseId;
  })
  return releaseProductConnections.map(releaseProductConnection => {
    return {...getProduct(releaseProductConnection.equipmentId), equipmentItemId: releaseProductConnection.equipmentId };
  })
}
