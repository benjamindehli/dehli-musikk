"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Localized, Video, VideoClip } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, writeDataFile } from "@admin/lib/dataFiles";
import { fromOsloDate, toOsloDate } from "@admin/lib/dates";
import { clockToSeconds, isoToSeconds, secondsToIso } from "@admin/lib/durations";
import { checked, Problems, text, texts, type FormState } from "@admin/lib/forms";
import { dateIdentifiers, newestFirstPosition } from "@admin/lib/identifiers";

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function readClips(form: FormData, duration: number | null, problems: Problems): VideoClip[] {
    const namesNo = texts(form, "clipNameNo");
    const namesEn = texts(form, "clipNameEn");
    const starts = texts(form, "clipStart");
    const ends = texts(form, "clipEnd");

    const clips: VideoClip[] = [];
    namesNo.forEach((nameNo, i) => {
        const row = `Clip ${i + 1}`;
        const nameEn = namesEn[i] ?? "";
        const startOffset = clockToSeconds(starts[i] ?? "");
        const endOffset = clockToSeconds(ends[i] ?? "");
        if (!nameNo || !nameEn) problems.add(`${row} needs a name in both languages.`);
        if (startOffset === null || endOffset === null) {
            problems.add(`${row}: start and end must be times like 1:05.`);
            return;
        }
        if (startOffset >= endOffset) problems.add(`${row} must end after it starts.`);
        if (duration !== null && endOffset > duration) problems.add(`${row} ends after the video does.`);
        const previous = clips.at(-1);
        if (previous && startOffset < previous.endOffset)
            problems.add(`${row} starts before clip ${i} ends. Clips are listed in order and must not overlap.`);
        clips.push({ name: { no: nameNo, en: nameEn }, startOffset, endOffset });
    });
    return clips;
}

export async function saveVideo(originalFilename: string | null, _previous: FormState, form: FormData): Promise<FormState> {
    const videos = await readDataFile<Video[]>("videos");
    const index = originalFilename === null ? -1 : videos.findIndex((video) => video.thumbnailFilename === originalFilename);
    if (originalFilename !== null && index === -1)
        return { status: "error", errors: [`Video ${originalFilename} no longer exists. Was it deleted?`] };
    const existing = index === -1 ? undefined : videos[index];

    const problems = new Problems();
    const title = { no: problems.require(text(form, "titleNo"), "Norwegian title"), en: problems.require(text(form, "titleEn"), "English title") };
    const content = {
        no: problems.require(text(form, "contentNo"), "Norwegian description"),
        en: problems.require(text(form, "contentEn"), "English description")
    };
    const thumbnailDescription = problems.require(text(form, "thumbnailDescription"), "Image description");

    const metaNo = text(form, "metaDescriptionNo");
    const metaEn = text(form, "metaDescriptionEn");
    if (Boolean(metaNo) !== Boolean(metaEn)) problems.add("Write the meta description in both languages, or leave both empty.");
    const metaDescription: Localized | undefined = metaNo && metaEn ? { no: metaNo, en: metaEn } : undefined;

    const youTubeId = text(form, "youTubeId");
    if (!YOUTUBE_ID.test(youTubeId)) problems.add("YouTube id must be the 11 characters after watch?v= in the video's address.");
    const clash = videos.find((video, i) => i !== index && video.youTubeId === youTubeId);
    if (clash) problems.add(`That YouTube video is already here as "${clash.title.en}".`);
    const youTubeUser = problems.require(text(form, "youTubeUser"), "YouTube channel name");
    const youTubeChannelId = problems.require(text(form, "youTubeChannelId"), "YouTube channel handle");

    const seconds = clockToSeconds(text(form, "duration"));
    if (seconds === null || seconds === 0) problems.add("Duration must be a time like 4:13.");
    const clips = readClips(form, seconds, problems);

    const date = fromOsloDate(text(form, "date"));
    if (date === null) problems.add("Date must be a valid day.");
    const modifiedText = text(form, "lastmod");
    const lastmod = modifiedText ? fromOsloDate(modifiedText) : undefined;
    if (lastmod === null) problems.add("Modified must be a valid day, or empty.");

    const orderNumber = existing ? (existing.orderNumber ?? 0) : Number(text(form, "orderNumber") || "0");
    if (!Number.isInteger(orderNumber) || orderNumber < 0 || orderNumber > 99) problems.add("Order number must be a whole number from 0 to 99.");

    for (const lang of ["no", "en"] as const) {
        const slug = convertToUrlFriendlyString(title[lang]);
        const sameUrl = videos.find((video, i) => i !== index && convertToUrlFriendlyString(video.title[lang]) === slug);
        if (slug && sameUrl)
            problems.add(`Another video already has the ${lang === "no" ? "Norwegian" : "English"} URL videos/${slug}/ ("${sameUrl.title[lang]}").`);
    }

    if (problems.any || date === null || lastmod === null || seconds === null) return problems.state();

    // Kept verbatim when the length did not change, so "PT1M0S" stays as
    // YouTube wrote it rather than becoming the equivalent "PT1M".
    const duration = existing && isoToSeconds(existing.duration) === seconds ? existing.duration : secondsToIso(seconds);
    const timestamp = existing && toOsloDate(existing.timestamp) === toOsloDate(date) ? existing.timestamp : date;
    // Six videos have no copyright field at all. Leave it absent on those
    // unless it is switched on, rather than writing false into each one.
    const copyright = checked(form, "copyright");

    let video: Video;
    if (existing) {
        video = {
            ...existing,
            timestamp,
            title,
            content,
            metaDescription,
            duration,
            thumbnailDescription,
            youTubeId,
            youTubeUser,
            youTubeChannelId,
            clips,
            lastmod
        };
        if (copyright || "copyright" in existing) video.copyright = copyright;
        if (!metaDescription) delete video.metaDescription;
        if (!clips.length) delete video.clips;
        if (lastmod === undefined) delete video.lastmod;
        videos[index] = video;
    } else {
        const { id, thumbnailFilename } = dateIdentifiers(timestamp, orderNumber);
        if (videos.some((other) => other.thumbnailFilename === thumbnailFilename)) {
            return {
                status: "error",
                errors: [`A video with image name ${thumbnailFilename} already exists. Use a higher order number for a second video on the same day.`]
            };
        }
        // Fields in the order the existing records have them.
        video = {
            copyright,
            timestamp,
            title,
            content,
            ...(metaDescription ? { metaDescription } : {}),
            duration,
            thumbnailDescription,
            thumbnailFilename,
            youTubeId,
            youTubeUser,
            youTubeChannelId,
            id
        };
        if (orderNumber > 0) video.orderNumber = orderNumber;
        if (clips.length) video.clips = clips;
        if (lastmod !== undefined) video.lastmod = lastmod;
        videos.splice(newestFirstPosition(videos, timestamp), 0, video);
    }

    await writeDataFile("videos", videos);
    revalidatePath("/videos", "layout");
    if (!existing) redirect(`/videos/${video.thumbnailFilename}/?created=1`);
    return { status: "saved", message: "Saved to src/data/videos/data/all.json." };
}

export async function deleteVideo(thumbnailFilename: string): Promise<void> {
    const videos = await readDataFile<Video[]>("videos");
    const remaining = videos.filter((video) => video.thumbnailFilename !== thumbnailFilename);
    if (remaining.length !== videos.length) await writeDataFile("videos", remaining);
    revalidatePath("/videos", "layout");
    redirect("/videos/?deleted=" + encodeURIComponent(thumbnailFilename));
}
