// Helpers
import { markdownResponse, getProductsMarkdown } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export async function GET() {
    return markdownResponse(getProductsMarkdown("en"));
}
