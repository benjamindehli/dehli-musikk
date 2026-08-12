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
        title: 'Dehli Musikk',
        description: t.description,
        alternates: buildAlternates(lang, { no: '', en: '' }),
        openGraph: {
            title: 'Dehli Musikk',
            url: `${WEBSITE_URL}/${languageSlug}`,
            description: t.description,
            ...ogLocale(lang)
        },
        twitter: { title: 'Dehli Musikk', description: t.description }
    };
}

const renderHeaderImage = () => {
    const sizes = [480, 640, 800, 1024, 1260, 1440, 1680];
    const formats = ['avif', 'webp', 'jpg'] as const;
    const mimeTypes = { avif: 'image/avif', webp: 'image/webp', jpg: 'image/jpeg' };

    const sourceElements = formats.flatMap((fmt) =>
        sizes.map((size) => {
            const src = `/images/header_${size}.${fmt}`;
            const size2x = sizes.find((s) => s >= size * 2);
            const srcSet = size2x ? `${src} 1x, /images/header_${size2x}.${fmt} 2x` : src;
            const key = `${fmt}-${size}`;
            return size === 1680 ? (
                <source
                    key={key}
                    srcSet={srcSet}
                    type={mimeTypes[fmt]}
                />
            ) : (
                <source
                    key={key}
                    srcSet={srcSet}
                    type={mimeTypes[fmt]}
                    media={`(max-width: ${size}px)`}
                />
            );
        })
    );

    return (
        <picture className={style.backgroundsImage}>
            {sourceElements}
            <img
                src="/images/header_1024.jpg"
                fetchPriority="high"
                alt="A Korg MS-20 with a cassette and tape recorder"
            />
        </picture>
    );
};

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
