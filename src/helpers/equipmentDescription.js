/*
 * Shared by the equipment item page metadata and by the Product JSON-LD on the
 * same page, so the meta description and the structured data cannot drift apart.
 * Derived entirely from how often an item appears in videos and on recordings;
 * the equipment data itself holds only a brand and a model.
 */
const descriptions = {
    no: (itemName, videoCount, releaseCount) => {
        // The preposition sits inside each part so the sentence avoids a pronoun:
        // equipment names vary in grammatical gender ("en gitar" but "et orgel").
        const usage = [
            videoCount ? `i ${videoCount} ${videoCount === 1 ? "video" : "videoer"}` : null,
            releaseCount ? `på ${releaseCount} ${releaseCount === 1 ? "utgivelse" : "utgivelser"}` : null
        ].filter(Boolean);
        return usage.length
            ? `${itemName} er en del av utstyret Dehli Musikk bruker under innspilling. Brukt ${usage.join(" og ")}.`
            : `${itemName} er en del av utstyret Dehli Musikk bruker under innspilling.`;
    },
    en: (itemName, videoCount, releaseCount) => {
        const usage = [
            videoCount ? `in ${videoCount} ${videoCount === 1 ? "video" : "videos"}` : null,
            releaseCount ? `on ${releaseCount} ${releaseCount === 1 ? "recording" : "recordings"}` : null
        ].filter(Boolean);
        return usage.length
            ? `${itemName} is part of the equipment Dehli Musikk uses during recording. Heard ${usage.join(" and ")}.`
            : `${itemName} is part of the equipment Dehli Musikk uses during recording.`;
    }
};

export function getEquipmentItemDescription(itemName, videoCount, releaseCount, lang) {
    return (descriptions[lang] || descriptions.no)(itemName, videoCount, releaseCount);
}
