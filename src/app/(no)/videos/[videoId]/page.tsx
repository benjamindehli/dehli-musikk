import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Video from 'components/partials/Video';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';
import videos from 'data/videos';

const lang = 'no';
const languageSlug = '';

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

export async function generateMetadata({ params }: { params: { videoId: string } }): Promise<Metadata> {
    const { videoId } = params;
    const video = getVideo(videoId);
    if (!video) return {};

    const title = `${video.title[lang]} - Videoer | Dehli Musikk`;
    const description = formatContentAsString(video.content[lang]);

    return {
        title, description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/videos/${videoId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/`,
                en: `https://www.dehlimusikk.no/en/videos/${convertToUrlFriendlyString(video.title.en)}/`,
                'x-default': `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/`
            }
        },
        openGraph: {
            title: video.title[lang], url: `https://www.dehlimusikk.no/videos/${videoId}/`,
            description, locale: 'no_NO', alternateLocale: 'en_US'
        },
        twitter: { title: video.title[lang], description }
    };
}

export default function VideoDetailPage({ params }: { params: { videoId: string } }) {
    const { videoId } = params;
    const video = getVideo(videoId);

    if (!video) notFound();

    const breadcrumbs = [
        { name: 'Videoer', path: '/videos/' },
        { name: video.title[lang], path: `/videos/${videoId}/` }
    ];

    return (
        <>
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Container>
                <ListItem>
                    <Video video={video} lang={lang} languageSlug={languageSlug} />
                </ListItem>
            </Container>
            <Container>
                <h2 data-size="h1">Videoer</h2>
                <p>Videoer Dehli Musikk har laget eller bidratt på</p>
            </Container>
            <Container>
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
