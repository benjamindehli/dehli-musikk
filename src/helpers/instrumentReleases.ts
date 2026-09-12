import type { LinkedRelease, Release, ReleaseInstrumentLink } from "types/content";
import releasesInstruments from "data/releasesInstruments";
import releases from "data/portfolio";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";

const getRelease = (releaseId: string): Release | undefined => {
    return (releases as Release[]).find((release) => {
        return convertToUrlFriendlyString(`${release.artistName} ${release.title}`) === releaseId;
    });
};

export const getInstrumentReleases = (instrumentId: string): LinkedRelease[] => {
    const instrumentReleaseConnections = (releasesInstruments as ReleaseInstrumentLink[])
        .filter((instrumentRelease) => !instrumentRelease.isProduct)
        .filter((instrumentRelease) => {
            return instrumentRelease.equipmentId === instrumentId;
        });
    return instrumentReleaseConnections
        .map((instrumentReleaseConnection) => {
            const release = getRelease(instrumentReleaseConnection.releaseId);
            if (!release) {
                return null;
            }
            return { ...release, releaseId: instrumentReleaseConnection.releaseId };
        })
        .filter((release): release is LinkedRelease => release !== null); // Filter out any null values
};

export const getProductReleases = (productId: string): LinkedRelease[] => {
    const productReleaseConnections = (releasesInstruments as ReleaseInstrumentLink[])
        .filter((instrumentRelease) => instrumentRelease.isProduct)
        .filter((productRelease) => {
            return productRelease.equipmentId === productId;
        });
    return productReleaseConnections
        .map((productReleaseConnection) => {
            const release = getRelease(productReleaseConnection.releaseId);
            if (!release) {
                return null;
            }
            return { ...release, releaseId: productReleaseConnection.releaseId };
        })
        .filter((release): release is LinkedRelease => release !== null); // Filter out any null values
};
