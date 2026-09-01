import { Fragment } from "react";
import Link from "next/link";

const renderContentLinksAsReactLinks = (content, languageSlug) => {
    const regex = /\[(?<title>[^\]]+)\]\((?<link>[^)]+)\)/gm;

    const elements = [];
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const matchStart = match.index;
        const matchEnd = regex.lastIndex;

        // Push content before the match
        if (matchStart > lastIndex) {
            elements.push(<Fragment key={`text-${lastIndex}`}>{content.slice(lastIndex, matchStart)}</Fragment>);
        }

        // Push the matched link
        const title = match.groups.title;
        const link = `/${languageSlug}${match.groups.link}`;
        elements.push(
            <Link key={`link-${matchStart}`} href={link} data-tabable={true}>
                {title}
            </Link>
        );

        // Update lastIndex
        lastIndex = matchEnd;
    }

    // Push any remaining text after last match
    if (lastIndex < content.length) {
        elements.push(<Fragment key={`text-end`}>{content.slice(lastIndex)}</Fragment>);
    }

    return elements.length ? elements : content;
};

export const formatContentWithReactLinks = (content, languageSlug) => {
    const formattedContent = content.split("\n").map((paragraph) => {
        const paraKey = `para-${paragraph.slice(0, 20)}-${paragraph.length}`;
        return <p key={paraKey}>{renderContentLinksAsReactLinks(paragraph, languageSlug)}</p>;
    });
    return formattedContent;
};

// Re-exported so the many callers that already import it from here keep working;
// it lives in contentText because this module cannot be read outside a bundler.
export { formatContentAsString } from "helpers/contentText";
