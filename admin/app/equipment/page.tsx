import Link from "next/link";
import type { EquipmentTypeKey } from "data/equipment";
import type { ProductEquipmentLink, ReleaseInstrumentLink } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile } from "@admin/lib/dataFiles";
import { EQUIPMENT_TYPES, type EquipmentItem } from "./types";

export const dynamic = "force-dynamic";

export default async function EquipmentPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
    const { deleted } = await searchParams;
    const types = Object.keys(EQUIPMENT_TYPES) as EquipmentTypeKey[];
    const [lists, releaseLinks, productLinks] = await Promise.all([
        Promise.all(types.map((type) => readDataFile<EquipmentItem[]>(type))),
        readDataFile<ReleaseInstrumentLink[]>("releasesInstruments"),
        readDataFile<ProductEquipmentLink[]>("productsEquipment")
    ]);

    return (
        <>
            <h1>Equipment</h1>
            {deleted ? <p className="admin-status admin-status-saved">Deleted {deleted}.</p> : null}
            {types.map((type, i) => (
                <section key={type}>
                    <div className="admin-heading">
                        <h2>
                            {EQUIPMENT_TYPES[type].plural} ({lists[i].length})
                        </h2>
                        <Link className="admin-button" href={`/equipment/${type}/new/`}>
                            New {EQUIPMENT_TYPES[type].singular.toLowerCase()}
                        </Link>
                    </div>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th scope="col">Item</th>
                                <th scope="col">Releases</th>
                                <th scope="col">Products</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lists[i].map((item) => {
                                const slug = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
                                const releases =
                                    type === "instruments" ? releaseLinks.filter((link) => !link.isProduct && link.equipmentId === slug).length : 0;
                                const products = productLinks.filter((link) => link.equipmentId === slug).length;
                                return (
                                    <tr key={slug}>
                                        <td>
                                            <Link href={`/equipment/${type}/${slug}/`}>
                                                {item.brand} {item.model}
                                            </Link>
                                        </td>
                                        <td>{releases || ""}</td>
                                        <td>{products || ""}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>
            ))}
        </>
    );
}
