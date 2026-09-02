// Helpers
import { getSearchableEquipment, searchDataResponse } from "helpers/searchDataHelpers";

// Data
import equipmentTypes from "data/equipment";

export const dynamic = "force-static";

export async function GET() {
    return searchDataResponse(getSearchableEquipment(equipmentTypes));
}
