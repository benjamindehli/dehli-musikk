import { ProductDetailsPage, getProductDetailsMetadata, getProductStaticParams } from 'components/pages/products';

type Props = { params: Promise<{ productId: string }> };

export function generateStaticParams() {
    return getProductStaticParams();
}

export function generateMetadata(props: Props) {
    return getProductDetailsMetadata('en', props);
}

export default function Page({ params }: Props) {
    return <ProductDetailsPage lang="en" params={params} />;
}
