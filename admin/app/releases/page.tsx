import Link from "next/link";
import type { Release, ReleaseInstrumentLink } from "types/content";
import { readDataFile, readReleases } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";

export const dynamic = "force-dynamic";

export default async function ReleasesPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
    const [releases, links] = await Promise.all([readReleases<Release>(), readDataFile<ReleaseInstrumentLink[]>("releasesInstruments")]);
    const { deleted } = await searchParams;
    const linkCount = (slug: string) => links.filter((link) => link.releaseId === slug).length;
    const sorted = Object.entries(releases).sort(([, a], [, b]) => b.releaseDate - a.releaseDate);

    return (
        <>
            <div className="admin-heading">
                <h1>Releases ({sorted.length})</h1>
                <Link className="admin-button" href="/releases/new/">
                    New release
                </Link>
            </div>
            {deleted ? <p className="admin-status admin-status-saved">Deleted {deleted}.</p> : null}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th scope="col">Released</th>
                        <th scope="col">Release</th>
                        <th scope="col">Genre</th>
                        <th scope="col">Instruments</th>
                    </tr>
                </thead>
                <tbody>
                    {sorted.map(([file, release]) => (
                        <tr key={file}>
                            <td>{toOsloDate(release.releaseDate)}</td>
                            <td>
                                <Link href={`/releases/${encodeURIComponent(file.replace(/\.json$/, ""))}/`}>{release.title}</Link>
                                <br />
                                <span className="admin-muted">
                                    {release.artistName}
                                    {release.unreleased ? " (unreleased)" : ""}
                                </span>
                            </td>
                            <td>{release.genre}</td>
                            <td>{linkCount(release.slug) || ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
