import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Release from 'components/partials/Portfolio/Release';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import releases from 'data/portfolio';

const lang = 'en';
const languageSlug = 'en/';

export function generateStaticParams() {
    return releases.map((release) => ({
        releaseId: convertToUrlFriendlyString(`${release.artistName} ${release.title}`)
    }));
}

function getRelease(releaseId: string) {
    const index = releases.findIndex(
        (r) => convertToUrlFriendlyString(`${r.artistName} ${r.title}`) === releaseId
    );
    if (index === -1) return null;
    const release = releases[index];
    return {
        ...release,
        previousReleaseId: index > 0
            ? convertToUrlFriendlyString(`${releases[index - 1].artistName} ${releases[index - 1].title}`)
            : null,
        nextReleaseId: index < releases.length - 1
            ? convertToUrlFriendlyString(`${releases[index + 1].artistName} ${releases[index + 1].title}`)
            : null
    };
}

export async function generateMetadata({ params }: { params: Promise<{ releaseId: string }> }): Promise<Metadata> {
    const { releaseId } = await params;
    const release = getRelease(releaseId);
    if (!release) return {};

    const title = `${release.title} by ${release.artistName} - Portfolio | Dehli Musikk`;
    const heading = `${release.title} by ${release.artistName}`;
    const description = `Listen to the track ${release.title} by ${release.artistName}`;

    return {
        title, description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/en/portfolio/${releaseId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/portfolio/${releaseId}/`,
                en: `https://www.dehlimusikk.no/en/portfolio/${releaseId}/`,
                'x-default': `https://www.dehlimusikk.no/portfolio/${releaseId}/`
            }
        },
        openGraph: {
            title: heading, url: `https://www.dehlimusikk.no/en/portfolio/${releaseId}/`,
            description, locale: 'en_US', alternateLocale: 'nb_NO'
        },
        twitter: { title: heading, description }
    };
}

export default async function ReleaseDetailPage({ params }: { params: Promise<{ releaseId: string }> }) {
    const { releaseId } = await params;
    const release = getRelease(releaseId);

    if (!release) notFound();

    const detailHeading = `${release.title} by ${release.artistName}`;
    const breadcrumbs = [
        { name: 'Portfolio', path: '/en/portfolio/' },
        { name: detailHeading, path: `/en/portfolio/${releaseId}/` }
    ];

    return (
        <>
            <Container blur>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Modal
                listPath={`/${languageSlug}portfolio/`}
                arrowLeftLink={release.previousReleaseId ? `/${languageSlug}portfolio/${release.previousReleaseId}/` : null}
                arrowRightLink={release.nextReleaseId ? `/${languageSlug}portfolio/${release.nextReleaseId}/` : null}
                maxWidth="540px"
                lang={lang}
            >
                <Release release={release} fullscreen={true} lang={lang} languageSlug={languageSlug} />
            </Modal>
            <Container blur>
                <h2 data-size="h1">Portfolio</h2>
                <p>Recordings where Dehli Musikk has contributed</p>
            </Container>
            <Container blur>
                <List>
                    {releases.map((r) => {
                        const rId = convertToUrlFriendlyString(`${r.artistName} ${r.title}`);
                        return (
                            <ListItem key={rId}>
                                <Release release={r} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}
