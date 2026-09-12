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
    /*
     * Optional because a search result may have no link title: the four content
     * kinds set one, equipment items and FAQ entries do not. Link renders
     * without the attribute in that case, which is correct - the heading beside
     * it already names the destination.
     */
    title?: string;
};
