import JsonLd from 'components/JsonLd';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Release from 'components/partials/Portfolio/Release';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { getJsonLdIdForRelease } from 'helpers/releaseHelpers';
import { BACKDROP_LIST_ITEM_LIMIT } from 'lib/constants';
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, ogLocale, WEBSITE_URL, type Lang } from 'lib/pageMetadata';
import releases from 'data/portfolio';

const translations = {
    no: {
        metaTitle: 'Portefølje | Dehli Musikk',
        pageTitle: 'Portefølje',
        description: 'Utgivelser Dehli Musikk har bidratt på',
        listName: 'Porteføljen til Dehli Musikk',
        byConnector: 'av',
        listenTo: (title: string, artistName: string) => `Lytt til låta ${title} av ${artistName}`
    },
    en: {
        metaTitle: 'Portfolio | Dehli Musikk',
        pageTitle: 'Portfolio',
        description: 'Recordings where Dehli Musikk has contributed',
        listName: 'Portfolio for Dehli Musikk',
        byConnector: 'by',
        listenTo: (title: string, artistName: string) => `Listen to the track ${title} by ${artistName}`
    }
} as const;

type ReleaseRouteProps = { params: Promise<{ releaseId: string }> };

export function getPortfolioPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: 'portfolio/', en: 'portfolio/' }),
        openGraph: {
            title: t.pageTitle, url: `${WEBSITE_URL}/${languageSlug}portfolio/`,
            description: t.description, ...ogLocale(lang)
        },
        twitter: { title: t.pageTitle, description: t.description }
    };
}

export function PortfolioPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const releaseItems = releases.map((release, index) => {
        const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
        return {
            '@type': 'MusicRecording',
            '@id': getJsonLdIdForRelease(release),
            name: release.title,
            position: index + 1,
            url: `${WEBSITE_URL}/${languageSlug}portfolio/${releaseId}/`
        };
    });
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${WEBSITE_URL}/portfolio/`,
        name: t.listName,
        itemListElement: releaseItems
    };

    const breadcrumbs = [{ name: t.pageTitle, path: `/${languageSlug}portfolio/` }];

    return (
        <>
            <JsonLd data={jsonLd} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{t.pageTitle}</h1>
                <p>{t.description}</p>
            </Container>
            <Container>
                <List>
                    {releases.map((release, index) => {
                        const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
                        return (
                            <ListItem key={releaseId}>
                                <Release release={release} priority={index === 0} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}

export function getReleaseStaticParams() {
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

export async function getReleaseDetailsMetadata(lang: Lang, { params }: ReleaseRouteProps): Promise<Metadata> {
    const { releaseId } = await params;
    const release = getRelease(releaseId);
    if (!release) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const heading = `${release.title} ${t.byConnector} ${release.artistName}`;
    const title = `${heading} - ${t.metaTitle}`;
    const description = t.listenTo(release.title, release.artistName);

    return {
        title, description,
        alternates: buildAlternates(lang, {
            no: `portfolio/${releaseId}/`,
            en: `portfolio/${releaseId}/`
        }),
        openGraph: {
            type: 'music.song',
            title: heading, url: `${WEBSITE_URL}/${languageSlug}portfolio/${releaseId}/`,
            description, ...ogLocale(lang),
            // og:music:duration is in whole seconds; release.duration is in milliseconds
            duration: release.duration ? Math.round(release.duration / 1000) : undefined,
            images: [{ url: `${WEBSITE_URL}/data/releases/web/jpg/${release.thumbnailFilename}_540.jpg`, width: 540, height: 540 }]
        },
        twitter: { title: heading, description, images: [`${WEBSITE_URL}/data/releases/web/jpg/${release.thumbnailFilename}_540.jpg`] }
    };
}

export async function ReleaseDetailsPage({ lang, params }: { lang: Lang } & ReleaseRouteProps) {
    const { releaseId } = await params;
    const release = getRelease(releaseId);

    if (!release) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const detailHeading = `${release.title} ${t.byConnector} ${release.artistName}`;
    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}portfolio/` },
        { name: detailHeading, path: `/${languageSlug}portfolio/${releaseId}/` }
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
                <h2 data-size="h1">{t.pageTitle}</h2>
                <p>{t.description}</p>
            </Container>
            <Container blur>
                <List>
                    {releases.slice(0, BACKDROP_LIST_ITEM_LIMIT).map((r) => {
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
