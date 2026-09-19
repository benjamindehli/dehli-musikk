import type { ReactNode } from "react";
import { Fragment } from "react";
import Link from "next/link";

/*
 * A link target that is not a path into this site: it carries a scheme
 * (https:, mailto:, tel:), is protocol relative, or is a fragment on the page it
 * is already on. The language slug must not be prefixed onto any of them.
 *
 * Getting this wrong produced href="/mailto:superelg@gmail.com" and
 * href="/https://www.facebook.com/DehliMusikk/" on both language versions of the
 * FAQ - the contact links on the page that exists to answer "how do I get in
 * touch". They render, they look like links, and they 404. yarn verify:links is
 * what found them.
 */
const NOT_A_SITE_PATH = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i;

const renderContentLinksAsReactLinks = (content: string, languageSlug: string): ReactNode[] | string => {
    const regex = /\[(?<title>[^\]]+)\]\((?<link>[^)]+)\)/gm;

    const elements: ReactNode[] = [];
    let lastIndex = 0;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
        const matchStart = match.index;
        const matchEnd = regex.lastIndex;

        // Push content before the match
        if (matchStart > lastIndex) {
            elements.push(<Fragment key={`text-${lastIndex}`}>{content.slice(lastIndex, matchStart)}</Fragment>);
        }

        // Push the matched link
        const title = (match.groups as Record<string, string>).title;
        const target = (match.groups as Record<string, string>).link;
        if (NOT_A_SITE_PATH.test(target)) {
            elements.push(
                <a key={`link-${matchStart}`} href={target} data-tabable={true}>
                    {title}
                </a>
            );
        } else {
            /*
             * Targets are authored relative to the language root ("portfolio/"),
             * which is what gets the slug. One authored with a leading slash is
             * already rooted, and prefixing it would produce "//portfolio/" - a
             * protocol relative URL pointing at a host called "portfolio".
             */
            const href = target.startsWith("/") ? target : `/${languageSlug}${target}`;
            elements.push(
                <Link key={`link-${matchStart}`} href={href} data-tabable={true}>
                    {title}
                </Link>
            );
        }

        // Update lastIndex
        lastIndex = matchEnd;
    }

    // Push any remaining text after last match
    if (lastIndex < content.length) {
        elements.push(<Fragment key={`text-end`}>{content.slice(lastIndex)}</Fragment>);
    }

    return elements.length ? elements : content;
};

export const formatContentWithReactLinks = (content: string, languageSlug: string) => {
    const formattedContent = content.split("\n").map((paragraph) => {
        const paraKey = `para-${paragraph.slice(0, 20)}-${paragraph.length}`;
        return <p key={paraKey}>{renderContentLinksAsReactLinks(paragraph, languageSlug)}</p>;
    });
    return formattedContent;
};

// Re-exported so the many callers that already import it from here keep working;
// it lives in contentText because this module cannot be read outside a bundler.
export { formatContentAsString } from "helpers/contentText";
