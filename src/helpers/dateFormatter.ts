import type { Lang } from "lib/pageMetadata";

const monthNames: Record<Lang, string[]> = {
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    /*
     * Lower case: Norwegian does not capitalise month names, unlike English.
     * These read as "28. mars 2021" mid-sentence, which is where they appear -
     * on post and video pages, and in the meta description fallback.
     */
    no: ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"]
};

/*
 * Every date in the data is a day in Norway, stored as that day's midnight in
 * Oslo, which is 22:00 or 23:00 the day before in UTC. Reading it with the
 * machine's own clock gave the previous day wherever that clock was UTC: on
 * GitHub's runners, which build the live site, 57 posts and 154 videos were
 * shown a day early. So the day is always read in Oslo, on any machine and in
 * any visitor's browser, which also keeps the server render and the hydrated
 * page in agreement.
 */
const OSLO_DAY = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo", year: "numeric", month: "2-digit", day: "2-digit" });

export function osloDate(date: Date | number): { year: number; month: number; day: number } {
    const parts = Object.fromEntries(OSLO_DAY.formatToParts(date).map((part) => [part.type, part.value]));
    return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
}

/** The Oslo day as "2026-10-18", for front matter, sitemaps and JSON-LD dates. */
export function osloIsoDate(date: Date | number): string {
    const { year, month, day } = osloDate(date);
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const getPrettyDate = (date: Date, language: Lang): string => {
    const { year, month: monthNumber, day } = osloDate(date);
    const month = monthNames[language][monthNumber - 1];
    if (language === "en") {
        return `${month} ${day}, ${year}`;
    } else {
        return `${day}. ${month} ${year}`;
    }
};

export const getRichSnippetDateString = (date: Date): string => osloIsoDate(date);

export const getPlusOneYear = (): string => {
    return new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString();
};
