import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Post from 'components/partials/Post';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';
import posts from 'data/posts';

const lang = 'en';
const languageSlug = 'en/';

export function generateStaticParams() {
    return posts.map((post) => ({
        postId: convertToUrlFriendlyString(post.title[lang])
    }));
}

function getPost(postId: string) {
    const index = posts.findIndex(
        (p) => convertToUrlFriendlyString(p.title[lang]) === postId
    );
    if (index === -1) return null;
    const post = posts[index];
    return {
        ...post,
        previousPostId: index > 0 ? convertToUrlFriendlyString(posts[index - 1].title[lang]) : null,
        nextPostId: index < posts.length - 1 ? convertToUrlFriendlyString(posts[index + 1].title[lang]) : null
    };
}

export async function generateMetadata({ params }: { params: { postId: string } }): Promise<Metadata> {
    const { postId } = params;
    const post = getPost(postId);
    if (!post) return {};

    const title = `${post.title[lang]} - Posts | Dehli Musikk`;
    const description = formatContentAsString(post.content[lang]);

    return {
        title,
        description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/en/posts/${postId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/posts/${convertToUrlFriendlyString(post.title.no)}/`,
                en: `https://www.dehlimusikk.no/en/posts/${convertToUrlFriendlyString(post.title.en)}/`,
                'x-default': `https://www.dehlimusikk.no/posts/${convertToUrlFriendlyString(post.title.no)}/`
            }
        },
        openGraph: {
            title: post.title[lang],
            url: `https://www.dehlimusikk.no/en/posts/${postId}/`,
            description, locale: 'en_US', alternateLocale: 'nb_NO'
        },
        twitter: { title: post.title[lang], description }
    };
}

export default function PostDetailPage({ params }: { params: { postId: string } }) {
    const { postId } = params;
    const post = getPost(postId);

    if (!post) notFound();

    const breadcrumbs = [
        { name: 'Posts', path: '/en/posts/' },
        { name: post.title[lang], path: `/en/posts/${postId}/` }
    ];

    return (
        <>
            <Container blur>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Modal
                listPath={`/${languageSlug}posts/`}
                arrowLeftLink={post.previousPostId ? `/${languageSlug}posts/${post.previousPostId}/` : null}
                arrowRightLink={post.nextPostId ? `/${languageSlug}posts/${post.nextPostId}/` : null}
                maxWidth="540px"
                lang={lang}
            >
                <Post post={post} fullscreen={true} lang={lang} languageSlug={languageSlug} />
            </Modal>
            <Container blur>
                <h2 data-size="h1">Posts</h2>
                <p>Updates from Dehli Musikk</p>
            </Container>
            <Container blur>
                <List>
                    {posts.map((p) => (
                        <ListItem key={p.id} article>
                            <Post post={p} lang={lang} languageSlug={languageSlug} />
                        </ListItem>
                    ))}
                </List>
            </Container>
        </>
    );
}
