import type { Metadata } from 'next';
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

export const metadata: Metadata = {
    title: 'Videoer | Dehli Musikk',
    description: 'Videoer Dehli Musikk har laget eller bidratt på',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/videos/',
        languages: {
            no: 'https://www.dehlimusikk.no/videos/',
            en: 'https://www.dehlimusikk.no/en/videos/',
            'x-default': 'https://www.dehlimusikk.no/videos/'
        }
    },
    openGraph: {
        title: 'Videoer', url: 'https://www.dehlimusikk.no/videos/',
        description: 'Videoer Dehli Musikk har laget eller bidratt på', locale: 'no_NO', alternateLocale: 'en_US'
    },
    twitter: { title: 'Videoer', description: 'Videoer Dehli Musikk har laget eller bidratt på' }
};

export default function VideosPage() {
    const videoItems = videos.map((video, index) => {
        const videoId = convertToUrlFriendlyString(video.title[lang]);
        const videoDate = new Date(video.timestamp).toISOString();
        return {
            '@type': 'VideoObject',
            '@id': `https://www.dehlimusikk.no/videos/${videoId}/video/`,
            position: index + 1,
            url: `https://www.dehlimusikk.no/videos/${videoId}/video/`,
            name: video.title[lang],
            description: video.content[lang] ? formatContentAsString(video.content[lang]) : '',
            thumbnailUrl: `https://www.dehlimusikk.no/data/videos/web/jpg/${video.thumbnailFilename}_540.jpg`,
            embedURL: `https://www.youtube.com/watch?v=${video.youTubeId}`,
            uploadDate: videoDate
        };
    });
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': 'https://www.dehlimusikk.no/videos/',
        name: 'Videoer av Dehli Musikk',
        itemListElement: videoItems
    };

    const breadcrumbs = [{ name: 'Videoer', path: '/videos/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Videoer</h1>
                <p>Videoer Dehli Musikk har har laget eller bidratt på</p>
            </Container>
            <Container>
                <List>
                    {videos.map((video) => {
                        const videoId = convertToUrlFriendlyString(video.title[lang]);
                        return (
                            <ListItem key={videoId}>
                                <Video video={video} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}
