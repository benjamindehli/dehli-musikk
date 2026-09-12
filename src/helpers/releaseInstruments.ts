import type { EquipmentItemData } from "data/equipment";
import type { Product, ReleaseInstrumentLink } from "types/content";
import releasesInstruments from "data/releasesInstruments";
import { instruments } from "data/equipment";
import products from "data/products";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";

const getInstrument = (equipmentId: string): EquipmentItemData | undefined => {
    return instruments.items.find((instrument) => {
        return convertToUrlFriendlyString(`${instrument.brand} ${instrument.model}`) === equipmentId;
    });
};

const getProduct = (equipmentId: string): Product | undefined => {
    return (products as Product[]).find((product) => {
        return convertToUrlFriendlyString(product.title) === equipmentId;
    });
};

export const getReleaseInstruments = (releaseId: string) => {
    const releaseInstrumentConnections = (releasesInstruments as ReleaseInstrumentLink[])
        .filter((instrumentRelease) => !instrumentRelease.isProduct)
        .filter((releaseInstrument) => {
            return releaseInstrument.releaseId === releaseId;
        });
    return releaseInstrumentConnections.map((releaseInstrumentConnection) => {
        return { ...getInstrument(releaseInstrumentConnection.equipmentId), equipmentItemId: releaseInstrumentConnection.equipmentId };
    });
};

export const getReleaseProducts = (releaseId: string) => {
    const releaseProductConnections = (releasesInstruments as ReleaseInstrumentLink[])
        .filter((releaseInstrument) => releaseInstrument.isProduct)
        .filter((releaseProduct) => {
            return releaseProduct.releaseId === releaseId;
        });
    return releaseProductConnections.map((releaseProductConnection) => {
        return { ...getProduct(releaseProductConnection.equipmentId), equipmentItemId: releaseProductConnection.equipmentId };
    });
};
