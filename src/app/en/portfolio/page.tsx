import { PortfolioPage, getPortfolioPageMetadata } from 'components/pages/portfolio';

export const metadata = getPortfolioPageMetadata('en');

export default function Page() {
    return <PortfolioPage lang="en" />;
}
