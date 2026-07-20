import { PortfolioPage, getPortfolioPageMetadata } from 'components/pages/portfolio';

export const metadata = getPortfolioPageMetadata('no');

export default function Page() {
    return <PortfolioPage lang="no" />;
}
