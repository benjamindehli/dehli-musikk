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
import style from 'components/routes/Home.module.scss';

const lang = 'en';
const languageSlug = 'en/';

export const metadata: Metadata = {
    title: 'Dehli Musikk',
    description: 'Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/en/',
        languages: {
            no: 'https://www.dehlimusikk.no/',
            en: 'https://www.dehlimusikk.no/en/',
            'x-default': 'https://www.dehlimusikk.no/'
        }
    },
    openGraph: {
        title: 'Dehli Musikk',
        url: 'https://www.dehlimusikk.no/en/',
        description: 'Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands',
        locale: 'en_US',
        alternateLocale: 'nb_NO'
    },
    twitter: {
        title: 'Dehli Musikk',
        description: 'Dehli Musikk is a sole proprietorship run by Benjamin Dehli which offers keyboard instrument tracks on recordings for artists and bands'
    }
};

const renderHeaderImage = () => {
    const sizes = [480, 640, 800, 1024, 1260, 1440, 1680];
    const formats = ['avif', 'webp', 'jpg'] as const;

    const sourceElements = formats.flatMap((fmt) =>
        sizes.map((size) => {
            const src = `/images/header_${size}.${fmt}`;
            const key = `${fmt}-${size}`;
            return size === 1680 ? (
                <source
                    key={key}
                    srcSet={`${src} 1x, ${src} 2x`}
                    type={`image/${fmt}`}
                />
            ) : (
                <source
                    key={key}
                    srcSet={`${src} 1x, ${src} 2x`}
                    type={`image/${fmt}`}
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

export default function HomePage() {
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
                    <h2 className={style.sectionHeader}>Latest updates</h2>
                    <LatestPosts lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/en/posts/" title="See all posts">
                            <Button>Show all posts</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>Latest releases</h2>
                    <LatestReleases lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/en/portfolio/" title="See all releases">
                            <Button>Show all releases</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div className={style.mutedSection} style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>Latest videos</h2>
                    <LatestVideos lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/en/videos/" title="See all videos">
                            <Button>Show all videos</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>Newest products</h2>
                    <LatestProducts lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/en/products/" title="See all products">
                            <Button>See all products</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div className={style.socialMediaSection} style={{ minHeight: '297px' }}>
                <div className={style.contentSection}>
                    <h2>Follow Dehli Musikk on social media</h2>
                    <SocialMediaLinks lang={lang} />
                </div>
            </div>
        </>
    );
}
