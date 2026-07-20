import { VideoTheaterPage, getVideoTheaterMetadata, getVideoStaticParams } from 'components/pages/videos';

type Props = { params: Promise<{ videoId: string }> };

export function generateStaticParams() {
    return getVideoStaticParams('no');
}

export function generateMetadata(props: Props) {
    return getVideoTheaterMetadata('no', props);
}

export default function Page({ params }: Props) {
    return <VideoTheaterPage lang="no" params={params} />;
}
