import { LangProvider } from 'lib/LangContext';
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';
import SiteJsonLd from 'components/SiteJsonLd';
import style from 'App.module.scss';

export default function NoLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="no">
            <head>
                <link rel="preconnect" href="https://www.youtube.com" />
                <link rel="preconnect" href="https://i.ytimg.com" />
                <link rel="alternate" type="application/rss+xml" title="Dehli Musikk nyheter" href="https://www.dehlimusikk.no/feed-no.rss" />
                <SiteJsonLd />
            </head>
            <body>
                <LangProvider lang="no">
                    <NavigationBar />
                    <div className={style.container}>
                        <main style={{ minHeight: '100vh' }}>
                            {children}
                        </main>
                        <Footer lang="no" />
                    </div>
                </LangProvider>
            </body>
        </html>
    );
}
