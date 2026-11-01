"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { IDLE } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { deletePost, savePost } from "../actions";

export type PostFormValues = {
    id: string | null;
    thumbnailFilename: string | null;
    date: string;
    lastmod: string;
    orderNumber: number;
    titleNo: string;
    titleEn: string;
    contentNo: string;
    contentEn: string;
    thumbnailDescription: string;
    copyright: boolean;
    linkKind: "none" | "internal" | "external";
    linkUrl: string;
    linkUrlNo: string;
    linkUrlEn: string;
    linkTextNo: string;
    linkTextEn: string;
};

export default function PostForm({ initial }: { initial: PostFormValues }) {
    const [state, formAction, pending] = useActionState(savePost.bind(null, initial.id), IDLE);
    const [titleNo, setTitleNo] = useState(initial.titleNo);
    const [titleEn, setTitleEn] = useState(initial.titleEn);
    const [linkKind, setLinkKind] = useState(initial.linkKind);
    const isNew = initial.id === null;

    const slugNo = convertToUrlFriendlyString(titleNo);
    const slugEn = convertToUrlFriendlyString(titleEn);
    const urlChanged = !isNew && (slugNo !== convertToUrlFriendlyString(initial.titleNo) || slugEn !== convertToUrlFriendlyString(initial.titleEn));

    /*
     * Submitted by hand rather than through <form action>, because React resets
     * a form after its action finishes - including when the action returned
     * validation errors, which would wipe everything that was just typed.
     */
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    const confirmDelete = async () => {
        if (initial.id && window.confirm(`Delete "${initial.titleNo}"? Its images under public/data/posts are left in place.`)) {
            await deletePost(initial.id);
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
                        The id and the image filename are made from the date and order number when the post is saved, and stay fixed after that. Use
                        order number 1 or higher for a second post on the same day.
                    </p>
                ) : (
                    <p className="admin-hint">
                        Id <code>{initial.id}</code>, images named <code>{initial.thumbnailFilename}_[size].[format]</code>. Both were set when the
                        post was created and do not follow later date changes.
                    </p>
                )}
            </fieldset>

            <fieldset>
                <legend>Title</legend>
                <div className="admin-row">
                    <label>
                        Norwegian
                        <input name="titleNo" value={titleNo} onChange={(event) => setTitleNo(event.target.value)} required />
                        <span className="admin-hint">/posts/{slugNo}/</span>
                    </label>
                    <label>
                        English
                        <input name="titleEn" value={titleEn} onChange={(event) => setTitleEn(event.target.value)} required />
                        <span className="admin-hint">/en/posts/{slugEn}/</span>
                    </label>
                </div>
                {urlChanged ? (
                    <p className="admin-warning">
                        The page URL comes from the title, so this changes it. Links to the old URL, and its place in search results, will break.
                    </p>
                ) : null}
            </fieldset>

            <fieldset>
                <legend>Text</legend>
                <p className="admin-hint">
                    Links are written as <code>[text](products/overtonium/)</code> for a page on the site, or with a full https:// address.
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
                <legend>Link</legend>
                <label>
                    Type
                    <select name="linkKind" value={linkKind} onChange={(event) => setLinkKind(event.target.value as PostFormValues["linkKind"])}>
                        <option value="none">No link</option>
                        <option value="internal">A page on this site</option>
                        <option value="external">Another website</option>
                    </select>
                </label>
                {linkKind === "internal" ? (
                    <div className="admin-row">
                        <label>
                            Norwegian path
                            <input name="linkUrlNo" defaultValue={initial.linkUrlNo} placeholder="products/overtonium/" />
                        </label>
                        <label>
                            English path
                            <input name="linkUrlEn" defaultValue={initial.linkUrlEn} placeholder="products/overtonium/" />
                        </label>
                    </div>
                ) : null}
                {linkKind === "external" ? (
                    <label>
                        URL
                        <input type="url" name="linkUrl" defaultValue={initial.linkUrl} placeholder="https://" />
                    </label>
                ) : null}
                {linkKind !== "none" ? (
                    <div className="admin-row">
                        <label>
                            Norwegian link text
                            <input name="linkTextNo" defaultValue={initial.linkTextNo} placeholder="Les mer" />
                        </label>
                        <label>
                            English link text
                            <input name="linkTextEn" defaultValue={initial.linkTextEn} placeholder="Read more" />
                        </label>
                    </div>
                ) : null}
            </fieldset>

            <div className="admin-actions">
                <button type="submit" className="admin-button" disabled={pending}>
                    {pending ? "Saving..." : isNew ? "Create post" : "Save"}
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
