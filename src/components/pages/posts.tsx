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
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, ogLocale, WEBSITE_URL, type Lang } from 'lib/pageMetadata';
import posts from 'data/posts';

const translations = {
    no: {
        metaTitle: 'Innlegg | Dehli Musikk',
        pageTitle: 'Innlegg',
        description: 'Siste oppdateringer fra Dehli Musikk',
        intro: 'Oppdateringer fra Dehli Musikk',
        listName: 'Innlegg fra Dehli Musikk'
    },
    en: {
        metaTitle: 'Posts | Dehli Musikk',
        pageTitle: 'Posts',
        description: 'Latest update from Dehli Musikk',
        intro: 'Updates from Dehli Musikk',
        listName: 'Posts from Dehli Musikk'
    }
} as const;

type PostRouteProps = { params: Promise<{ postId: string }> };

export function getPostsPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: 'posts/', en: 'posts/' }),
        openGraph: {
            title: t.pageTitle, url: `${WEBSITE_URL}/${languageSlug}posts/`,
            description: t.description, ...ogLocale(lang)
        },
        twitter: { title: t.pageTitle, description: t.description }
    };
}

export function PostsPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const postItems = posts.map((post, index) => {
        const postId = convertToUrlFriendlyString(post.title[lang]);
        return {
            '@type': 'ListItem',
            '@id': `${WEBSITE_URL}/posts/${convertToUrlFriendlyString(post.title.no)}/`,
            name: post.title[lang],
            position: index + 1,
            url: `${WEBSITE_URL}/${languageSlug}posts/${postId}/`
        };
    });
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${WEBSITE_URL}/posts/`,
        name: t.listName,
        itemListElement: postItems
    };

    const breadcrumbs = [{ name: t.pageTitle, path: `/${languageSlug}posts/` }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{t.pageTitle}</h1>
                <p>{t.intro}</p>
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

export function getPostStaticParams(lang: Lang) {
    return posts.map((post) => ({
        postId: convertToUrlFriendlyString(post.title[lang])
    }));
}

function getPost(lang: Lang, postId: string) {
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

export async function getPostDetailsMetadata(lang: Lang, { params }: PostRouteProps): Promise<Metadata> {
    const { postId } = await params;
    const post = getPost(lang, postId);
    if (!post) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const title = `${post.title[lang]} - ${t.metaTitle}`;
    const description = formatContentAsString(post.content[lang]);

    return {
        title,
        description,
        alternates: buildAlternates(lang, {
            no: `posts/${convertToUrlFriendlyString(post.title.no)}/`,
            en: `posts/${convertToUrlFriendlyString(post.title.en)}/`
        }),
        openGraph: {
            title: post.title[lang],
            url: `${WEBSITE_URL}/${languageSlug}posts/${postId}/`,
            description, ...ogLocale(lang),
            images: [{ url: `${WEBSITE_URL}/data/posts/web/jpg/${post.thumbnailFilename}_540.jpg`, width: 540, height: 400 }]
        },
        twitter: { title: post.title[lang], description, images: [`${WEBSITE_URL}/data/posts/web/jpg/${post.thumbnailFilename}_540.jpg`] }
    };
}

export async function PostDetailsPage({ lang, params }: { lang: Lang } & PostRouteProps) {
    const { postId } = await params;
    const post = getPost(lang, postId);

    if (!post) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}posts/` },
        { name: post.title[lang], path: `/${languageSlug}posts/${postId}/` }
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
                <h2 data-size="h1">{t.pageTitle}</h2>
                <p>{t.intro}</p>
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
