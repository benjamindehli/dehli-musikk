import Link from "next/link";
import { notFound } from "next/navigation";
import type { Video } from "types/content";
import { readDataFile } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";
import { isoToSeconds, secondsToClock } from "@admin/lib/durations";
import VideoForm, { type Channel, type VideoFormValues } from "./VideoForm";
import ImagePanel from "@admin/components/ImagePanel";
import { existingThumbnails } from "@admin/lib/thumbnails";

export const dynamic = "force-dynamic";

function formValues(video: Video | undefined): VideoFormValues {
    return {
        thumbnailFilename: video?.thumbnailFilename ?? null,
        id: video?.id ?? null,
        date: video ? toOsloDate(video.timestamp) : toOsloDate(Date.now()),
        lastmod: video?.lastmod ? toOsloDate(video.lastmod) : "",
        orderNumber: video?.orderNumber ?? 0,
        titleNo: video?.title.no ?? "",
        titleEn: video?.title.en ?? "",
        contentNo: video?.content.no ?? "",
        contentEn: video?.content.en ?? "",
        metaDescriptionNo: video?.metaDescription?.no ?? "",
        metaDescriptionEn: video?.metaDescription?.en ?? "",
        duration: video ? secondsToClock(isoToSeconds(video.duration) ?? 0) : "",
        thumbnailDescription: video?.thumbnailDescription ?? "",
        copyright: video ? Boolean(video.copyright) : true,
        youTubeId: video?.youTubeId ?? "",
        // A new video is most likely on the site's own channel.
        youTubeUser: video?.youTubeUser ?? "Benjamin Dehli",
        youTubeChannelId: video?.youTubeChannelId ?? "@BenjaminDehli",
        clips: (video?.clips ?? []).map((clip) => ({
            nameNo: clip.name.no,
            nameEn: clip.name.en,
            start: secondsToClock(clip.startOffset),
            end: secondsToClock(clip.endOffset)
        }))
    };
}

export default async function EditVideoPage({
    params,
    searchParams
}: {
    params: Promise<{ file: string }>;
    searchParams: Promise<{ created?: string }>;
}) {
    const { file } = await params;
    const { created } = await searchParams;
    const videos = await readDataFile<Video[]>("videos");
    const isNew = file === "new";
    const video = isNew ? undefined : videos.find((candidate) => candidate.thumbnailFilename === file);
    if (!isNew && !video) notFound();

    // Every channel the data already names, for the channel fields to suggest.
    const channels = new Map<string, Channel>();
    for (const { youTubeUser, youTubeChannelId } of videos) channels.set(youTubeChannelId, { user: youTubeUser.trim(), channelId: youTubeChannelId });

    return (
        <>
            <p>
                <Link href="/videos/">All videos</Link>
            </p>
            <h1>{video ? video.title.no : "New video"}</h1>
            {created ? <p className="admin-status admin-status-saved">Created. It is saved to src/data/videos/data/all.json.</p> : null}
            <VideoForm key={file} initial={formValues(video)} channels={[...channels.values()]} />
            {video ? (
                <ImagePanel
                    section="videos"
                    itemKey={video.thumbnailFilename}
                    name={video.thumbnailFilename}
                    existing={await existingThumbnails("videos", video.thumbnailFilename)}
                    sources={[
                        // maxresdefault is 1280x720 but only exists for videos uploaded in HD; hqdefault always does, at 480x360.
                        { label: "YouTube thumbnail, full size", url: `https://i.ytimg.com/vi/${video.youTubeId}/maxresdefault.jpg` },
                        { label: "YouTube thumbnail, 480 wide", url: `https://i.ytimg.com/vi/${video.youTubeId}/hqdefault.jpg` }
                    ]}
                />
            ) : null}
        </>
    );
}
