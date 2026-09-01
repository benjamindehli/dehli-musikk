/*
 * The formatters that turn stored content into strings, kept apart from
 * contentFormatter's React renderer so that nothing importing them drags in JSX.
 * The markdown route handlers and the verification script both read this module
 * outside a bundler, where a file containing JSX cannot be parsed at all.
 *
 * contentFormatter re-exports formatContentAsString, so callers that already
 * import it from there keep working and there is still only one implementation.
 */

const CONTENT_LINK_PATTERN = /\[(?<title>[^\]]+)\]\((?<link>[^)]+)\)/gm;

/**
 * Content with its inline links flattened to their titles.
 */
export const formatContentAsString = (content) => {
    if (!content) return "";
    return content
        .split("\n")
        .map((paragraph) => paragraph.replace(CONTENT_LINK_PATTERN, (_match, title) => title))
        .join(" ");
};

/*
 * Content links are stored site-relative and without a language slug, e.g.
 * "[the Wurlitzer](equipment/instruments/wurlitzer-200a/)". The React renderer
 * resolves them against the current route and formatContentAsString drops them.
 * Markdown keeps them as links, but has to make them absolute: a .md file gets
 * read detached from the page it belongs to, so a relative target has nothing to
 * resolve against.
 *
 * The scheme test is a guard for content not yet written. Every link in the data
 * today is site-relative.
 */
const resolveContentLink = (link, websiteUrl, languageSlug) =>
    /^[a-z][a-z0-9+.-]*:|^\/\//i.test(link) ? link : `${websiteUrl}/${languageSlug}${link}`;

/*
 * Paragraphs are separated by a single newline in the data, which markdown reads
 * as a soft break rather than a paragraph break, so they are rejoined with a
 * blank line between them.
 */
export const formatContentAsMarkdown = (content, websiteUrl, languageSlug) => {
    if (!content) return "";
    return content
        .split("\n")
        .map((paragraph) =>
            paragraph.replace(
                CONTENT_LINK_PATTERN,
                (_match, title, link) => `[${title}](${resolveContentLink(link, websiteUrl, languageSlug)})`
            )
        )
        .join("\n\n");
};
