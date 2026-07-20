import { ReleaseDetailsPage, getReleaseDetailsMetadata, getReleaseStaticParams } from 'components/pages/portfolio';

type Props = { params: Promise<{ releaseId: string }> };

export function generateStaticParams() {
    return getReleaseStaticParams();
}

export function generateMetadata(props: Props) {
    return getReleaseDetailsMetadata('en', props);
}

export default function Page({ params }: Props) {
    return <ReleaseDetailsPage lang="en" params={params} />;
}
