import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Post from 'components/partials/Post';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import posts from 'data/posts';

const lang = 'no';
const languageSlug = '';

export const metadata: Metadata = {
    title: 'Innlegg | Dehli Musikk',
    description: 'Siste oppdateringer fra Dehli Musikk',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/posts/',
        languages: {
            no: 'https://www.dehlimusikk.no/posts/',
            en: 'https://www.dehlimusikk.no/en/posts/',
            'x-default': 'https://www.dehlimusikk.no/posts/'
        }
    },
    openGraph: {
        title: 'Innlegg', url: 'https://www.dehlimusikk.no/posts/',
        description: 'Siste oppdateringer fra Dehli Musikk', locale: 'no_NO',
        alternateLocale: 'en_US'
    },
    twitter: { title: 'Innlegg', description: 'Siste oppdateringer fra Dehli Musikk' }
};

export default function PostsPage() {
    const postItems = posts.map((post, index) => {
        const postId = convertToUrlFriendlyString(post.title[lang]);
        return {
            '@type': 'ListItem',
            '@id': `https://www.dehlimusikk.no/posts/${postId}/`,
            name: post.title[lang],
            position: index + 1,
            url: `https://www.dehlimusikk.no/posts/${postId}/`
        };
    });
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': 'https://www.dehlimusikk.no/posts/',
        name: 'Innlegg fra Dehli Musikk',
        itemListElement: postItems
    };

    const breadcrumbs = [{ name: 'Innlegg', path: '/posts/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Innlegg</h1>
                <p>Oppdateringer fra Dehli Musikk</p>
            </Container>
            <Container>
                <List>
                    {posts.map((post) => (
                        <ListItem key={post.id} article>
                            <Post post={post} lang={lang} languageSlug={languageSlug} />
                        </ListItem>
                    ))}
                </List>
            </Container>
        </>
    );
}
