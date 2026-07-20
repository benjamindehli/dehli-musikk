import { PostDetailsPage, getPostDetailsMetadata, getPostStaticParams } from 'components/pages/posts';

type Props = { params: Promise<{ postId: string }> };

export function generateStaticParams() {
    return getPostStaticParams('en');
}

export function generateMetadata(props: Props) {
    return getPostDetailsMetadata('en', props);
}

export default function Page({ params }: Props) {
    return <PostDetailsPage lang="en" params={params} />;
}
