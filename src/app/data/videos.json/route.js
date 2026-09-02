// Helpers
import { getSearchableVideos, searchDataResponse } from "helpers/searchDataHelpers";

// Data
import videos from "data/videos";

export const dynamic = "force-static";

export async function GET() {
    return searchDataResponse(getSearchableVideos(videos));
}
