"use client";

import { startTransition, useActionState, useState, type FormEvent } from "react";
import type { ProductEquipmentRelation } from "types/content";
import { IDLE } from "@admin/lib/forms";
import FormStatus from "@admin/components/FormStatus";
import { saveProduct } from "../actions";

type GalleryRow = { file: string; preview: string | null; captionNo: string; captionEn: string };
type FormatRow = { name: string; operatingSystem: string };
type EquipmentRow = { equipmentId: string; relation: ProductEquipmentRelation };

export type EquipmentChoice = { id: string; label: string; type: string };

export type ProductFormValues = {
    slug: string | null;
    date: string;
    lastmod: string;
    title: string;
    contentNo: string;
    contentEn: string;
    thumbnailDescription: string;
    price: string;
    priceCurrency: string;
    linkUrl: string;
    linkTextNo: string;
    linkTextEn: string;
    documentationUrl: string;
    documentationTextNo: string;
    documentationTextEn: string;
    sameAs: string;
    productType: string[];
    operatingSystem: string;
    formats: FormatRow[];
    license: string;
    softwareVersion: string;
    fileSize: string;
    gallery: GalleryRow[];
    videoUrl: string;
    videoUploadDate: string;
    videoNameNo: string;
    videoNameEn: string;
    videoDescriptionNo: string;
    videoDescriptionEn: string;
    equipment: EquipmentRow[];
};

const RELATION_LABELS: Record<ProductEquipmentRelation, string> = {
    sampled: "Sampled in it",
    effect: "Effect used on the samples",
    controls: "Controlled by it"
};

/** Move one row of a list up or down. */
function move<T>(rows: T[], index: number, by: -1 | 1): T[] {
    const target = index + by;
    if (target < 0 || target >= rows.length) return rows;
    const copy = [...rows];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    return copy;
}

export default function ProductForm({
    initial,
    equipment,
    productTypes,
    systems,
    formatNames
}: {
    initial: ProductFormValues;
    equipment: EquipmentChoice[];
    productTypes: string[];
    systems: string[];
    formatNames: string[];
}) {
    const [state, formAction, pending] = useActionState(saveProduct.bind(null, initial.slug), IDLE);
    const [formats, setFormats] = useState<FormatRow[]>(initial.formats);
    const [gallery, setGallery] = useState<GalleryRow[]>(initial.gallery);
    const [links, setLinks] = useState<EquipmentRow[]>(initial.equipment);
    const isNew = initial.slug === null;
    // The product's own types first, in its order, so saving does not reorder them.
    const typeChoices = [...initial.productType, ...productTypes.filter((type) => !initial.productType.includes(type))];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        startTransition(() => formAction(data));
    };

    return (
        <form onSubmit={submit} className="admin-form">
            <FormStatus state={state} />

            <fieldset>
                <legend>Product</legend>
                <div className="admin-row">
                    <label>
                        Title
                        <input name="title" defaultValue={initial.title} required />
                        <span className="admin-hint">
                            {isNew
                                ? "The URL, image names and every link to the product are made from the title."
                                : `URL /products/${initial.slug}/. Spelling fixes that keep this URL are fine; a real rename is done by hand.`}
                        </span>
                    </label>
                    <label>
                        Date
                        <input type="date" name="date" defaultValue={initial.date} required />
                    </label>
                    <label>
                        Modified (optional)
                        <input type="date" name="lastmod" defaultValue={initial.lastmod} />
                    </label>
                </div>
                <div className="admin-row">
                    <label>
                        Norwegian description
                        <textarea name="contentNo" defaultValue={initial.contentNo} rows={12} required />
                    </label>
                    <label>
                        English description
                        <textarea name="contentEn" defaultValue={initial.contentEn} rows={12} required />
                    </label>
                </div>
                <label>
                    Main image description (alt text)
                    <input name="thumbnailDescription" defaultValue={initial.thumbnailDescription} required />
                </label>
            </fieldset>

            <fieldset>
                <legend>Price and store</legend>
                <div className="admin-row">
                    <label className="admin-narrow">
                        Price
                        <input name="price" defaultValue={initial.price} required />
                    </label>
                    <label className="admin-narrow">
                        Currency
                        <input name="priceCurrency" defaultValue={initial.priceCurrency} required />
                    </label>
                    <label>
                        Store link
                        <input type="url" name="linkUrl" defaultValue={initial.linkUrl} required placeholder="https://store.dehlimusikk.no/l/..." />
                    </label>
                </div>
                <p className="admin-hint">Everything in the store is pay what you want, so the price is the minimum. 0.00 makes it free.</p>
                <div className="admin-row">
                    <label>
                        Norwegian link text
                        <input name="linkTextNo" defaultValue={initial.linkTextNo} required />
                    </label>
                    <label>
                        English link text
                        <input name="linkTextEn" defaultValue={initial.linkTextEn} required />
                    </label>
                </div>
                <div className="admin-row">
                    <label>
                        Documentation link (optional)
                        <input type="url" name="documentationUrl" defaultValue={initial.documentationUrl} />
                    </label>
                    <label>
                        Norwegian text
                        <input name="documentationTextNo" defaultValue={initial.documentationTextNo} placeholder="Les dokumentasjonen" />
                    </label>
                    <label>
                        English text
                        <input name="documentationTextEn" defaultValue={initial.documentationTextEn} placeholder="Read the documentation" />
                    </label>
                </div>
                <label>
                    Same as (one address per line: store pages, KVR, GitHub, the demo video)
                    <textarea name="sameAs" defaultValue={initial.sameAs} rows={6} />
                </label>
            </fieldset>

            <fieldset>
                <legend>Type and platforms</legend>
                <div className="admin-choices">
                    {typeChoices.map((type) => (
                        <label key={type} className="admin-checkbox">
                            <input type="checkbox" name="productType" value={type} defaultChecked={initial.productType.includes(type)} />
                            {type}
                        </label>
                    ))}
                </div>
                <label>
                    Other types (comma separated)
                    <input name="productTypeOther" />
                </label>
                <div className="admin-row">
                    <label>
                        Operating systems
                        <input
                            name="operatingSystem"
                            list="product-systems"
                            defaultValue={initial.operatingSystem}
                            placeholder="macOS, Windows, Linux"
                        />
                    </label>
                    <label>
                        Licence URL (open source only)
                        <input type="url" name="license" defaultValue={initial.license} />
                    </label>
                    <label className="admin-narrow">
                        Version
                        <input name="softwareVersion" defaultValue={initial.softwareVersion} />
                    </label>
                    <label className="admin-narrow">
                        File size
                        <input name="fileSize" defaultValue={initial.fileSize} placeholder="637.8 MB" />
                    </label>
                </div>
                <datalist id="product-systems">
                    {systems.map((system) => (
                        <option key={system} value={system} />
                    ))}
                </datalist>
                <datalist id="format-names">
                    {formatNames.map((name) => (
                        <option key={name} value={name} />
                    ))}
                </datalist>
                <p className="admin-hint">Formats, each with the systems that format runs on, which can differ from the product&apos;s own.</p>
                {formats.map((format, index) => (
                    <div className="admin-row admin-clip" key={index}>
                        <label>
                            Format
                            <input
                                name="formatName"
                                list="format-names"
                                value={format.name}
                                onChange={(event) =>
                                    setFormats((rows) => rows.map((row, i) => (i === index ? { ...row, name: event.target.value } : row)))
                                }
                            />
                        </label>
                        <label>
                            Runs on
                            <input
                                name="formatOs"
                                list="product-systems"
                                value={format.operatingSystem}
                                onChange={(event) =>
                                    setFormats((rows) => rows.map((row, i) => (i === index ? { ...row, operatingSystem: event.target.value } : row)))
                                }
                            />
                        </label>
                        <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => setFormats((rows) => rows.filter((_, i) => i !== index))}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div>
                    <button type="button" className="admin-button" onClick={() => setFormats((rows) => [...rows, { name: "", operatingSystem: "" }])}>
                        Add format
                    </button>
                </div>
            </fieldset>

            <fieldset>
                <legend>Demo video (optional)</legend>
                <div className="admin-row">
                    <label>
                        YouTube address
                        <input type="url" name="videoUrl" defaultValue={initial.videoUrl} placeholder="https://www.youtube.com/watch?v=" />
                    </label>
                    <label className="admin-narrow">
                        Uploaded
                        <input type="date" name="videoUploadDate" defaultValue={initial.videoUploadDate} />
                    </label>
                </div>
                <div className="admin-row">
                    <label>
                        Norwegian name
                        <input name="videoNameNo" defaultValue={initial.videoNameNo} />
                    </label>
                    <label>
                        English name
                        <input name="videoNameEn" defaultValue={initial.videoNameEn} />
                    </label>
                </div>
                <div className="admin-row">
                    <label>
                        Norwegian description
                        <input name="videoDescriptionNo" defaultValue={initial.videoDescriptionNo} />
                    </label>
                    <label>
                        English description
                        <input name="videoDescriptionEn" defaultValue={initial.videoDescriptionEn} />
                    </label>
                </div>
            </fieldset>

            <fieldset>
                <legend>Gallery ({gallery.length})</legend>
                <p className="admin-hint">
                    Order and captions are saved with the product. Add images with the gallery panel below the form; removing one here takes it off
                    the page but leaves the file in public/product-images.
                </p>
                {gallery.map((row, index) => (
                    <div className="admin-row admin-clip" key={row.file}>
                        {row.preview ? (
                            <img className="admin-gallery-thumb" src={row.preview} alt="" />
                        ) : (
                            <span className="admin-gallery-thumb admin-hint">Not encoded</span>
                        )}
                        <input type="hidden" name="galleryFile" value={row.file} />
                        <label>
                            {row.file} - Norwegian caption
                            <input
                                name="galleryCaptionNo"
                                value={row.captionNo}
                                onChange={(event) =>
                                    setGallery((rows) => rows.map((item, i) => (i === index ? { ...item, captionNo: event.target.value } : item)))
                                }
                            />
                        </label>
                        <label>
                            English caption
                            <input
                                name="galleryCaptionEn"
                                value={row.captionEn}
                                onChange={(event) =>
                                    setGallery((rows) => rows.map((item, i) => (i === index ? { ...item, captionEn: event.target.value } : item)))
                                }
                            />
                        </label>
                        <button
                            type="button"
                            className="admin-button"
                            onClick={() => setGallery((rows) => move(rows, index, -1))}
                            aria-label={`Move ${row.file} up`}
                        >
                            ↑
                        </button>
                        <button
                            type="button"
                            className="admin-button"
                            onClick={() => setGallery((rows) => move(rows, index, 1))}
                            aria-label={`Move ${row.file} down`}
                        >
                            ↓
                        </button>
                        <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => setGallery((rows) => rows.filter((_, i) => i !== index))}
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </fieldset>

            <fieldset>
                <legend>Equipment ({links.length})</legend>
                <p className="admin-hint">
                    The instruments sampled in it, effects used on the samples, and hardware it controls. Each shows on the other&apos;s page.
                </p>
                {links.map((link, index) => (
                    <div className="admin-row admin-clip" key={index}>
                        <label>
                            Item
                            <select
                                name="equipmentId"
                                value={link.equipmentId}
                                onChange={(event) =>
                                    setLinks((rows) => rows.map((row, i) => (i === index ? { ...row, equipmentId: event.target.value } : row)))
                                }
                            >
                                <option value="">Choose...</option>
                                {equipment.map((choice) => (
                                    <option key={choice.id} value={choice.id}>
                                        {choice.label} ({choice.type})
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label>
                            Relation
                            <select
                                name="equipmentRelation"
                                value={link.relation}
                                onChange={(event) =>
                                    setLinks((rows) =>
                                        rows.map((row, i) =>
                                            i === index ? { ...row, relation: event.target.value as ProductEquipmentRelation } : row
                                        )
                                    )
                                }
                            >
                                {Object.entries(RELATION_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <button
                            type="button"
                            className="admin-button admin-button-danger"
                            onClick={() => setLinks((rows) => rows.filter((_, i) => i !== index))}
                        >
                            Remove
                        </button>
                    </div>
                ))}
                <div>
                    <button
                        type="button"
                        className="admin-button"
                        onClick={() => setLinks((rows) => [...rows, { equipmentId: "", relation: "sampled" }])}
                    >
                        Add equipment
                    </button>
                </div>
            </fieldset>

            <div className="admin-actions">
                <button type="submit" className="admin-button" disabled={pending}>
                    {pending ? "Saving..." : isNew ? "Create product" : "Save"}
                </button>
            </div>
        </form>
    );
}
