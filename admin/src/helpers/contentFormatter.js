import { Fragment } from "react";
import { Link } from "react-router-dom";

const interleave = (arr, thing) => [].concat(...arr.map((n) => [n, thing])).slice(0, -1);

const renderContentLinksAsReactLinks = (content, languageSlug) => {
    const regex = /\[(?<title>[\w\s\d+'&\-æÆøØåÅ()/]+)\]\((?<link>[\w\d./?=#-]+)\)*/gm;

    let match;
    let links = [];
    while ((match = regex.exec(content)) !== null) {
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        const unformattedLink = match?.[0];
        const title = match?.groups?.title;
        const link = `/${languageSlug}${match?.groups?.link}`;

        links.push({
            formatted: <Link to={link}>{title}</Link>,
            unformatted: unformattedLink
        });
    }
    if (links.length) {
        let lastPartOfContent = content;
        let formattedContent = [];
        links.forEach((link) => {
            const contentBetweenLinks = lastPartOfContent.split(link.unformatted);
            const contentWithFormattedLinks = interleave(contentBetweenLinks, link.formatted);
            lastPartOfContent = contentWithFormattedLinks.pop();
            formattedContent = formattedContent.concat(contentWithFormattedLinks);
        });
        if (lastPartOfContent.length) {
            formattedContent.push(lastPartOfContent);
        }
        return formattedContent.map((contentPart, index) => {
            return <Fragment key={`content-part-${index}`}>{contentPart}</Fragment>;
        });
    } else {
        return content;
    }
};

const renderContentLinksAsText = (content) => {
    const regex = /\[(?<title>[\w\s\d+'&\-æÆøØåÅ()/]+)\]\((?<link>[\w\d./?=#-]+)\)*/gm;

    let match;
    let links = [];
    while ((match = regex.exec(content)) !== null) {
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }

        const unformattedLink = match?.[0];
        const title = match?.groups?.title;

        links.push({
            formatted: title,
            unformatted: unformattedLink
        });
    }
    if (links.length) {
        let lastPartOfContent = content;
        let formattedContent = [];
        links.forEach((link) => {
            const contentBetweenLinks = lastPartOfContent.split(link.unformatted);
            const contentWithFormattedLinks = interleave(contentBetweenLinks, link.formatted);
            lastPartOfContent = contentWithFormattedLinks.pop();
            formattedContent = formattedContent.concat(contentWithFormattedLinks);
        });
        if (lastPartOfContent.length) {
            formattedContent.push(lastPartOfContent);
        }
        return formattedContent.join("");
    } else {
        return content;
    }
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
