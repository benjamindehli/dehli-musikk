import { VideosPage, getVideosPageMetadata } from 'components/pages/videos';

export const metadata = getVideosPageMetadata('no');

export default function Page() {
    return <VideosPage lang="no" />;
}
