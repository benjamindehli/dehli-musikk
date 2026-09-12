/*
 * The link a list item wraps itself in. Shared by the thumbnail and the content
 * header, which link to the same place from the same list item, so the two must
 * never disagree about the shape.
 *
 * Optional at the call site: a list item rendered fullscreen is already on the
 * page it would link to, and passes no link at all.
 */
export type ListItemLink = {
    to: string;
    title: string;
};
