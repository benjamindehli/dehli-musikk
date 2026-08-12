import { LangProvider } from 'lib/LangContext';
import { ModalProvider } from 'lib/ModalContext';
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';
import SiteJsonLd from 'components/SiteJsonLd';
import style from 'App.module.scss';

export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                {/* crossOrigin is required even same-origin: fonts are always
                    fetched in CORS mode, and without it the preload is not
                    reused and the font downloads twice. */}
                <link rel="preload" href="/fonts/Roboto.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
                {/* No YouTube preconnect here: the player is only fetched once a
                    visitor presses play, so a page-load hint would open a
                    connection that most pages never use. ListItemVideo warms it
                    when someone is about to click instead. */}
                <link rel="alternate" type="application/rss+xml" title="Dehli Musikk news" href="https://www.dehlimusikk.no/feed-en.rss" />
                <SiteJsonLd lang="en" />
            </head>
            <body>
                <LangProvider lang="en">
                    <ModalProvider>
                        <NavigationBar />
                        <div className={style.container}>
                            <main style={{ minHeight: '100vh' }}>
                                {children}
                            </main>
                            <Footer lang="en" />
                        </div>
                    </ModalProvider>
                </LangProvider>
            </body>
        </html>
    );
}
