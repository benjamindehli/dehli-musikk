"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { IDLE } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { deleteVideo, saveVideo } from "../actions";

type ClipRow = { nameNo: string; nameEn: string; start: string; end: string };

export type Channel = { user: string; channelId: string };

export type VideoFormValues = {
    thumbnailFilename: string | null;
    id: string | null;
    date: string;
    lastmod: string;
    orderNumber: number;
    titleNo: string;
    titleEn: string;
    contentNo: string;
    contentEn: string;
    metaDescriptionNo: string;
    metaDescriptionEn: string;
    duration: string;
    thumbnailDescription: string;
    copyright: boolean;
    youTubeId: string;
    youTubeUser: string;
    youTubeChannelId: string;
    clips: ClipRow[];
};

// Search results and social cards show about this much of a description.
const SNIPPET_LENGTH = 155;

function getValidYouTubeId(value: string): string | null {
    const trimmed = value.trim();
    return /^[A-Za-z0-9_-]{11}$/.test(trimmed) ? trimmed : null;
}

export default function VideoForm({ initial, channels }: { initial: VideoFormValues; channels: Channel[] }) {
    const [state, formAction, pending] = useActionState(saveVideo.bind(null, initial.thumbnailFilename), IDLE);
    const [titleNo, setTitleNo] = useState(initial.titleNo);
    const [titleEn, setTitleEn] = useState(initial.titleEn);
    const [youTubeId, setYouTubeId] = useState(initial.youTubeId);
    const [youTubeUser, setYouTubeUser] = useState(initial.youTubeUser);
    const [youTubeChannelId, setYouTubeChannelId] = useState(initial.youTubeChannelId);
    const [metaNo, setMetaNo] = useState(initial.metaDescriptionNo);
    const [metaEn, setMetaEn] = useState(initial.metaDescriptionEn);
    const [clips, setClips] = useState<ClipRow[]>(initial.clips);
    const isNew = initial.thumbnailFilename === null;

    const slugNo = convertToUrlFriendlyString(titleNo);
    const slugEn = convertToUrlFriendlyString(titleEn);
    const urlChanged = !isNew && (slugNo !== convertToUrlFriendlyString(initial.titleNo) || slugEn !== convertToUrlFriendlyString(initial.titleEn));
    const validYouTubeId = getValidYouTubeId(youTubeId);

    const updateClip = (index: number, field: keyof ClipRow, value: string) =>
        setClips((rows) => rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
    // A new clip starts where the last one ended, which is how every clip list in the data runs.
    const addClip = () => setClips((rows) => [...rows, { nameNo: "", nameEn: "", start: rows.at(-1)?.end ?? "0:00", end: "" }]);
    const removeClip = (index: number) => setClips((rows) => rows.filter((_, i) => i !== index));

    // Picking a known channel by its handle fills in its display name too.
    const chooseChannel = (channelId: string) => {
        setYouTubeChannelId(channelId);
        const known = channels.find((channel) => channel.channelId === channelId);
        if (known) setYouTubeUser(known.user);
    };

    // See PostForm: submitted by hand so React does not reset the form on errors.
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    const confirmDelete = async () => {
        if (initial.thumbnailFilename && window.confirm(`Delete "${initial.titleNo}"? Its images under public/data/videos are left in place.`)) {
            await deleteVideo(initial.thumbnailFilename);
        }
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <FormStatus state={state} />

            <fieldset>
                <legend>Identifiers</legend>
                <div className="admin-row">
                    <label>
                        Date
                        <input type="date" name="date" defaultValue={initial.date} required />
                    </label>
                    <label>
                        Modified (optional)
                        <input type="date" name="lastmod" defaultValue={initial.lastmod} />
                    </label>
                    <label>
                        Order number
                        <input type="number" name="orderNumber" min={0} max={99} defaultValue={initial.orderNumber} disabled={!isNew} />
                    </label>
                </div>
                {isNew ? (
                    <p className="admin-hint">
                        The id and the image filename are made from the date and order number when the video is saved, and stay fixed after that. Use
                        order number 1 or higher for a second video on the same day.
                    </p>
                ) : (
                    <p className="admin-hint">
                        {initial.id ? (
                            <>
                                Id <code>{initial.id}</code>,{" "}
                            </>
                        ) : (
                            "No id, "
                        )}
                        images named <code>{initial.thumbnailFilename}_[size].[format]</code>. Set when the video was created; they do not follow
                        later date changes.
                    </p>
                )}
            </fieldset>

            <fieldset>
                <legend>YouTube</legend>
                <div className="admin-row">
                    <label>
                        Video id
                        <input
                            name="youTubeId"
                            value={youTubeId}
                            onChange={(event) => setYouTubeId(event.target.value)}
                            required
                            maxLength={11}
                            placeholder="dQw4w9WgXcQ"
                        />
                        {validYouTubeId ? (
                            <a
                                className="admin-hint"
                                href={`https://www.youtube.com/watch?v=${encodeURIComponent(validYouTubeId)}`}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Open on YouTube
                            </a>
                        ) : null}
                    </label>
                    <label>
                        Length
                        <input name="duration" defaultValue={initial.duration} required placeholder="4:13" />
                    </label>
                </div>
                <div className="admin-row">
                    <label>
                        Channel handle
                        <input
                            name="youTubeChannelId"
                            list="youtube-channels"
                            value={youTubeChannelId}
                            onChange={(event) => chooseChannel(event.target.value)}
                            required
                        />
                    </label>
                    <label>
                        Channel name
                        <input name="youTubeUser" value={youTubeUser} onChange={(event) => setYouTubeUser(event.target.value)} required />
                    </label>
                </div>
                <datalist id="youtube-channels">
                    {channels.map((channel) => (
                        <option key={channel.channelId} value={channel.channelId}>
                            {channel.user}
                        </option>
                    ))}
                </datalist>
            </fieldset>

            <fieldset>
                <legend>Title</legend>
                <div className="admin-row">
                    <label>
                        Norwegian
                        <input name="titleNo" value={titleNo} onChange={(event) => setTitleNo(event.target.value)} required />
                        <span className="admin-hint">/videos/{slugNo}/</span>
                    </label>
                    <label>
                        English
                        <input name="titleEn" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} required />
                        <span className="admin-hint">/en/videos/{slugEn}/</span>
                    </label>
                </div>
                {urlChanged ? (
                    <p className="admin-warning">
                        The page URL comes from the title, so this changes it. Links to the old URL, and its place in search results, will break.
                    </p>
                ) : null}
            </fieldset>

            <fieldset>
                <legend>Description</legend>
                <p className="admin-hint">
                    One paragraph per line. Links are written as <code>[text](equipment/instruments/korg-ms-20/)</code> for a page on the site.
                </p>
                <div className="admin-row">
                    <label>
                        Norwegian
                        <textarea name="contentNo" defaultValue={initial.contentNo} rows={10} required />
                    </label>
                    <label>
                        English
                        <textarea name="contentEn" defaultValue={initial.contentEn} rows={10} required />
                    </label>
                </div>
            </fieldset>

            <fieldset>
                <legend>Meta description (optional)</legend>
                <p className="admin-hint">
                    Search results show roughly the first {SNIPPET_LENGTH} characters of the description. Only write one here when those would read
                    the same as another video&apos;s, for example a series of demos that open the same way.
                </p>
                <div className="admin-row">
                    <label>
                        Norwegian
                        <textarea name="metaDescriptionNo" value={metaNo} onChange={(event) => setMetaNo(event.target.value)} rows={3} />
                        <span className="admin-hint">
                            {metaNo.length} / {SNIPPET_LENGTH}
                        </span>
                    </label>
                    <label>
                        English
                        <textarea name="metaDescriptionEn" value={metaEn} onChange={(event) => setMetaEn(event.target.value)} rows={3} />
                        <span className="admin-hint">
                            {metaEn.length} / {SNIPPET_LENGTH}
                        </span>
                    </label>
                </div>
            </fieldset>

            <fieldset>
                <legend>Image</legend>
                <div className="admin-row">
                    <label>
                        Image description (alt text)
                        <input name="thumbnailDescription" defaultValue={initial.thumbnailDescription} required />
                    </label>
                    <label className="admin-checkbox">
                        <input type="checkbox" name="copyright" defaultChecked={initial.copyright} />
                        Image copyright belongs to Dehli Musikk
                    </label>
                </div>
            </fieldset>

            <fieldset>
                <legend>Clips ({clips.length})</legend>
                <p className="admin-hint">Chapters inside the video, in order. Search engines can link straight to each one.</p>
                {clips.map((clip, index) => (
                    <div className="admin-row admin-clip" key={index}>
                        <label>
                            Norwegian name
                            <input name="clipNameNo" value={clip.nameNo} onChange={(event) => updateClip(index, "nameNo", event.target.value)} />
                        </label>
                        <label>
                            English name
                            <input name="clipNameEn" value={clip.nameEn} onChange={(event) => updateClip(index, "nameEn", event.target.value)} />
                        </label>
                        <label className="admin-narrow">
                            Start
                            <input
                                name="clipStart"
                                value={clip.start}
                                onChange={(event) => updateClip(index, "start", event.target.value)}
                                placeholder="0:00"
                            />
                        </label>
                        <label className="admin-narrow">
                            End
                            <input
                                name="clipEnd"
                                value={clip.end}
                                onChange={(event) => updateClip(index, "end", event.target.value)}
                                placeholder="1:05"
                            />
                        </label>
                        <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => removeClip(index)}
                            aria-label={`Remove clip ${index + 1}`}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div>
                    <button type="button" className="admin-button" onClick={addClip}>
                        Add clip
                    </button>
                </div>
            </fieldset>

            <div className="admin-actions">
                <button type="submit" className="admin-button" disabled={pending}>
                    {pending ? "Saving..." : isNew ? "Create video" : "Save"}
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
