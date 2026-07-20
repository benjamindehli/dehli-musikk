import { PostsPage, getPostsPageMetadata } from 'components/pages/posts';

export const metadata = getPostsPageMetadata('en');

export default function Page() {
    return <PostsPage lang="en" />;
}
