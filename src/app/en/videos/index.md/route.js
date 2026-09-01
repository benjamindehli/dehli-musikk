// Helpers
import { markdownResponse, getVideosMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getVideosMarkdown("en"));
}
