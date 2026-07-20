import { VideoDetailsPage, getVideoDetailsMetadata, getVideoStaticParams } from 'components/pages/videos';

type Props = { params: Promise<{ videoId: string }> };

export function generateStaticParams() {
    return getVideoStaticParams('en');
}

export function generateMetadata(props: Props) {
    return getVideoDetailsMetadata('en', props);
}

export default function Page({ params }: Props) {
    return <VideoDetailsPage lang="en" params={params} />;
}
