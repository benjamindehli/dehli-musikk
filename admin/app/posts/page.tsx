import Link from "next/link";
import type { Post } from "types/content";
import { readDataFile } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";

export const dynamic = "force-dynamic";

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
    const posts = await readDataFile<Post[]>("posts");
    const { deleted } = await searchParams;

    return (
        <>
            <div className="admin-heading">
                <h1>Posts ({posts.length})</h1>
                <Link className="admin-button" href="/posts/new/">
                    New post
                </Link>
            </div>
            {deleted ? <p className="admin-status admin-status-saved">Deleted post {deleted}.</p> : null}
            <table className="admin-table">
                <thead>
                    <tr>
                        <th scope="col">Date</th>
                        <th scope="col">Title</th>
                        <th scope="col">Link</th>
                    </tr>
                </thead>
                <tbody>
                    {posts.map((post) => (
                        <tr key={post.id}>
                            <td>{toOsloDate(post.timestamp)}</td>
                            <td>
                                <Link href={`/posts/${post.id}/`}>{post.title.no}</Link>
                                <br />
                                <span className="admin-muted">{post.title.en}</span>
                            </td>
                            <td>{post.link ? (post.link.internal ? "Internal" : "External") : ""}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
