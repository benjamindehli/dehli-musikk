import type { Lang } from 'lib/pageMetadata';

export type SectionLink = {
    /** Site-relative path without the language slug and without a leading slash */
    path: string;
    label: Record<Lang, string>;
};

/*
 * The site's top level sections, in the order the navigation sidebar lists them.
 * Shared by the footer and the 404 page, which both need a plain list of links
 * without the icons the sidebar attaches to each entry.
 */
export const sectionLinks: SectionLink[] = [
    { path: 'portfolio/', label: { no: 'Portefølje', en: 'Portfolio' } },
    { path: 'posts/', label: { no: 'Innlegg', en: 'Posts' } },
    { path: 'videos/', label: { no: 'Videoer', en: 'Videos' } },
    { path: 'products/', label: { no: 'Produkter', en: 'Products' } },
    { path: 'equipment/', label: { no: 'Utstyr', en: 'Equipment' } },
    {
        path: 'frequently-asked-questions/',
        label: { no: 'Ofte stilte spørsmål', en: 'Frequently Asked Questions' }
    }
];
