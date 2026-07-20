import { FaqPage, getFaqPageMetadata } from 'components/pages/faq';

export const metadata = getFaqPageMetadata('no');

export default function Page() {
    return <FaqPage lang="no" />;
}
