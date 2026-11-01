import Link from "next/link";
import type { Product } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
    const products = await readDataFile<Product[]>("products");

    return (
        <>
            <div className="admin-heading">
                <h1>Products ({products.length})</h1>
                <Link className="admin-button" href="/products/new/">
                    New product
                </Link>
            </div>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Product</th>
                        <th scope="col">Price</th>
                        <th scope="col">Gallery</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.title}>
                            <td>{toOsloDate(product.timestamp)}</td>
                            <td>
                                <Link href={`/products/${convertToUrlFriendlyString(product.title)}/`}>{product.title}</Link>
                                <br />
                                <span className="admin-muted">{product.productType.join(", ")}</span>
                            </td>
                            <td>{Number(product.price) ? `${product.price} ${product.priceCurrency}` : "Free"}</td>
                            <td>{product.additionalImages?.length || ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
