"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { ReleaseLinks } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { IDLE, type FormState } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { deleteRelease, fetchFromOdesli, saveRelease } from "../actions";
import { RELEASE_PLATFORMS } from "../platforms";

export type Choice = { id: string; label: string };

export type ReleaseFormValues = {
    file: string | null;
    slug: string | null;
    spotifyId: string;
    artistName: string;
    title: string;
    genre: string;
    releaseDate: string;
    duration: string;
    isrcCode: string;
    spotifyThumbnailUrl: string;
    jsonLdId: string;
    producedByDehliMusikk: boolean;
    composedByDehliMusikk: boolean;
    unreleased: boolean;
    links: ReleaseLinks;
    instruments: string[];
    products: string[];
};

export default function ReleaseForm({
    initial,
    instruments,
    products,
    genres
}: {
    initial: ReleaseFormValues;
    instruments: Choice[];
    products: Choice[];
    genres: string[];
}) {
    const [state, formAction, pending] = useActionState(saveRelease.bind(null, initial.file), IDLE);
    const [deleteState, setDeleteState] = useState<FormState>(IDLE);
    // The fields an Odesli lookup can fill are controlled, so a lookup can write into them.
    const [spotifyId, setSpotifyId] = useState(initial.spotifyId);
    const [artistName, setArtistName] = useState(initial.artistName);
    const [title, setTitle] = useState(initial.title);
    const [thumbnail, setThumbnail] = useState(initial.spotifyThumbnailUrl);
    const [links, setLinks] = useState<ReleaseLinks>(initial.links);
    const [lookup, setLookup] = useState<{ busy: boolean; message?: string }>({ busy: false });
    const isNew = initial.file === null;
    const slug = initial.slug ?? convertToUrlFriendlyString(`${artistName} ${title}`);

    /*
     * Fills only what is still empty. A lookup on an existing release is for
     * picking up services the track has appeared on since, not for replacing
     * links someone chose by hand.
     */
    const lookUp = async () => {
        setLookup({ busy: true });
        const result = await fetchFromOdesli(spotifyId);
        if (!result.ok) {
            setLookup({ busy: false, message: result.error });
            return;
        }
        const added = Object.keys(result.links).filter((key) => !links[key as keyof ReleaseLinks]);
        setLinks((current) => ({ ...result.links, ...Object.fromEntries(Object.entries(current).filter(([, url]) => url)) }));
        if (!artistName && result.artistName) setArtistName(result.artistName);
        if (!title && result.title) setTitle(result.title);
        if (!thumbnail && result.thumbnailUrl) setThumbnail(result.thumbnailUrl);
        setSpotifyId(spotifyId.replace(/\?.*$/, "").trim());
        setLookup({
            busy: false,
            message: added.length ? `Added ${added.length} link(s): ${added.join(", ")}. Review, then save.` : "Nothing new found."
        });
    };

    // See PostForm: submitted by hand so React does not reset the form on errors.
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    const confirmDelete = async () => {
        if (
            initial.file &&
            window.confirm(`Delete "${initial.artistName} - ${initial.title}" and its instrument links? Its cover images are left in place.`)
        ) {
            setDeleteState(await deleteRelease(initial.file));
        }
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <FormStatus state={state} />
            <FormStatus state={deleteState} />

            <fieldset>
                <legend>Spotify</legend>
                <div className="admin-row admin-clip">
                    <label>
                        Spotify track id
                        <input name="spotifyId" value={spotifyId} onChange={(event) => setSpotifyId(event.target.value)} required />
                    </label>
                    <button type="button" className="admin-button" onClick={lookUp} disabled={lookup.busy || !spotifyId}>
                        {lookup.busy ? "Looking up..." : "Fill from Odesli"}
                    </button>
                </div>
                <p className="admin-hint">
                    Odesli (song.link) finds the title, artist, cover and the same track on other services. ISRC, genre, length and date are not in
                    its answer.
                </p>
                {lookup.message ? <p className="admin-status admin-status-saved">{lookup.message}</p> : null}
            </fieldset>

            <fieldset>
                <legend>Release</legend>
                <div className="admin-row">
                    <label>
                        Artist
                        <input name="artistName" value={artistName} onChange={(event) => setArtistName(event.target.value)} required />
                    </label>
                    <label>
                        Title
                        <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
                    </label>
                </div>
                <p className="admin-hint">
                    /portfolio/{slug}/
                    {isNew
                        ? " - made from the artist and title when the release is created, then fixed: instrument links and albums refer to it."
                        : " - fixed when the release was created, so renaming it here does not move the page."}
                </p>
                <div className="admin-row">
                    <label>
                        Genre
                        <input name="genre" list="release-genres" defaultValue={initial.genre} required />
                    </label>
                    <label>
                        Release date
                        <input type="date" name="releaseDate" defaultValue={initial.releaseDate} required />
                    </label>
                    <label>
                        Length
                        <input name="duration" defaultValue={initial.duration} required placeholder="5:25" />
                    </label>
                    <label>
                        ISRC
                        <input name="isrcCode" defaultValue={initial.isrcCode} placeholder="DEUJ62100289" />
                    </label>
                </div>
                <datalist id="release-genres">
                    {genres.map((genre) => (
                        <option key={genre} value={genre} />
                    ))}
                </datalist>
                <div className="admin-row">
                    <label className="admin-checkbox">
                        <input type="checkbox" name="producedByDehliMusikk" defaultChecked={initial.producedByDehliMusikk} />
                        Produced by Dehli Musikk
                    </label>
                    <label className="admin-checkbox">
                        <input type="checkbox" name="composedByDehliMusikk" defaultChecked={initial.composedByDehliMusikk} />
                        Composed by Dehli Musikk
                    </label>
                    <label className="admin-checkbox">
                        <input type="checkbox" name="unreleased" defaultChecked={initial.unreleased} />
                        Not released yet
                    </label>
                </div>
            </fieldset>

            <fieldset>
                <legend>Cover and identity</legend>
                <label>
                    Cover image URL
                    <input
                        name="spotifyThumbnailUrl"
                        value={thumbnail}
                        onChange={(event) => setThumbnail(event.target.value)}
                        placeholder="https://i.scdn.co/image/..."
                    />
                </label>
                <label>
                    JSON-LD id (optional)
                    <input name="jsonLdId" defaultValue={initial.jsonLdId} placeholder="https://musicbrainz.org/recording/..." />
                    <span className="admin-hint">
                        Usually the MusicBrainz recording. The GitHub Pages projects reuse these ids, so a change here must be made there too.
                    </span>
                </label>
            </fieldset>

            <fieldset>
                <legend>Links</legend>
                <div className="admin-links">
                    {RELEASE_PLATFORMS.map((platform) => (
                        <label key={platform.key}>
                            {platform.label}
                            <input
                                name={`link_${platform.key}`}
                                value={links[platform.key] ?? ""}
                                onChange={(event) => setLinks((current) => ({ ...current, [platform.key]: event.target.value }))}
                            />
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend>Instruments heard on it ({initial.instruments.length} linked)</legend>
                <div className="admin-choices">
                    {instruments.map((choice) => (
                        <label key={choice.id} className="admin-checkbox">
                            <input type="checkbox" name="instrument" value={choice.id} defaultChecked={initial.instruments.includes(choice.id)} />
                            {choice.label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <fieldset>
                <legend>Dehli Musikk products used on it</legend>
                <div className="admin-choices">
                    {products.map((choice) => (
                        <label key={choice.id} className="admin-checkbox">
                            <input type="checkbox" name="product" value={choice.id} defaultChecked={initial.products.includes(choice.id)} />
                            {choice.label}
                        </label>
                    ))}
                </div>
            </fieldset>

            <div className="admin-actions">
                <button type="submit" className="admin-button" disabled={pending}>
                    {pending ? "Saving..." : isNew ? "Create release" : "Save"}
                </button>
                {!isNew ? (
                    <button type="button" className="admin-button admin-button-danger" onClick={confirmDelete} disabled={pending}>
                        Delete
                    </button>
                ) : null}
            </div>
        </form>
    );
}
