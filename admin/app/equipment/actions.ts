"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EquipmentTypeKey } from "data/equipment";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, writeDataFile } from "@admin/lib/dataFiles";
import { Problems, text, type FormState } from "@admin/lib/forms";
import { isEquipmentType, type EquipmentItem } from "./types";
import { equipmentUsage } from "./usage";

const slugOf = (item: EquipmentItem) => convertToUrlFriendlyString(`${item.brand} ${item.model}`);

// The lists are kept in alphabetical order of brand and model, as they are today.
const compare = (a: EquipmentItem, b: EquipmentItem) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`, "en");

export async function saveEquipment(type: EquipmentTypeKey, originalSlug: string | null, _previous: FormState, form: FormData): Promise<FormState> {
    if (!isEquipmentType(type)) return { status: "error", errors: ["Unknown equipment type."] };
    const items = await readDataFile<EquipmentItem[]>(type);
    const index = originalSlug === null ? -1 : items.findIndex((item) => slugOf(item) === originalSlug);
    if (originalSlug !== null && index === -1) return { status: "error", errors: [`${originalSlug} no longer exists.`] };

    const problems = new Problems();
    const item = { brand: problems.require(text(form, "brand"), "Brand"), model: problems.require(text(form, "model"), "Model") };
    const slug = slugOf(item);
    if (originalSlug !== null && slug !== originalSlug) {
        problems.add(
            `That would move the page from equipment/${type}/${originalSlug}/ to equipment/${type}/${slug}/. Its images, its release and product links and the posts and videos that link to it all use the old one, so a rename has to be done by hand.`
        );
    }
    if (originalSlug === null && items.some((other) => slugOf(other) === slug))
        problems.add(`There is already an item at equipment/${type}/${slug}/.`);
    if (problems.any) return problems.state();

    if (index === -1) {
        const position = items.findIndex((other) => compare(item, other) < 0);
        items.splice(position === -1 ? items.length : position, 0, item);
    } else {
        items[index] = item;
    }
    await writeDataFile(type, items);
    revalidatePath("/equipment", "layout");
    if (originalSlug === null) redirect(`/equipment/${type}/${slug}/?created=1`);
    return { status: "saved", message: `Saved to src/data/equipment/data/${type}.json.` };
}

export async function deleteEquipment(type: EquipmentTypeKey, slug: string): Promise<FormState> {
    if (!isEquipmentType(type)) return { status: "error", errors: ["Unknown equipment type."] };
    const usage = await equipmentUsage(type, slug);
    const uses = usage.releases.length + usage.products.length + usage.mentions.length;
    if (uses)
        return {
            status: "error",
            errors: [`It is still used in ${uses} place(s), listed below. Remove those first, so nothing links to a page that is gone.`]
        };

    const items = await readDataFile<EquipmentItem[]>(type);
    const remaining = items.filter((item) => slugOf(item) !== slug);
    if (remaining.length !== items.length) await writeDataFile(type, remaining);
    revalidatePath("/equipment", "layout");
    redirect(`/equipment/?deleted=${encodeURIComponent(slug)}`);
}
