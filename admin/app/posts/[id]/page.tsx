import Link from "next/link";
import { notFound } from "next/navigation";
import type { Post } from "types/content";
import { readDataFile } from "@admin/lib/dataFiles";
import { toOsloDate } from "@admin/lib/dates";
import PostForm, { type PostFormValues } from "./PostForm";

export const dynamic = "force-dynamic";

function formValues(post: Post | undefined): PostFormValues {
    const link = post?.link;
    return {
        id: post?.id ?? null,
        thumbnailFilename: post?.thumbnailFilename ?? null,
        date: post ? toOsloDate(post.timestamp) : toOsloDate(Date.now()),
        lastmod: post?.lastmod ? toOsloDate(post.lastmod) : "",
        orderNumber: post?.orderNumber ?? 0,
        titleNo: post?.title.no ?? "",
        titleEn: post?.title.en ?? "",
        contentNo: post?.content.no ?? "",
        contentEn: post?.content.en ?? "",
        thumbnailDescription: post?.thumbnailDescription ?? "",
        // New posts default to on: about three in four existing posts carry it.
        copyright: post ? Boolean(post.copyright) : true,
        linkKind: !link ? "none" : link.internal ? "internal" : "external",
        linkUrl: link && typeof link.url === "string" ? link.url : "",
        linkUrlNo: link && typeof link.url === "object" ? link.url.no : "",
        linkUrlEn: link && typeof link.url === "object" ? link.url.en : "",
        linkTextNo: link?.text.no ?? "",
        linkTextEn: link?.text.en ?? ""
    };
}

export default async function EditPostPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ created?: string }>;
}) {
    const { id } = await params;
    const { created } = await searchParams;
    const isNew = id === "new";
    const post = isNew ? undefined : (await readDataFile<Post[]>("posts")).find((candidate) => candidate.id === id);
    if (!isNew && !post) notFound();

    return (
        <>
            <p>
                <Link href="/posts/">All posts</Link>
            </p>
            <h1>{post ? post.title.no : "New post"}</h1>
            {created ? <p className="admin-status admin-status-saved">Created. It is saved to src/data/posts/data/all.json.</p> : null}
            {/* Keyed by id so moving between posts resets the form's state. */}
            <PostForm key={id} initial={formValues(post)} />
        </>
    );
}
