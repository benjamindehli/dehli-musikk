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
import videos from 'data/videos';

const lang = 'en';
const languageSlug = 'en/';

export function generateStaticParams() {
    return videos.map((video) => ({
        videoId: convertToUrlFriendlyString(video.title[lang])
    }));
}

function getVideo(videoId: string) {
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

export async function generateMetadata({ params }: { params: Promise<{ videoId: string }> }): Promise<Metadata> {
    const { videoId } = await params;
    const video = getVideo(videoId);
    if (!video) return {};

    const title = `${video.title[lang]} - Videos | Dehli Musikk`;
    const description = formatContentAsString(video.content[lang]);

    return {
        title, description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/en/videos/${videoId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/`,
                en: `https://www.dehlimusikk.no/en/videos/${convertToUrlFriendlyString(video.title.en)}/`,
                'x-default': `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/`
            }
        },
        openGraph: {
            title: video.title[lang], url: `https://www.dehlimusikk.no/en/videos/${videoId}/`,
            description, locale: 'en_US', alternateLocale: 'nb_NO',
            images: [{ url: `https://www.dehlimusikk.no/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`, width: 540, height: 304 }]
        },
        twitter: { title: video.title[lang], description, images: [`https://www.dehlimusikk.no/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`] }
    };
}

export default async function VideoDetailPage({ params }: { params: Promise<{ videoId: string }> }) {
    const { videoId } = await params;
    const video = getVideo(videoId);

    if (!video) notFound();

    const breadcrumbs = [
        { name: 'Videos', path: '/en/videos/' },
        { name: video.title[lang], path: `/en/videos/${videoId}/` }
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
                <h2 data-size="h1">Videos</h2>
                <p>Videos Dehli Musikk has created or contributed in</p>
            </Container>
            <Container blur>
                <List>
                    {videos.map((v) => {
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
