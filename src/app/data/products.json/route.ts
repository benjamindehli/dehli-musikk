// Helpers
import { getSearchableProducts, searchDataResponse } from "helpers/searchDataHelpers";

// Data
import products from "data/products";

export const dynamic = "force-static";

export async function GET() {
    return searchDataResponse(getSearchableProducts(products));
}
