import { ProductDetailsPage, getProductDetailsMetadata, getProductStaticParams } from 'components/pages/products';

type Props = { params: Promise<{ productId: string }> };

export function generateStaticParams() {
    return getProductStaticParams();
}

export function generateMetadata(props: Props) {
    return getProductDetailsMetadata('no', props);
}

export default function Page({ params }: Props) {
    return <ProductDetailsPage lang="no" params={params} />;
}
