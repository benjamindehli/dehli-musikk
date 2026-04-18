import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Release from 'components/partials/Portfolio/Release';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { getJsonLdIdForRelease } from 'helpers/releaseHelpers';
import releases from 'data/portfolio';

const lang = 'en';
const languageSlug = 'en/';

export const metadata: Metadata = {
    title: 'Portfolio | Dehli Musikk',
    description: 'Recordings where Dehli Musikk has contributed',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/en/portfolio/',
        languages: {
            no: 'https://www.dehlimusikk.no/portfolio/',
            en: 'https://www.dehlimusikk.no/en/portfolio/',
            'x-default': 'https://www.dehlimusikk.no/portfolio/'
        }
    },
    openGraph: {
        title: 'Portfolio', url: 'https://www.dehlimusikk.no/en/portfolio/',
        description: 'Recordings where Dehli Musikk has contributed', locale: 'en_US', alternateLocale: 'nb_NO'
    },
    twitter: { title: 'Portfolio', description: 'Recordings where Dehli Musikk has contributed' }
};

export default function PortfolioPage() {
    const releaseItems = releases.map((release, index) => {
        const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
        return {
            '@type': 'MusicRecording',
            '@id': getJsonLdIdForRelease(release),
            name: release.title,
            position: index + 1,
            url: `https://www.dehlimusikk.no/en/portfolio/${releaseId}/`
        };
    });
    const jsonLd = {
        '@context': 'http://schema.org',
        '@type': 'ItemList',
        '@id': 'https://www.dehlimusikk.no/portfolio/',
        name: 'Portfolio for Dehli Musikk',
        itemListElement: releaseItems
    };

    const breadcrumbs = [{ name: 'Portfolio', path: '/en/portfolio/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Portfolio</h1>
                <p>Recordings where Dehli Musikk has contributed</p>
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
