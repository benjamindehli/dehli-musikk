import Link from "next/link";
import type { Video } from "types/content";
import { readDataFile } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";
import { isoToSeconds, secondsToClock } from "@admin/lib/durations";

export const dynamic = "force-dynamic";

export default async function VideosPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
    const videos = await readDataFile<Video[]>("videos");
    const { deleted } = await searchParams;

    return (
        <>
            <div className="admin-heading">
                <h1>Videos ({videos.length})</h1>
                <Link className="admin-button" href="/videos/new/">
                    New video
                </Link>
            </div>
            {deleted ? <p className="admin-status admin-status-saved">Deleted video {deleted}.</p> : null}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Title</th>
                        <th scope="col">Length</th>
                        <th scope="col">Clips</th>
                    </tr>
                </thead>
                <tbody>
                    {videos.map((video) => (
                        <tr key={video.thumbnailFilename}>
                            <td>{toOsloDate(video.timestamp)}</td>
                            <td>
                                <Link href={`/videos/${video.thumbnailFilename}/`}>{video.title.no}</Link>
                                <br />
                                <span className="admin-muted">{video.title.en}</span>
                            </td>
                            <td>{secondsToClock(isoToSeconds(video.duration) ?? 0)}</td>
                            <td>{video.clips?.length || ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
