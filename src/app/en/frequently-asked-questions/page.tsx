import { FaqPage, getFaqPageMetadata } from 'components/pages/faq';

export const metadata = getFaqPageMetadata('en');

export default function Page() {
    return <FaqPage lang="en" />;
}
