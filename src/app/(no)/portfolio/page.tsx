import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Release from 'components/partials/Portfolio/Release';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { getJsonLdIdForRelease } from 'helpers/releaseHelpers';
import releases from 'data/portfolio';

const lang = 'no';
const languageSlug = '';

export const metadata: Metadata = {
    title: 'Portefølje | Dehli Musikk',
    description: 'Utgivelser Dehli Musikk har bidratt på',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/portfolio/',
        languages: {
            no: 'https://www.dehlimusikk.no/portfolio/',
            en: 'https://www.dehlimusikk.no/en/portfolio/',
            'x-default': 'https://www.dehlimusikk.no/portfolio/'
        }
    },
    openGraph: {
        title: 'Portefølje', url: 'https://www.dehlimusikk.no/portfolio/',
        description: 'Utgivelser Dehli Musikk har bidratt på', locale: 'no_NO', alternateLocale: 'en_US'
    },
    twitter: { title: 'Portefølje', description: 'Utgivelser Dehli Musikk har bidratt på' }
};

export default function PortfolioPage() {
    const releaseItems = releases.map((release, index) => {
        const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
        return {
            '@type': 'MusicRecording',
            '@id': getJsonLdIdForRelease(release),
            name: release.title,
            position: index + 1,
            url: `https://www.dehlimusikk.no/portfolio/${releaseId}/`
        };
    });
    const jsonLd = {
        '@context': 'http://schema.org',
        '@type': 'ItemList',
        '@id': 'https://www.dehlimusikk.no/portfolio/',
        name: 'Porteføljen til Dehli Musikk',
        itemListElement: releaseItems
    };

    const breadcrumbs = [{ name: 'Portefølje', path: '/portfolio/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Portefølje</h1>
                <p>Utgivelser Dehli Musikk har bidratt på</p>
            </Container>
            <Container>
                <List>
                    {releases.map((release) => {
                        const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
                        return (
                            <ListItem key={releaseId}>
                                <Release release={release} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}
