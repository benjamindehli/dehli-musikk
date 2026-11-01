"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { CROP_POSITIONS, IMAGE_SECTIONS, type ImageSectionKey } from "@admin/lib/imageSpecs";
import { IDLE } from "@admin/lib/forms";
import type { ExistingSet } from "@admin/lib/thumbnails";
import FormStatus from "@admin/components/FormStatus";
import { makeThumbnails } from "@admin/app/images/actions";

export type OnlineSource = { label: string; url: string };

/*
 * The thumbnail set for one item: what is on disk now, and a way to replace
 * all of it from one image. A separate form from the item's own, since HTML
 * forms cannot nest and the two are saved independently.
 */
export default function ImagePanel({
    section,
    itemKey,
    name,
    existing,
    sources = []
}: {
    section: ImageSectionKey;
    itemKey: string;
    name: string;
    existing: ExistingSet;
    sources?: OnlineSource[];
}) {
    const [state, formAction, pending] = useActionState(makeThumbnails.bind(null, section, itemKey), IDLE);
    const spec = IMAGE_SECTIONS[section];
    const missing = spec.sizes.filter((size) => !existing.sizes.includes(size.width)).map((size) => `${size.width}x${size.height}`);
    const previewWidth = existing.sizes.includes(540) ? 540 : existing.sizes.at(-1);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <fieldset>
                <legend>Thumbnails</legend>
                <FormStatus state={state} />
                <div className="admin-row">
                    {previewWidth ? (
                        <img
                            className="admin-preview"
                            src={`/preview${spec.dir.replace(/^\/data/, "")}/jpg/${name}_${previewWidth}.jpg?v=${existing.version}`}
                            alt="The current thumbnail"
                        />
                    ) : (
                        <p className="admin-hint">No thumbnails yet.</p>
                    )}
                    <div className="admin-form">
                        <p className="admin-hint">
                            Files are named <code>{name}_[width].[avif|webp|jpg]</code>. Sizes:{" "}
                            {spec.sizes.map((size) => `${size.width}x${size.height}`).join(", ")}.
                            {missing.length ? ` Missing now: ${missing.join(", ")}.` : " All present."}
                        </p>
                        <label>
                            Upload an image
                            <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic" />
                        </label>
                        {sources.length ? (
                            <label>
                                Or use
                                <select name="sourceUrl" defaultValue="">
                                    <option value="">(the uploaded file)</option>
                                    {sources.map((source) => (
                                        <option key={source.url} value={source.url}>
                                            {source.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        ) : null}
                        <label>
                            Crop from
                            <select name="position" defaultValue="centre">
                                {Object.entries(CROP_POSITIONS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <div>
                            <button type="submit" className="admin-button" disabled={pending}>
                                {pending ? "Making thumbnails..." : "Make all thumbnails"}
                            </button>
                        </div>
                    </div>
                </div>
            </fieldset>
        </form>
    );
}
