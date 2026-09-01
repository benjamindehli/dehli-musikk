// Helpers
import { markdownResponse, getHomeMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getHomeMarkdown("en"));
}
