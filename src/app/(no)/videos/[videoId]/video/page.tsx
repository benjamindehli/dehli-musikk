import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import Modal from 'components/template/Modal';
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
            canonical: `https://www.dehlimusikk.no/videos/${videoId}/video/`,
            languages: {
                no: `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/video/`,
                en: `https://www.dehlimusikk.no/en/videos/${convertToUrlFriendlyString(video.title.en)}/video/`,
                'x-default': `https://www.dehlimusikk.no/videos/${convertToUrlFriendlyString(video.title.no)}/video/`
            }
        },
        openGraph: {
            title: video.title[lang], url: `https://www.dehlimusikk.no/videos/${videoId}/video/`,
            description, locale: 'no_NO', alternateLocale: 'en_US'
        },
        twitter: { title: video.title[lang], description }
    };
}

export default function VideoTheaterPage({ params }: { params: { videoId: string } }) {
    const { videoId } = params;
    const video = getVideo(videoId);

    if (!video) notFound();

    const breadcrumbs = [
        { name: 'Videoer', path: '/videos/' },
        { name: video.title[lang], path: `/videos/${videoId}/` },
        { name: 'Kinomodus', path: `/videos/${videoId}/video/` }
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
                <h2 data-size="h1">Videoer</h2>
                <p>Videoer Dehli Musikk har laget eller bidratt på</p>
            </Container>
        </>
    );
}
