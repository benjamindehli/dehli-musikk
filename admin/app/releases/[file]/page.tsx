import Link from "next/link";
import { notFound } from "next/navigation";
import type { Product, Release, ReleaseInstrumentLink } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, readReleases } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";
import { secondsToClock } from "@admin/lib/durations";
import ImagePanel from "@admin/components/ImagePanel";
import { existingThumbnails } from "@admin/lib/thumbnails";
import ReleaseForm, { type Choice, type ReleaseFormValues } from "./ReleaseForm";

export const dynamic = "force-dynamic";

function formValues(release: Release | undefined, file: string | null, links: ReleaseInstrumentLink[]): ReleaseFormValues {
    const own = release ? links.filter((link) => link.releaseId === release.slug) : [];
    return {
        file,
        slug: release?.slug ?? null,
        spotifyId: release?.id ?? "",
        artistName: release?.artistName ?? "",
        title: release?.title ?? "",
        genre: release?.genre ?? "",
        releaseDate: release ? toOsloDate(release.releaseDate) : "",
        duration: release ? secondsToClock(Math.floor(release.duration / 1000)) : "",
        isrcCode: release?.isrcCode ?? "",
        spotifyThumbnailUrl: release?.spotifyThumbnailUrl ?? "",
        jsonLdId: release?.jsonLdId ?? "",
        producedByDehliMusikk: Boolean(release?.producedByDehliMusikk),
        composedByDehliMusikk: Boolean(release?.composedByDehliMusikk),
        unreleased: Boolean(release?.unreleased),
        links: { ...(release?.links ?? {}) },
        instruments: own.filter((link) => !link.isProduct).map((link) => link.equipmentId),
        products: own.filter((link) => link.isProduct).map((link) => link.equipmentId)
    };
}

export default async function EditReleasePage({
    params,
    searchParams
}: {
    params: Promise<{ file: string }>;
    searchParams: Promise<{ created?: string }>;
}) {
    const { file } = await params;
    const { created } = await searchParams;
    const [releases, links, instrumentItems, products] = await Promise.all([
        readReleases<Release>(),
        readDataFile<ReleaseInstrumentLink[]>("releasesInstruments"),
        readDataFile<{ brand: string; model: string }[]>("instruments"),
        readDataFile<Product[]>("products")
    ]);
    const isNew = file === "new";
    const fileName = isNew ? null : `${decodeURIComponent(file)}.json`;
    const release = fileName ? releases[fileName] : undefined;
    if (!isNew && !release) notFound();

    // Ids are the slugs the site derives, so a link here resolves to the same item there.
    const instruments: Choice[] = instrumentItems
        .map((item) => ({ id: convertToUrlFriendlyString(`${item.brand} ${item.model}`), label: `${item.brand} ${item.model}` }))
        .sort((a, b) => a.label.localeCompare(b.label));
    const productChoices: Choice[] = products
        .map((product) => ({ id: convertToUrlFriendlyString(product.title), label: product.title }))
        .sort((a, b) => a.label.localeCompare(b.label));
    // A link to an id neither list knows would otherwise have no checkbox, and
    // vanish on the next save. None exist today; this keeps it that way.
    for (const link of links) {
        const list = link.isProduct ? productChoices : instruments;
        if (!list.some((choice) => choice.id === link.equipmentId)) list.push({ id: link.equipmentId, label: `${link.equipmentId} (not found)` });
    }
    const genres = [...new Set(Object.values(releases).map((candidate) => candidate.genre))].sort();

    return (
        <>
            <p>
                <Link href="/releases/">All releases</Link>
            </p>
            <h1>{release ? `${release.artistName} - ${release.title}` : "New release"}</h1>
            {created ? <p className="admin-status admin-status-saved">Created. It is saved to src/data/releases/data/{fileName}.</p> : null}
            <ReleaseForm
                key={file}
                initial={formValues(release, fileName, links)}
                instruments={instruments}
                products={productChoices}
                genres={genres}
            />
            {release ? (
                <ImagePanel
                    section="releases"
                    itemKey={release.thumbnailFilename}
                    name={release.thumbnailFilename}
                    existing={await existingThumbnails("releases", release.thumbnailFilename)}
                    sources={
                        release.spotifyThumbnailUrl.startsWith("https://i.scdn.co/")
                            ? [{ label: "Spotify cover art", url: release.spotifyThumbnailUrl }]
                            : []
                    }
                />
            ) : null}
        </>
    );
}
