import { VideoDetailsPage, getVideoDetailsMetadata, getVideoStaticParams } from 'components/pages/videos';

type Props = { params: Promise<{ videoId: string }> };

export function generateStaticParams() {
    return getVideoStaticParams('no');
}

export function generateMetadata(props: Props) {
    return getVideoDetailsMetadata('no', props);
}

export default function Page({ params }: Props) {
    return <VideoDetailsPage lang="no" params={params} />;
}
