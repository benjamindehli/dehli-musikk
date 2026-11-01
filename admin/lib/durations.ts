/*
 * Video durations are stored the way YouTube reports them, as ISO 8601
 * ("PT11M14S", "PT10S", "PT2M"), and clip offsets as whole seconds. The forms
 * use clock time ("11:14") instead, which is what a person reads off a player.
 */

const ISO = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;

export function isoToSeconds(iso: string): number | null {
    const match = ISO.exec(iso);
    if (!match || iso === "PT") return null;
    return Number(match[1] ?? 0) * 3600 + Number(match[2] ?? 0) * 60 + Number(match[3] ?? 0);
}

/* Zero parts are left out, as in 147 of the 179 durations in the data: "PT10S", "PT2M". */
export function secondsToIso(total: number): string {
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    return `PT${hours ? `${hours}H` : ""}${minutes ? `${minutes}M` : ""}${seconds || total === 0 ? `${seconds}S` : ""}`;
}

/** "11:14", or "1:02:03" past an hour. */
export function secondsToClock(total: number): string {
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = String(total % 60).padStart(2, "0");
    return hours ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}

const CLOCK = /^(?:(\d+):)?(\d{1,2}):(\d{2})$/;

/** Accepts "11:14", "1:02:03" or a plain number of seconds; null for anything else. */
export function clockToSeconds(value: string): number | null {
    if (/^\d+$/.test(value)) return Number(value);
    const match = CLOCK.exec(value);
    if (!match) return null;
    const minutes = Number(match[2]);
    const seconds = Number(match[3]);
    if (seconds > 59 || (match[1] !== undefined && minutes > 59)) return null;
    return Number(match[1] ?? 0) * 3600 + minutes * 60 + seconds;
}
