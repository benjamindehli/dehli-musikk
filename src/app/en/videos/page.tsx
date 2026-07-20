import { VideosPage, getVideosPageMetadata } from 'components/pages/videos';

export const metadata = getVideosPageMetadata('en');

export default function Page() {
    return <VideosPage lang="en" />;
}
