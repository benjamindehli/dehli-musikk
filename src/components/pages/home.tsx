import type { Metadata } from 'next';
import Link from 'next/link';
import Button from 'components/partials/Button';
import Container from 'components/template/Container';
import IntroContent from 'components/partials/IntroContent';
import LatestPosts from 'components/partials/LatestPosts';
import LatestProducts from 'components/partials/LatestProducts';
import LatestReleases from 'components/partials/LatestReleases';
import LatestVideos from 'components/partials/LatestVideos';
import SocialMediaLinks from 'components/partials/SocialMediaLinks';
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, ogLocale, WEBSITE_URL, type Lang } from 'lib/pageMetadata';
import style from 'components/routes/Home.module.scss';

const translations = {
    no: {
        metaTitle: 'Dehli Musikk - tangentinstrumenter på låter for artister og band',
        description: 'Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band',
        latestPosts: 'Siste oppdateringer',
        seeAllPosts: 'Se alle innlegg',
        showAllPosts: 'Vis alle innlegg',
        latestReleases: 'Siste utgivelser',
        seeAllReleases: 'Se alle utgivelser',
        showAllReleases: 'Vis alle utgivelser',
        latestVideos: 'Siste videoer',
        seeAllVideos: 'Se alle videoer',
        showAllVideos: 'Vis alle videoer',
        latestProducts: 'Nyeste produkter',
        seeAllProducts: 'Se alle produkter',
        showAllProducts: 'Se alle produkter',
        followOnSocialMedia: 'Følg Dehli Musikk på sosiale medier'
    },
    en: {
        metaTitle: 'Dehli Musikk - keyboard instrument tracks for artists and bands',
        description: 'Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands',
        latestPosts: 'Latest updates',
        seeAllPosts: 'See all posts',
        showAllPosts: 'Show all posts',
        latestReleases: 'Latest releases',
        seeAllReleases: 'See all releases',
        showAllReleases: 'Show all releases',
        latestVideos: 'Latest videos',
        seeAllVideos: 'See all videos',
        showAllVideos: 'Show all videos',
        latestProducts: 'Newest products',
        seeAllProducts: 'See all products',
        showAllProducts: 'See all products',
        followOnSocialMedia: 'Follow Dehli Musikk on social media'
    }
} as const;

export function getHomePageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: '', en: '' }),
        openGraph: {
            // Kept as the bare brand name: og:title is a social-card heading,
            // not a search snippet, and the keywords read as noise there.
            title: 'Dehli Musikk',
            url: `${WEBSITE_URL}/${languageSlug}`,
            description: t.description,
            ...ogLocale(lang)
        },
        twitter: { title: 'Dehli Musikk', description: t.description }
    };
}

/*
 * The header spans the full width of the viewport, so every candidate is offered
 * with a w descriptor and sizes="100vw". The browser then multiplies viewport
 * width by device pixel ratio and picks the smallest file that covers it, which
 * is what the previous media + 1x/2x pairs could not express: the widest file
 * was 1680, so any display above 840 CSS px at 2x was served fewer pixels than
 * it could show.
 *
 * Only avif and webp need <source> elements. The <img> carries the jpeg
 * candidates, so it doubles as the fallback for browsers supporting neither.
 */
const HEADER_IMAGE_WIDTHS = [480, 640, 800, 1024, 1260, 1440, 1680, 1920, 2160, 2560, 2880, 3200, 3840];

const headerSrcSet = (extension: 'avif' | 'webp' | 'jpg') =>
    HEADER_IMAGE_WIDTHS.map((width) => `/images/header_${width}.${extension} ${width}w`).join(', ');

const renderHeaderImage = () => (
    <picture className={style.backgroundsImage}>
        <source type="image/avif" sizes="100vw" srcSet={headerSrcSet('avif')} />
        <source type="image/webp" sizes="100vw" srcSet={headerSrcSet('webp')} />
        <img
            src="/images/header_1260.jpg"
            srcSet={headerSrcSet('jpg')}
            sizes="100vw"
            width="1260"
            height="804"
            fetchPriority="high"
            alt="A Korg MS-20 with a cassette and tape recorder"
        />
    </picture>
);

export function HomePage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);

    return (
        <>
            <div className={style.header} style={{ minHeight: '135px' }}>
                {renderHeaderImage()}
                <div className={style.overlay}>
                    <span className={style.logo}>
                        <img src="/images/DehliMusikkLogoInverse.svg" alt="Logo for Dehli Musikk" width="350" height="207" />
                    </span>
                </div>
            </div>

            <div className={style.contentSection} style={{ minHeight: '468px' }}>
                <header>
                    <h1>Dehli Musikk</h1>
                </header>
                <IntroContent lang={lang} languageSlug={languageSlug} />
            </div>

            <div className={style.mutedSection} style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>{t.latestPosts}</h2>
                    <LatestPosts lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href={`/${languageSlug}posts/`} title={t.seeAllPosts}>
                            <Button>{t.showAllPosts}</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>{t.latestReleases}</h2>
                    <LatestReleases lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href={`/${languageSlug}portfolio/`} title={t.seeAllReleases}>
                            <Button>{t.showAllReleases}</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div className={style.mutedSection} style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>{t.latestVideos}</h2>
                    <LatestVideos lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href={`/${languageSlug}videos/`} title={t.seeAllVideos}>
                            <Button>{t.showAllVideos}</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>{t.latestProducts}</h2>
                    <LatestProducts lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href={`/${languageSlug}products/`} title={t.seeAllProducts}>
                            <Button>{t.showAllProducts}</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div id="contact" className={style.socialMediaSection} style={{ minHeight: '297px' }}>
                <div className={style.contentSection}>
                    <h2>{t.followOnSocialMedia}</h2>
                    <SocialMediaLinks lang={lang} />
                </div>
            </div>
        </>
    );
}
