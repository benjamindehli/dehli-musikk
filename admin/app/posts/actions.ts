"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Post, PostLink } from "types/content";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { readDataFile, writeDataFile } from "@admin/lib/dataFiles";
import { fromOsloDate, toOsloDate } from "@admin/lib/dates";
import { dateIdentifiers, newestFirstPosition } from "@admin/lib/identifiers";
import { checked, isAbsoluteUrl, isSitePath, Problems, text, type FormState } from "@admin/lib/forms";

function readLink(form: FormData, existing: PostLink | undefined, problems: Problems): PostLink | undefined {
    const kind = text(form, "linkKind");
    if (kind === "none") return undefined;

    const linkText = { en: text(form, "linkTextEn"), no: text(form, "linkTextNo") };
    problems.require(linkText.no, "Norwegian link text");
    problems.require(linkText.en, "English link text");

    if (kind === "internal") {
        const url = { en: text(form, "linkUrlEn"), no: text(form, "linkUrlNo") };
        for (const [lang, value] of Object.entries(url)) {
            if (!isSitePath(value))
                problems.add(`The ${lang === "no" ? "Norwegian" : "English"} internal link must be a site path like products/overtonium/.`);
        }
        return { url, text: linkText, internal: true };
    }

    const url = text(form, "linkUrl");
    if (!isAbsoluteUrl(url)) problems.add("The external link must start with https:// or http://.");
    // Some external links carry an explicit internal: false and some leave it
    // out. Keep whichever the post already had, so saving does not churn it.
    return existing?.internal === false ? { url, text: linkText, internal: false } : { url, text: linkText };
}

export async function savePost(originalId: string | null, _previous: FormState, form: FormData): Promise<FormState> {
    const posts = await readDataFile<Post[]>("posts");
    const index = originalId === null ? -1 : posts.findIndex((post) => post.id === originalId);
    if (originalId !== null && index === -1) return { status: "error", errors: [`Post ${originalId} no longer exists. Was it deleted?`] };
    const existing = index === -1 ? undefined : posts[index];

    const problems = new Problems();
    const title = { no: problems.require(text(form, "titleNo"), "Norwegian title"), en: problems.require(text(form, "titleEn"), "English title") };
    const content = {
        no: problems.require(text(form, "contentNo"), "Norwegian text"),
        en: problems.require(text(form, "contentEn"), "English text")
    };
    const thumbnailDescription = problems.require(text(form, "thumbnailDescription"), "Image description");
    const copyright = checked(form, "copyright");

    const date = fromOsloDate(text(form, "date"));
    if (date === null) problems.add("Date must be a valid day.");
    const modifiedText = text(form, "lastmod");
    const lastmod = modifiedText ? fromOsloDate(modifiedText) : undefined;
    if (lastmod === null) problems.add("Modified must be a valid day, or empty.");

    // Part of the id, so like the id it is only chosen when the post is created.
    const orderNumber = existing ? existing.orderNumber : Number(text(form, "orderNumber") || "0");
    if (!Number.isInteger(orderNumber) || orderNumber < 0 || orderNumber > 99) problems.add("Order number must be a whole number from 0 to 99.");

    const link = readLink(form, existing?.link, problems);

    // Each language's URL is its title as a slug, so two posts with the same
    // title in either language would be one page.
    for (const lang of ["no", "en"] as const) {
        const slug = convertToUrlFriendlyString(title[lang]);
        const clash = posts.find((post, i) => i !== index && convertToUrlFriendlyString(post.title[lang]) === slug);
        if (slug && clash)
            problems.add(`Another post already has the ${lang === "no" ? "Norwegian" : "English"} URL posts/${slug}/ ("${clash.title[lang]}").`);
    }

    if (problems.any || date === null || lastmod === null) return problems.state();

    // A day's existing timestamp is kept as is: about 90 older posts were
    // stamped at 01:00 or 02:00 rather than midnight, and re-saving one should
    // not move it.
    const timestamp = existing && toOsloDate(existing.timestamp) === toOsloDate(date) ? existing.timestamp : date;

    let post: Post;
    if (existing) {
        post = { ...existing, copyright, timestamp, title, content, thumbnailDescription, link, lastmod };
        if (!link) delete post.link;
        if (lastmod === undefined) delete post.lastmod;
        posts[index] = post;
    } else {
        const { id, thumbnailFilename } = dateIdentifiers(timestamp, orderNumber);
        if (posts.some((other) => other.id === id)) {
            return { status: "error", errors: [`A post with id ${id} already exists. Use a higher order number for a second post on the same day.`] };
        }
        post = { id, orderNumber, copyright, timestamp, title, content, thumbnailDescription, thumbnailFilename };
        if (link) post.link = link;
        if (lastmod !== undefined) post.lastmod = lastmod;
        // Newest first, and before any post from the same day: that is the
        // order the file has always been in, and the site's stable sort keeps
        // it for posts sharing a timestamp.
        posts.splice(newestFirstPosition(posts, timestamp), 0, post);
    }

    await writeDataFile("posts", posts);
    revalidatePath("/posts", "layout");
    if (!existing) redirect(`/posts/${post.id}/?created=1`);
    return { status: "saved", message: "Saved to src/data/posts/data/all.json." };
}

export async function deletePost(id: string): Promise<void> {
    const posts = await readDataFile<Post[]>("posts");
    const remaining = posts.filter((post) => post.id !== id);
    if (remaining.length !== posts.length) await writeDataFile("posts", remaining);
    revalidatePath("/posts", "layout");
    redirect("/posts/?deleted=" + encodeURIComponent(id));
}
