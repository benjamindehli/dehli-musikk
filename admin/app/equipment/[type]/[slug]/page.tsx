import Link from "next/link";
import { notFound } from "next/navigation";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile } from "@admin/lib/dataFiles";
import { existingThumbnails } from "@admin/lib/thumbnails";
import { defaultImageMarks } from "@admin/lib/imageSpecs";
import ImagePanel from "@admin/components/ImagePanel";
import { EQUIPMENT_TYPES, isEquipmentType, type EquipmentItem } from "../../types";
import { equipmentUsage } from "../../usage";
import EquipmentForm from "./EquipmentForm";

export const dynamic = "force-dynamic";

export default async function EditEquipmentPage({
    params,
    searchParams
}: {
    params: Promise<{ type: string; slug: string }>;
    searchParams: Promise<{ created?: string }>;
}) {
    const { type, slug } = await params;
    const { created } = await searchParams;
    if (!isEquipmentType(type)) notFound();
    const isNew = slug === "new";
    const item = isNew
        ? undefined
        : (await readDataFile<EquipmentItem[]>(type)).find(
              (candidate) => convertToUrlFriendlyString(`${candidate.brand} ${candidate.model}`) === slug
          );
    if (!isNew && !item) notFound();
    const usage = item ? await equipmentUsage(type, slug) : null;
    const imageSet = item ? await existingThumbnails(type, slug) : { sizes: [], version: "" };

    return (
        <>
            <p>
                <Link href="/equipment/">All equipment</Link>
            </p>
            <h1>{item ? `${item.brand} ${item.model}` : `New ${EQUIPMENT_TYPES[type].singular.toLowerCase()}`}</h1>
            {created ? <p className="admin-status admin-status-saved">Created. Add its image below.</p> : null}
            <EquipmentForm key={slug} type={type} slug={isNew ? null : slug} brand={item?.brand ?? ""} model={item?.model ?? ""} />
            {item && usage ? (
                <>
                    <ImagePanel section={type} itemKey={slug} name={slug} existing={imageSet} marks={defaultImageMarks(type, imageSet)} />
                    <section className="admin-form">
                        <fieldset>
                            <legend>Where it is used</legend>
                            <p className="admin-hint">
                                Links are edited on the release or product; text mentions in the post, video or product text.
                            </p>
                            {type === "instruments" ? (
                                <>
                                    <h3>Releases ({usage.releases.length})</h3>
                                    <ul>
                                        {usage.releases.map((release) => (
                                            <li key={release.file}>
                                                <Link href={`/releases/${release.file}/`}>{release.label}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : null}
                            <h3>Products ({usage.products.length})</h3>
                            <ul>
                                {usage.products.map((product) => (
                                    <li key={`${product.slug}-${product.relation}`}>
                                        <Link href={`/products/${product.slug}/`}>{product.label}</Link> ({product.relation})
                                    </li>
                                ))}
                            </ul>
                            <h3>Linked from text ({usage.mentions.length})</h3>
                            <ul>
                                {usage.mentions.map((mention) => (
                                    <li key={mention.href}>
                                        <Link href={mention.href}>{mention.label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </fieldset>
                    </section>
                </>
            ) : null}
        </>
    );
}
