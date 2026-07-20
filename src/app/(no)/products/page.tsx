import { ProductsPage, getProductsPageMetadata } from 'components/pages/products';

export const metadata = getProductsPageMetadata('no');

export default function Page() {
    return <ProductsPage lang="no" />;
}
