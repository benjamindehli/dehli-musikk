import JsonLd from "components/JsonLd";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";
import List from "components/template/List";
import ListItem from "components/template/List/ListItem";
import Modal from "components/template/Modal";
import Release from "components/partials/Portfolio/Release";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { getJsonLdIdForRelease } from "helpers/releaseHelpers";
import { BACKDROP_LIST_ITEM_LIMIT } from "lib/constants";
import { getLanguageSlug } from "lib/i18n";
import { buildAlternates, socialMetadata, WEBSITE_URL, detailTitle, metaDescription, type Lang } from "lib/pageMetadata";
import releases from "data/portfolio";

const translations = {
    no: {
        metaTitle: "Portefølje | Dehli Musikk",
        pageTitle: "Portefølje",
        description: "Utgivelser Dehli Musikk har bidratt på",
        listMetaDescription: (releaseCount: number, artistCount: number) =>
            `De ${releaseCount} utgivelsene Dehli Musikk har spilt tangentinstrumenter på, for ${artistCount} artister og band, med lenker for å høre hver av dem.`,
        listName: "Porteføljen til Dehli Musikk",
        byConnector: "av",
        listenTo: (title: string, artistName: string) => `Lytt til låta ${title} av ${artistName}`,
        releaseMetaDescription: (title: string, artistName: string, genre: string, year: number) =>
            `Hør ${title} av ${artistName}, en ${genre}-utgivelse fra ${year} med tangentinstrumenter spilt av Benjamin Dehli i Dehli Musikk.`
    },
    en: {
        metaTitle: "Portfolio | Dehli Musikk",
        pageTitle: "Portfolio",
        description: "Recordings where Dehli Musikk has contributed",
        listMetaDescription: (releaseCount: number, artistCount: number) =>
            `The ${releaseCount} recordings Dehli Musikk has played keyboard instruments on, for ${artistCount} artists and bands, with links to hear each one.`,
        listName: "Portfolio for Dehli Musikk",
        byConnector: "by",
        listenTo: (title: string, artistName: string) => `Listen to the track ${title} by ${artistName}`,
        releaseMetaDescription: (title: string, artistName: string, genre: string, year: number) =>
            `Listen to ${title} by ${artistName}, a ${genre} release from ${year} with keyboard instruments played by Benjamin Dehli of Dehli Musikk.`
    }
} as const;

type ReleaseRouteProps = { params: Promise<{ releaseId: string }> };

export function getPortfolioPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    // Longer than the paragraph the page opens with: that one sits under a
    // heading that has already said "Portfolio", a search snippet stands alone
    const description = t.listMetaDescription(releases.length, new Set(releases.map((release) => release.artistName)).size);
    return {
        title: t.metaTitle,
        description,
        alternates: buildAlternates(lang, { no: "portfolio/", en: "portfolio/" }),
        ...socialMetadata(lang, {
            title: t.pageTitle,
            url: `${WEBSITE_URL}/${languageSlug}portfolio/`,
            description
        })
    };
}

export function PortfolioPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const releaseItems = releases.map((release, index) => {
        const releaseId = convertToUrlFriendlyString(`${release.artistName} ${release.title}`);
        return {
            "@type": "MusicRecording",
            "@id": getJsonLdIdForRelease(release),
            name: release.title,
            position: index + 1,
            url: `${WEBSITE_URL}/${languageSlug}portfolio/${releaseId}/`
        };
    });
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${WEBSITE_URL}/portfolio/`,
        name: t.listName,
        numberOfItems: releaseItems.length,
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
    const index = releases.findIndex((r) => convertToUrlFriendlyString(`${r.artistName} ${r.title}`) === releaseId);
    if (index === -1) return null;
    const release = releases[index];
    return {
        ...release,
        previousReleaseId: index > 0 ? convertToUrlFriendlyString(`${releases[index - 1].artistName} ${releases[index - 1].title}`) : null,
        nextReleaseId:
            index < releases.length - 1 ? convertToUrlFriendlyString(`${releases[index + 1].artistName} ${releases[index + 1].title}`) : null
    };
}

export async function getReleaseDetailsMetadata(lang: Lang, { params }: ReleaseRouteProps): Promise<Metadata> {
    const { releaseId } = await params;
    const release = getRelease(releaseId);
    if (!release) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const heading = `${release.title} ${t.byConnector} ${release.artistName}`;
    const title = detailTitle(heading);
    /*
     * "Listen to the track X by Y" alone came to 45 to 49 characters, under the
     * floor a description needs to tell a search engine anything, and 87 release
     * pages carried one. Genre and year are on every release, and they are also
     * what makes one of these pages different from the next.
     */
    const description = metaDescription(
        t.releaseMetaDescription(release.title, release.artistName, release.genre, new Date(release.releaseDate).getFullYear())
    );

    return {
        title,
        description,
        alternates: buildAlternates(lang, {
            no: `portfolio/${releaseId}/`,
            en: `portfolio/${releaseId}/`
        }),
        ...socialMetadata(lang, {
            type: "music.song",
            title: heading,
            url: `${WEBSITE_URL}/${languageSlug}portfolio/${releaseId}/`,
            description,
            // release.duration is in milliseconds, og:music:duration in seconds
            duration: release.duration ? Math.round(release.duration / 1000) : undefined,
            images: [{ url: `${WEBSITE_URL}/data/releases/web/jpg/${release.thumbnailFilename}_540.jpg`, width: 540, height: 540 }]
        })
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
