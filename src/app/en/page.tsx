import { HomePage, getHomePageMetadata } from 'components/pages/home';

export const metadata = getHomePageMetadata('en');

export default function Page() {
    return <HomePage lang="en" />;
}
