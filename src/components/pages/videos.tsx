import JsonLd from 'components/JsonLd';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Video from 'components/partials/Video';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';
import { BACKDROP_LIST_ITEM_LIMIT } from 'lib/constants';
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, socialMetadata, WEBSITE_URL, metaDescription, type Lang } from 'lib/pageMetadata';
import videos from 'data/videos';

const translations = {
    no: {
        metaTitle: 'Videoer | Dehli Musikk',
        pageTitle: 'Videoer',
        description: 'Videoer Dehli Musikk har laget eller bidratt på',
        listName: 'Videoer av Dehli Musikk',
        theaterMode: 'Kinomodus'
    },
    en: {
        metaTitle: 'Videos | Dehli Musikk',
        pageTitle: 'Videos',
        description: 'Videos Dehli Musikk has created or contributed in',
        listName: 'Videos by Dehli Musikk',
        theaterMode: 'Theater mode'
    }
} as const;

type VideoRouteProps = { params: Promise<{ videoId: string }> };

export function getVideosPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: 'videos/', en: 'videos/' }),
        ...socialMetadata(lang, {
            title: t.pageTitle,
            url: `${WEBSITE_URL}/${languageSlug}videos/`,
            description: t.description
        })
    };
}

export function VideosPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const videoItems = videos.map((video, index) => {
        const videoId = convertToUrlFriendlyString(video.title[lang]);
        const videoDate = new Date(video.timestamp).toISOString();
        return {
            '@type': 'VideoObject',
            '@id': `${WEBSITE_URL}/videos/${convertToUrlFriendlyString(video.title.no)}/video/`,
            position: index + 1,
            url: `${WEBSITE_URL}/${languageSlug}videos/${videoId}/video/`,
            name: video.title[lang],
            description: video.content[lang] ? formatContentAsString(video.content[lang]) : '',
            thumbnailUrl: `${WEBSITE_URL}/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`,
            embedUrl: `https://www.youtube.com/embed/${video.youTubeId}`,
            uploadDate: videoDate
        };
    });
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${WEBSITE_URL}/videos/`,
        name: t.listName,
        numberOfItems: videoItems.length,
        itemListElement: videoItems
    };

    const breadcrumbs = [{ name: t.pageTitle, path: `/${languageSlug}videos/` }];

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
                    {videos.map((video, index) => {
                        const videoId = convertToUrlFriendlyString(video.title[lang]);
                        return (
                            <ListItem key={videoId}>
                                <Video video={video} priority={index === 0} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}

export function getVideoStaticParams(lang: Lang) {
    return videos.map((video) => ({
        videoId: convertToUrlFriendlyString(video.title[lang])
    }));
}

function getVideo(lang: Lang, videoId: string) {
    const index = videos.findIndex(
        (v) => convertToUrlFriendlyString(v.title[lang]) === videoId
    );
    if (index === -1) return null;
    return {
        ...videos[index],
        previousVideoId: index > 0 ? convertToUrlFriendlyString(videos[index - 1].title[lang]) : null,
        nextVideoId: index < videos.length - 1 ? convertToUrlFriendlyString(videos[index + 1].title[lang]) : null
    };
}

// Each video has two URLs serving the same content: /videos/{slug}/ shows it in
// the page modal, /videos/{slug}/video/ full screen. Google declines to treat the
// modal page as a video page ("video is not the main content"), so the theater
// URL is the canonical one. Both pages point at it, which is also where the
// VideoObject markup and video-sitemap.xml already point.
function getCanonicalVideoPaths(video: { title: Record<Lang, string> }) {
    return {
        no: `videos/${convertToUrlFriendlyString(video.title.no)}/video/`,
        en: `videos/${convertToUrlFriendlyString(video.title.en)}/video/`
    };
}

async function getVideoMetadata(lang: Lang, { params }: VideoRouteProps): Promise<Metadata> {
    const { videoId } = await params;
    const video = getVideo(lang, videoId);
    if (!video) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const title = `${video.title[lang]} - ${t.metaTitle}`;
    // Truncated for the snippet vocabularies only; the VideoObject JSON-LD above
    // keeps the full text, which is what Google's video guidelines want.
    const description = metaDescription(formatContentAsString(video.content[lang]));
    const canonicalPaths = getCanonicalVideoPaths(video);

    return {
        title, description,
        alternates: buildAlternates(lang, canonicalPaths),
        ...socialMetadata(lang, {
            title: video.title[lang],
            url: `${WEBSITE_URL}/${languageSlug}${canonicalPaths[lang]}`,
            description,
            images: [{ url: `${WEBSITE_URL}/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`, width: 540, height: 304 }]
        })
    };
}

export function getVideoDetailsMetadata(lang: Lang, props: VideoRouteProps) {
    return getVideoMetadata(lang, props);
}

export function getVideoTheaterMetadata(lang: Lang, props: VideoRouteProps) {
    return getVideoMetadata(lang, props);
}

export async function VideoDetailsPage({ lang, params }: { lang: Lang } & VideoRouteProps) {
    const { videoId } = await params;
    const video = getVideo(lang, videoId);

    if (!video) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}videos/` },
        { name: video.title[lang], path: `/${languageSlug}videos/${videoId}/` }
    ];

    return (
        <>
            <Container blur>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Modal
                listPath={`/${languageSlug}videos/`}
                arrowLeftLink={video.previousVideoId ? `/${languageSlug}videos/${video.previousVideoId}/` : null}
                arrowRightLink={video.nextVideoId ? `/${languageSlug}videos/${video.nextVideoId}/` : null}
                maxWidth="945px"
                lang={lang}
            >
                <Video video={video} fullscreen={true} lang={lang} languageSlug={languageSlug} />
            </Modal>
            <Container blur>
                <h2 data-size="h1">{t.pageTitle}</h2>
                <p>{t.description}</p>
            </Container>
            <Container blur>
                <List>
                    {videos.slice(0, BACKDROP_LIST_ITEM_LIMIT).map((v) => {
                        const vId = convertToUrlFriendlyString(v.title[lang]);
                        return (
                            <ListItem key={vId}>
                                <Video video={v} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}

export async function VideoTheaterPage({ lang, params }: { lang: Lang } & VideoRouteProps) {
    const { videoId } = await params;
    const video = getVideo(lang, videoId);

    if (!video) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}videos/` },
        { name: video.title[lang], path: `/${languageSlug}videos/${videoId}/` },
        { name: t.theaterMode, path: `/${languageSlug}videos/${videoId}/video/` }
    ];

    return (
        <>
            <Container blur>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Modal isTheaterMode listPath={`/${languageSlug}videos/`} lang={lang}>
                <Video video={video} fullscreen={true} isTheaterMode={true} lang={lang} languageSlug={languageSlug} />
            </Modal>
            <Container blur>
                <h2 data-size="h1">{t.pageTitle}</h2>
                <p>{t.description}</p>
            </Container>
        </>
    );
}
