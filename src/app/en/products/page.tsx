import { ProductsPage, getProductsPageMetadata } from 'components/pages/products';

export const metadata = getProductsPageMetadata('en');

export default function Page() {
    return <ProductsPage lang="en" />;
}
