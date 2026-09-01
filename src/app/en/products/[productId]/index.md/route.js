// Helpers
import { markdownResponse, getProductMarkdown, getProductIds } from "helpers/markdownHelpers";

export const dynamic = "force-static";

export function generateStaticParams() {
    return getProductIds().map((productId) => ({ productId }));
}

export async function GET(request, { params }) {
    const { productId } = await params;
    return markdownResponse(getProductMarkdown("en", productId));
}
