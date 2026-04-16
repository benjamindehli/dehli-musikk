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

const lang = 'no';
const languageSlug = '';

export const metadata: Metadata = {
    title: 'Dehli Musikk',
    description: 'Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/',
        languages: {
            no: 'https://www.dehlimusikk.no/',
            en: 'https://www.dehlimusikk.no/en/',
            'x-default': 'https://www.dehlimusikk.no/'
        }
    },
    openGraph: {
        title: 'Dehli Musikk',
        url: 'https://www.dehlimusikk.no/',
        description: 'Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band',
        locale: 'no_NO',
        alternateLocale: 'en_US'
    },
    twitter: {
        title: 'Dehli Musikk',
        description: 'Dehli Musikk er et enkeltpersonsforetak drevet av Benjamin Dehli som tilbyr spilling av tangentinstrumenter på låter for artister og band'
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
                    <h2 className={style.sectionHeader}>Siste oppdateringer</h2>
                    <LatestPosts lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/posts/" title="Se alle innlegg">
                            <Button>Vis alle innlegg</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>Siste utgivelser</h2>
                    <LatestReleases lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/portfolio/" title="Se alle utgivelser">
                            <Button>Vis alle utgivelser</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div className={style.mutedSection} style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>Siste videoer</h2>
                    <LatestVideos lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/videos/" title="Se alle videoer">
                            <Button>Vis alle videoer</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div style={{ minHeight: '650px' }}>
                <Container>
                    <h2 className={style.sectionHeader}>Nyeste produkter</h2>
                    <LatestProducts lang={lang} languageSlug={languageSlug} />
                    <div className={style.callToActionButtonContainer}>
                        <Link href="/products/" title="Se alle produkter">
                            <Button>Se alle produkter</Button>
                        </Link>
                    </div>
                </Container>
            </div>

            <div className={style.socialMediaSection} style={{ minHeight: '297px' }}>
                <div className={style.contentSection}>
                    <h2>Følg Dehli Musikk på sosiale medier</h2>
                    <SocialMediaLinks lang={lang} />
                </div>
            </div>
        </>
    );
}
