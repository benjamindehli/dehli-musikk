import { PostDetailsPage, getPostDetailsMetadata, getPostStaticParams } from 'components/pages/posts';

type Props = { params: Promise<{ postId: string }> };

export function generateStaticParams() {
    return getPostStaticParams('no');
}

export function generateMetadata(props: Props) {
    return getPostDetailsMetadata('no', props);
}

export default function Page({ params }: Props) {
    return <PostDetailsPage lang="no" params={params} />;
}
