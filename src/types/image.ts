/*
 * The thumbnail bundles the components pass around.
 *
 * Every path is built at render time from a filename plus a format and a width,
 * so the object is a flat map of `${format}${width}` to a URL. The widths are
 * the generated sizes under public/data/**\/web, and the formats are the three
 * the <picture> elements offer in order of preference - with png appearing only
 * for the "coming soon" placeholder, which has no jpeg.
 *
 * Every key is optional because call sites build different subsets: a compact
 * list item needs the 55 and 110 crops, a fullscreen view the 945. They are
 * nullable as well as optional because an unreleased release renders a shared
 * "coming soon" placeholder, which has png crops and sets the jpg ones to null.
 */
export type ResponsiveImage = {
    avif55?: string | null;
    avif110?: string | null;
    avif350?: string | null;
    avif540?: string | null;
    avif945?: string | null;
    webp55?: string | null;
    webp110?: string | null;
    webp350?: string | null;
    webp540?: string | null;
    webp945?: string | null;
    jpg55?: string | null;
    jpg110?: string | null;
    jpg350?: string | null;
    jpg540?: string | null;
    jpg945?: string | null;
    png55?: string | null;
    png110?: string | null;
    png350?: string | null;
    png540?: string | null;
};
