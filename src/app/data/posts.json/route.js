// Helpers
import { getSearchablePosts, searchDataResponse } from "helpers/searchDataHelpers";

// Data
import posts from "data/posts";

export const dynamic = "force-static";

export async function GET() {
    return searchDataResponse(getSearchablePosts(posts));
}
