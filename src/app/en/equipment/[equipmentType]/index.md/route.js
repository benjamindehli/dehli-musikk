// Helpers
import { markdownResponse, getEquipmentTypeMarkdown, getEquipmentTypes } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getEquipmentTypes().map((equipmentType) => ({ equipmentType }));
}

export async function GET(request, { params }) {
    const { equipmentType } = await params;
    return markdownResponse(getEquipmentTypeMarkdown("en", equipmentType));
}
