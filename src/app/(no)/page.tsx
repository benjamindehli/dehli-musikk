import { HomePage, getHomePageMetadata } from 'components/pages/home';

export const metadata = getHomePageMetadata('no');

export default function Page() {
    return <HomePage lang="no" />;
}
