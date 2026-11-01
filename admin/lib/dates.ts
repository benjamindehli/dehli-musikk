/*
 * The data stores dates as epoch milliseconds, and the site's own dates are
 * Norwegian calendar days: a post from 18 October 2026 is stamped at midnight
 * in Oslo, which is 22:00 UTC the day before. Converting through the server's
 * local zone would only be right on a Mac set to Oslo time, so the zone is named
 * here instead.
 */
const TIME_ZONE = "Europe/Oslo";

const dayFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });

/** "2026-10-18" for any moment on that day in Oslo. */
export function toOsloDate(epochMs: number): string {
    return dayFormat.format(epochMs);
}

const offsetFormat = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" });

/** Oslo's UTC offset in minutes at a given moment: 60 in winter, 120 in summer. */
function osloOffsetMinutes(epochMs: number): number {
    const name = offsetFormat.formatToParts(epochMs).find((part) => part.type === "timeZoneName")?.value ?? "GMT";
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
    if (!match) return 0;
    const minutes = Number(match[2]) * 60 + Number(match[3]);
    return match[1] === "-" ? -minutes : minutes;
}

const DATE_INPUT = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Midnight in Oslo on a "YYYY-MM-DD" day, as epoch milliseconds, or null if the text is not such a day. */
export function fromOsloDate(value: string): number | null {
    const match = DATE_INPUT.exec(value);
    if (!match) return null;
    const utcMidnight = Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    if (Number.isNaN(utcMidnight) || new Date(utcMidnight).toISOString().slice(0, 10) !== value) return null;
    // Midnight is never inside a DST transition in Norway (those happen at
    // 02:00 and 03:00), so the offset at UTC midnight is the offset at local
    // midnight.
    return utcMidnight - osloOffsetMinutes(utcMidnight) * 60_000;
}
