// Helpers
import { getSearchableReleases, searchDataResponse } from "helpers/searchDataHelpers";

// Data
import releases from "data/portfolio";

export const dynamic = "force-static";

export async function GET() {
    return searchDataResponse(getSearchableReleases(releases));
}
