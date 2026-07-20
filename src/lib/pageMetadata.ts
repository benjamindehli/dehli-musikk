import type { Metadata } from 'next';

export type Lang = 'no' | 'en';

export const WEBSITE_URL = 'https://www.dehlimusikk.no';

// Facebook/Open Graph locale codes (Norwegian Bokmål is nb_NO)
export const OG_LOCALES: Record<Lang, string> = { no: 'nb_NO', en: 'en_US' };

export const otherLang = (lang: Lang): Lang => (lang === 'no' ? 'en' : 'no');

/**
 * Builds canonical + hreflang alternates for a page.
 * Paths are site-relative without leading slash and without the /en/ prefix,
 * e.g. { no: 'posts/innlegg-slug/', en: 'posts/post-slug/' }.
 */
export function buildAlternates(lang: Lang, paths: { no: string; en: string }): Metadata['alternates'] {
    const urls = {
        no: `${WEBSITE_URL}/${paths.no}`,
        en: `${WEBSITE_URL}/en/${paths.en}`
    };
    return {
        canonical: urls[lang],
        languages: { no: urls.no, en: urls.en, 'x-default': urls.no }
    };
}

export function ogLocale(lang: Lang): { locale: string; alternateLocale: string } {
    return { locale: OG_LOCALES[lang], alternateLocale: OG_LOCALES[otherLang(lang)] };
}
