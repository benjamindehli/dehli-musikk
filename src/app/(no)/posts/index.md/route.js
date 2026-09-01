// Helpers
import { markdownResponse, getPostsMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getPostsMarkdown("no"));
}
