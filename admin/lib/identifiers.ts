import { toOsloDate } from "@admin/lib/dates";

/*
 * Posts and videos are identified by their day plus a two-digit order number:
 * id 2026101800 and image filename 2026-10-18-00. Both are fixed when the item
 * is created and never rederived, because the thumbnails on disk are named
 * after thumbnailFilename - changing the date of an existing item must not
 * quietly point it at images that do not exist.
 */
export function dateIdentifiers(timestamp: number, orderNumber: number) {
    const day = toOsloDate(timestamp);
    const order = String(orderNumber).padStart(2, "0");
    return { id: `${day.replace(/-/g, "")}${order}`, thumbnailFilename: `${day}-${order}` };
}

/** Where a new item goes in a newest-first list: before everything from the same day or earlier. */
export function newestFirstPosition(items: { timestamp: number }[], timestamp: number): number {
    const position = items.findIndex((other) => other.timestamp <= timestamp);
    return position === -1 ? items.length : position;
}
