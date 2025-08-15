import { Fragment } from "react";
import { Link } from "react-router-dom";

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
            <Link key={`link-${matchStart}`} to={link} data-tabable={true}>
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

const renderContentLinksAsText = (content) => {
    const regex = /\[(?<title>[^\]]+)\]\((?<link>[^)]+)\)/gm;

    let result = "";
    let lastIndex = 0;

    let match;
    while ((match = regex.exec(content)) !== null) {
        const matchStart = match.index;
        const matchEnd = regex.lastIndex;

        // Append text before match
        result += content.slice(lastIndex, matchStart);

        // Append just the title (stripped link)
        result += match.groups.title;

        // Update lastIndex
        lastIndex = matchEnd;
    }

    // Append remaining text
    if (lastIndex < content.length) {
        result += content.slice(lastIndex);
    }

    return result;
};

export const formatContentWithReactLinks = (content, languageSlug) => {
    const formattedContent = content.split("\n").map((paragraph, key) => {
        return <p key={key}>{renderContentLinksAsReactLinks(paragraph, languageSlug)}</p>;
    });
    return formattedContent;
};

export const formatContentAsString = (content) => {
    const formattedContent = content.split("\n").map((paragraph) => {
        return renderContentLinksAsText(paragraph);
    });
    const formattedContentString = formattedContent.join(" ");
    return formattedContentString;
};
