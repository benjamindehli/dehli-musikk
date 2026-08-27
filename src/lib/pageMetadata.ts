import type { Metadata } from 'next';

export type Lang = 'no' | 'en';

export const WEBSITE_URL = 'https://www.dehlimusikk.no';

const SITE_NAME = 'Dehli Musikk';
const TWITTER_HANDLE = '@BenjaminDehli';

// Shown wherever a page has no image of its own, so a shared link never renders
// as a card with an empty image area. 1200x630 is the size both Facebook and X
// crop to.
const DEFAULT_OG_IMAGE = {
    url: `${WEBSITE_URL}/images/DehliMusikk-OpenGraph.jpg`,
    width: 1200,
    height: 630
};

// Facebook/Open Graph locale codes (Norwegian Bokmål is nb_NO)
export const OG_LOCALES: Record<Lang, string> = { no: 'nb_NO', en: 'en_US' };

// Same identifier used as the author @id in the site's JSON-LD, so the author
// resolves to one identity across both vocabularies.
export const AUTHOR_URL = 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f';

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

type SocialImage = { url: string; width: number; height: number };

type SharedSocialInput = {
    title: string;
    description: string;
    /** Absolute canonical URL for this page in this language */
    url: string;
    /** Omit to fall back to the site's default share image */
    images?: SocialImage[];
};

type SocialInput =
    | (SharedSocialInput & { type?: 'website' })
    | (SharedSocialInput & { type: 'article'; publishedTime: string; modifiedTime: string; authors: string[] })
    // og:music:duration is in whole seconds
    | (SharedSocialInput & { type: 'music.song'; duration?: number });

/**
 * Builds both social vocabularies for a page.
 *
 * Next.js resolves openGraph and twitter by replacing the parent's object rather
 * than merging into it (see resolveMetadata), so a page declaring either one
 * drops every sitewide default the root layout tried to set: the fallback image,
 * og:site_name, twitter:card and the account handles. Defaults therefore live
 * here, in something each page calls, rather than in a layout that never
 * reaches them.
 */
export function socialMetadata(lang: Lang, input: SocialInput): Pick<Metadata, 'openGraph' | 'twitter'> {
    const images = input.images?.length ? input.images : [DEFAULT_OG_IMAGE];
    const shared = {
        siteName: SITE_NAME,
        title: input.title,
        description: input.description,
        url: input.url,
        images,
        ...ogLocale(lang)
    };

    const openGraph =
        input.type === 'article'
            ? {
                  ...shared,
                  type: 'article' as const,
                  publishedTime: input.publishedTime,
                  modifiedTime: input.modifiedTime,
                  authors: input.authors
              }
            : input.type === 'music.song'
              ? { ...shared, type: 'music.song' as const, duration: input.duration }
              : { ...shared, type: 'website' as const };

    return {
        openGraph,
        twitter: {
            card: 'summary_large_image',
            site: TWITTER_HANDLE,
            creator: TWITTER_HANDLE,
            title: input.title,
            description: input.description,
            images: images.map((image) => image.url)
        }
    };
}
