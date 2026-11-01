"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Release, ReleaseAlbum, ReleaseInstrumentLink, ReleaseLinks } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { deleteReleaseFile, readDataFile, readReleases, writeDataFile, writeRelease } from "@admin/lib/dataFiles";
import { fromOsloDate, toOsloDate } from "@admin/lib/dates";
import { clockToSeconds, secondsToIso } from "@admin/lib/durations";
import { checked, isAbsoluteUrl, Problems, text, texts, type FormState } from "@admin/lib/forms";
import { RELEASE_PLATFORMS } from "./platforms";

/*
 * "KAASIN" + "Wrong" -> "kAASIN_wrong": letters and digits only, Norwegian
 * letters spelled out, first letter lowered. The same rule the old authoring
 * app used, so new files are named like the 81 already there. Only used when a
 * release is created: the album art on disk is named after it.
 */
function camelize(value: string): string {
    return value
        .replace(/Æ/g, "Ae")
        .replace(/æ/g, "ae")
        .replace(/Ø/g, "Oe")
        .replace(/ø/g, "oe")
        .replace(/Å/g, "Aa")
        .replace(/å/g, "aa")
        .replace(/Ë/g, "E")
        .replace(/ë/g, "e")
        .replace(/[^a-zA-Z0-9]/g, "")
        .replace(/^\w/, (first) => first.toLowerCase());
}

const ISRC = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/;

/*
 * Optional fields are only written when they say something, but a field a
 * release already carries keeps its key even when cleared or false - 14
 * releases say "unreleased": false outright, and dropping that would be a diff
 * with no meaning.
 */
function setOptional<T extends object, K extends keyof T>(target: T, existing: T | undefined, key: K, value: T[K], meaningful: boolean): void {
    if (meaningful || (existing && key in existing)) target[key] = value;
    else delete target[key];
}

function readLinks(form: FormData, existing: ReleaseLinks | undefined, problems: Problems): ReleaseLinks {
    const entered: ReleaseLinks = {};
    for (const platform of RELEASE_PLATFORMS) {
        const url = text(form, `link_${platform.key}`);
        if (!url) continue;
        if (!isAbsoluteUrl(url)) problems.add(`The ${platform.label} link must start with https://.`);
        entered[platform.key] = url;
    }
    // Existing links keep their order, and new ones follow in the list's order.
    const ordered: ReleaseLinks = {};
    for (const key of Object.keys(existing ?? {}) as (keyof ReleaseLinks)[]) if (entered[key]) ordered[key] = entered[key];
    return { ...ordered, ...entered };
}

/*
 * The instrument and product links for one release live as a block of rows in
 * releasesInstruments.json. Rows that stay are kept where and as they are;
 * rows that go are removed; new ones are added at the end of the block. A
 * release whose links did not change leaves the file byte for byte the same.
 */
function updateLinks(all: ReleaseInstrumentLink[], slug: string, instruments: string[], products: string[]): ReleaseInstrumentLink[] {
    const wanted = new Set([...instruments.map((id) => `i:${id}`), ...products.map((id) => `p:${id}`)]);
    const key = (link: ReleaseInstrumentLink) => `${link.isProduct ? "p" : "i"}:${link.equipmentId}`;
    const firstIndex = all.findIndex((link) => link.releaseId === slug);
    const kept = all.filter((link) => link.releaseId === slug && wanted.has(key(link)));
    const present = new Set(kept.map(key));
    const added: ReleaseInstrumentLink[] = [
        ...instruments.filter((id) => !present.has(`i:${id}`)).map((equipmentId) => ({ releaseId: slug, equipmentId })),
        ...products.filter((id) => !present.has(`p:${id}`)).map((equipmentId) => ({ releaseId: slug, equipmentId, isProduct: true }))
    ];
    const others = all.filter((link) => link.releaseId !== slug);
    const block = [...kept, ...added];
    if (firstIndex === -1) return [...others, ...block];
    // Put the block back where the release's first row was.
    const before = all.slice(0, firstIndex).filter((link) => link.releaseId !== slug).length;
    return [...others.slice(0, before), ...block, ...others.slice(before)];
}

export async function saveRelease(originalFile: string | null, _previous: FormState, form: FormData): Promise<FormState> {
    const releases = await readReleases<Release>();
    const existing = originalFile === null ? undefined : releases[originalFile];
    if (originalFile !== null && !existing) return { status: "error", errors: [`Release ${originalFile} no longer exists. Was it deleted?`] };

    const problems = new Problems();
    const artistName = problems.require(text(form, "artistName"), "Artist");
    const title = problems.require(text(form, "title"), "Title");
    const genre = problems.require(text(form, "genre"), "Genre");
    const id = problems.require(text(form, "spotifyId"), "Spotify track id");
    // Written with or without hyphens (NO-ABC-26-00001); stored without, like the rest.
    const isrcCode = text(form, "isrcCode").replace(/[-\s]/g, "").toUpperCase();
    if (isrcCode && !ISRC.test(isrcCode)) problems.add("ISRC must look like DEUJ62100289: two letters, three letters or digits, then seven digits.");
    const spotifyThumbnailUrl = text(form, "spotifyThumbnailUrl");
    if (spotifyThumbnailUrl && !isAbsoluteUrl(spotifyThumbnailUrl)) problems.add("Cover image URL must start with https://.");
    const jsonLdId = text(form, "jsonLdId");
    if (jsonLdId && !isAbsoluteUrl(jsonLdId)) problems.add("JSON-LD id must be a full URL, such as a MusicBrainz recording.");

    const releaseDate = fromOsloDate(text(form, "releaseDate"));
    if (releaseDate === null) problems.add("Release date must be a valid day.");
    const seconds = clockToSeconds(text(form, "duration"));
    if (seconds === null || seconds === 0) problems.add("Length must be a time like 5:25.");

    const links = readLinks(form, existing?.links, problems);

    const slug = existing ? existing.slug : convertToUrlFriendlyString(`${artistName} ${title}`);
    const fileName = existing ? originalFile! : `${camelize(artistName)}_${camelize(title)}.json`;
    if (!existing) {
        if (releases[fileName]) problems.add(`There is already a release file named ${fileName}.`);
        const sameSlug = Object.values(releases).find((release) => release.slug === slug);
        if (sameSlug) problems.add(`Another release already has the URL portfolio/${slug}/ ("${sameSlug.artistName} - ${sameSlug.title}").`);
    }

    if (problems.any || releaseDate === null || seconds === null) return problems.state();

    // The stored length is in milliseconds from Spotify; keep it when the
    // whole seconds were not changed, rather than rounding it off.
    const sameLength = existing && Math.floor(existing.duration / 1000) === seconds;
    const duration = sameLength ? existing.duration : seconds * 1000;
    const durationISO = sameLength ? existing.durationISO : secondsToIso(seconds);
    // Release dates were stored at several different hours over the years; a
    // date that was not changed keeps its exact value.
    const keptDate = existing && toOsloDate(existing.releaseDate) === toOsloDate(releaseDate) ? existing.releaseDate : releaseDate;

    const release: Release = existing
        ? { ...existing, id, artistName, title, duration, durationISO, isrcCode, genre, releaseDate: keptDate, spotifyThumbnailUrl, links }
        : {
              id,
              slug,
              artistName,
              title,
              duration,
              durationISO,
              isrcCode,
              genre,
              releaseDate: keptDate,
              spotifyThumbnailUrl,
              thumbnailFilename: fileName.replace(/\.json$/, ""),
              links
          };
    setOptional(release, existing, "producedByDehliMusikk", checked(form, "producedByDehliMusikk"), checked(form, "producedByDehliMusikk"));
    setOptional(release, existing, "composedByDehliMusikk", checked(form, "composedByDehliMusikk"), checked(form, "composedByDehliMusikk"));
    setOptional(release, existing, "unreleased", checked(form, "unreleased"), checked(form, "unreleased"));
    setOptional(release, existing, "jsonLdId", jsonLdId, Boolean(jsonLdId));

    await writeRelease(fileName, release);

    const allLinks = await readDataFile<ReleaseInstrumentLink[]>("releasesInstruments");
    const updatedLinks = updateLinks(allLinks, slug, texts(form, "instrument"), texts(form, "product"));
    if (JSON.stringify(updatedLinks) !== JSON.stringify(allLinks)) await writeDataFile("releasesInstruments", updatedLinks);

    revalidatePath("/releases", "layout");
    if (!existing) redirect(`/releases/${encodeURIComponent(fileName.replace(/\.json$/, ""))}/?created=1`);
    return { status: "saved", message: `Saved to src/data/releases/data/${fileName}.` };
}

export async function deleteRelease(file: string): Promise<FormState> {
    const releases = await readReleases<Release>();
    const release = releases[file];
    if (!release) redirect("/releases/");
    const albums = await readDataFile<ReleaseAlbum[]>("releaseAlbums");
    const album = albums.find((candidate) => candidate.releaseIds.includes(release.slug));
    if (album)
        return { status: "error", errors: [`This release is a track on the album "${album.title}" in releaseAlbums.json. Remove it there first.`] };

    await deleteReleaseFile(file);
    const links = await readDataFile<ReleaseInstrumentLink[]>("releasesInstruments");
    const remaining = links.filter((link) => link.releaseId !== release.slug);
    if (remaining.length !== links.length) await writeDataFile("releasesInstruments", remaining);
    revalidatePath("/releases", "layout");
    redirect("/releases/?deleted=" + encodeURIComponent(`${release.artistName} - ${release.title}`));
}

export type OdesliResult =
    { ok: true; artistName?: string; title?: string; thumbnailUrl?: string; links: ReleaseLinks } | { ok: false; error: string };

/*
 * Looks a Spotify track up on Odesli (song.link), the service the old authoring
 * app used, and returns what it knows: the title, artist, cover image and the
 * same track on the other streaming services. Its platform names are the ones
 * ReleaseLinks already uses. The free API allows about ten lookups a minute.
 *
 * ISRC, genre, length and release date are not in its response; those still
 * come from the distributor or Spotify.
 */
export async function fetchFromOdesli(spotifyId: string): Promise<OdesliResult> {
    const trackId = spotifyId.replace(/\?.*$/, "").trim();
    if (!/^[A-Za-z0-9]{22}$/.test(trackId)) return { ok: false, error: "That is not a Spotify track id (22 letters and digits)." };

    const url = `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(`https://open.spotify.com/track/${trackId}`)}&userCountry=NO`;
    let data: {
        entityUniqueId?: string;
        entitiesByUniqueId?: Record<string, { title?: string; artistName?: string; thumbnailUrl?: string }>;
        linksByPlatform?: Record<string, { url?: string }>;
    };
    try {
        const response = await fetch(url, { signal: AbortSignal.timeout(15_000), cache: "no-store" });
        if (!response.ok)
            return { ok: false, error: `Odesli answered ${response.status}${response.status === 429 ? " (too many lookups, wait a minute)" : ""}.` };
        data = await response.json();
    } catch (error) {
        return { ok: false, error: `Could not reach Odesli: ${(error as Error).message}` };
    }

    const entity = data.entityUniqueId ? data.entitiesByUniqueId?.[data.entityUniqueId] : undefined;
    const links: ReleaseLinks = {};
    for (const platform of RELEASE_PLATFORMS) {
        const found = data.linksByPlatform?.[platform.key]?.url;
        if (found && isAbsoluteUrl(found)) links[platform.key] = found;
    }
    return { ok: true, artistName: entity?.artistName, title: entity?.title, thumbnailUrl: entity?.thumbnailUrl, links };
}
