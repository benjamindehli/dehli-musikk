// Data
import videos from "data/videos";

/*
 * Video descriptions already link to the gear they feature, e.g.
 *   "spiller med på [Yamaha YC-25D-orgelet](equipment/instruments/yamaha-yc-25d/)"
 *
 * Reversing those links gives every equipment page a list of the videos the item
 * is actually heard in, derived entirely from copy that already exists. 89 of the
 * 101 equipment items are covered by this or by releasesInstruments.
 */
const EQUIPMENT_LINK_PATTERN = /equipment\/(instruments|effects|amplifiers)\/([a-z0-9-]+)\//g;

let videosByEquipmentKey = null;

function buildVideosByEquipmentKey() {
    const index = {};
    videos.forEach((video) => {
        // A description may link the same item more than once, and the Norwegian
        // and English versions link the same items, so collect keys per video.
        const equipmentKeys = new Set();
        ["no", "en"].forEach((languageKey) => {
            const content = video?.content?.[languageKey] || "";
            for (const match of content.matchAll(EQUIPMENT_LINK_PATTERN)) {
                equipmentKeys.add(`${match[1]}/${match[2]}`);
            }
        });
        equipmentKeys.forEach((equipmentKey) => {
            index[equipmentKey] = index[equipmentKey] || [];
            index[equipmentKey].push(video);
        });
    });
    return index;
}

export function getVideosForEquipmentItem(equipmentType, equipmentId) {
    if (!videosByEquipmentKey) {
        videosByEquipmentKey = buildVideosByEquipmentKey();
    }
    return videosByEquipmentKey[`${equipmentType}/${equipmentId}`] || [];
}
