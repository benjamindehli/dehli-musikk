// Helpers
import { markdownResponse, getEquipmentItemIds, getEquipmentItemMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getEquipmentItemIds();
}

export async function GET(request, { params }) {
    const { equipmentType, equipmentId } = await params;
    return markdownResponse(getEquipmentItemMarkdown("en", equipmentType, equipmentId));
}
