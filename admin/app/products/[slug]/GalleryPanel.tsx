"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import { IDLE, type FormState } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { addGalleryImage, encodeGallery } from "../actions";

/*
 * Adding gallery images, and encoding them. Separate from the product form
 * because a file upload saves straight away, while the form above may hold
 * unsaved edits - so after adding an image, the page reloads with it in place.
 */
export default function GalleryPanel({ slug }: { slug: string }) {
    const [state, formAction, pending] = useActionState(addGalleryImage.bind(null, slug), IDLE);
    const [encoding, setEncoding] = useState<{ busy: boolean; state: FormState }>({ busy: false, state: IDLE });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    const encode = async () => {
        setEncoding({ busy: true, state: IDLE });
        setEncoding({ busy: false, state: await encodeGallery() });
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <fieldset>
                <legend>Gallery images</legend>
                <FormStatus state={state} />
                <FormStatus state={encoding.state} />
                <p className="admin-hint">
                    Save any edits in the form above first: adding an image saves the product and reloads it. New images are named after the main
                    image with the next number, and stored full size in public/product-images.
                </p>
                <div className="admin-row admin-clip">
                    <label>
                        Add an image (PNG or JPEG)
                        <input type="file" name="file" accept="image/png,image/jpeg" />
                    </label>
                    <button type="submit" className="admin-button" disabled={pending}>
                        {pending ? "Adding..." : "Add to gallery"}
                    </button>
                </div>
                <div>
                    <button type="button" className="admin-button" onClick={encode} disabled={encoding.busy}>
                        {encoding.busy ? "Encoding, this can take a minute..." : "Encode gallery images (yarn images:products)"}
                    </button>
                </div>
            </fieldset>
        </form>
    );
}
