import { VideoTheaterPage, getVideoTheaterMetadata, getVideoStaticParams } from 'components/pages/videos';

type Props = { params: Promise<{ videoId: string }> };

export function generateStaticParams() {
    return getVideoStaticParams('en');
}

export function generateMetadata(props: Props) {
    return getVideoTheaterMetadata('en', props);
}

export default function Page({ params }: Props) {
    return <VideoTheaterPage lang="en" params={params} />;
}
