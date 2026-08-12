export const SITE_ORIGIN = "https://www.dehlimusikk.no/";

// Detail pages render their sibling list behind the modal, where it sits under a
// fixed 75%-black overlay and a 5px blur. Only about one viewport of it is ever
// visible and none of it is readable, so rendering the full list only inflated
// the HTML: a post page carried all 148 posts, at roughly 790 KB. Render just
// enough to fill the backdrop. The list pages and sitemap remain the real
// discovery paths for the rest.
export const BACKDROP_LIST_ITEM_LIMIT = 12;
