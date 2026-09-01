// Helpers
import { markdownResponse, getEquipmentMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getEquipmentMarkdown("en"));
}
