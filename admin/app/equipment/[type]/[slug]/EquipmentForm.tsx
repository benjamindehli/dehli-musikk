"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { EquipmentTypeKey } from "data/equipment";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { IDLE, type FormState } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { deleteEquipment, saveEquipment } from "../../actions";

export default function EquipmentForm({ type, slug, brand, model }: { type: EquipmentTypeKey; slug: string | null; brand: string; model: string }) {
    const [state, formAction, pending] = useActionState(saveEquipment.bind(null, type, slug), IDLE);
    const [deleteState, setDeleteState] = useState<FormState>(IDLE);
    const [current, setCurrent] = useState({ brand, model });
    const isNew = slug === null;
    const newSlug = convertToUrlFriendlyString(`${current.brand} ${current.model}`);

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    const confirmDelete = async () => {
        if (slug && window.confirm(`Delete ${brand} ${model}? Its images under public/data/equipment are left in place.`)) {
            setDeleteState(await deleteEquipment(type, slug));
        }
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <FormStatus state={state} />
            <FormStatus state={deleteState} />
            <fieldset>
                <legend>Item</legend>
                <div className="admin-row">
                    <label>
                        Brand
                        <input
                            name="brand"
                            value={current.brand}
                            onChange={(event) => setCurrent({ ...current, brand: event.target.value })}
                            required
                        />
                    </label>
                    <label>
                        Model
                        <input
                            name="model"
                            value={current.model}
                            onChange={(event) => setCurrent({ ...current, model: event.target.value })}
                            required
                        />
                    </label>
                </div>
                <p className="admin-hint">
                    /equipment/{type}/{newSlug}/
                    {isNew
                        ? " - the URL and image names are made from the brand and model."
                        : newSlug === slug
                          ? ""
                          : " - this is a different URL from the current one, and saving will be refused. A rename is done by hand."}
                </p>
            </fieldset>
            <div className="admin-actions">
                <button type="submit" className="admin-button" disabled={pending}>
                    {pending ? "Saving..." : isNew ? "Create" : "Save"}
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
