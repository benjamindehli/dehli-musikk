import { PostsPage, getPostsPageMetadata } from 'components/pages/posts';

export const metadata = getPostsPageMetadata('no');

export default function Page() {
    return <PostsPage lang="no" />;
}
