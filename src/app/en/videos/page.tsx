import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Video from 'components/partials/Video';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';
import videos from 'data/videos';

const lang = 'en';
const languageSlug = 'en/';

export const metadata: Metadata = {
    title: 'Videos | Dehli Musikk',
    description: 'Videos Dehli Musikk has created or contributed in',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/en/videos/',
        languages: {
            no: 'https://www.dehlimusikk.no/videos/',
            en: 'https://www.dehlimusikk.no/en/videos/',
            'x-default': 'https://www.dehlimusikk.no/videos/'
        }
    },
    openGraph: {
        title: 'Videos', url: 'https://www.dehlimusikk.no/en/videos/',
        description: 'Videos Dehli Musikk has created or contributed in', locale: 'en_US', alternateLocale: 'nb_NO'
    },
    twitter: { title: 'Videos', description: 'Videos Dehli Musikk has created or contributed in' }
};

export default function VideosPage() {
    const videoItems = videos.map((video, index) => {
        const videoId = convertToUrlFriendlyString(video.title[lang]);
        const videoDate = new Date(video.timestamp).toISOString();
        return {
            '@type': 'VideoObject',
            '@id': `https://www.dehlimusikk.no/videos/${videoId}/video/`,
            position: index + 1,
            url: `https://www.dehlimusikk.no/en/videos/${videoId}/video/`,
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
        name: 'Videos by Dehli Musikk',
        itemListElement: videoItems
    };

    const breadcrumbs = [{ name: 'Videos', path: '/en/videos/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Videos</h1>
                <p>Videos Dehli Musikk has created or contributed in</p>
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
