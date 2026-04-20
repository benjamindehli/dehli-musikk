import { LangProvider } from 'lib/LangContext';
import NavigationBar from 'components/partials/NavigationBar';
import Footer from 'components/partials/Footer';
import SiteJsonLd from 'components/SiteJsonLd';
import style from 'App.module.scss';

export default function EnLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://www.youtube.com" />
                <link rel="preconnect" href="https://i.ytimg.com" />
                <SiteJsonLd />
            </head>
            <body>
                <LangProvider lang="en">
                    <NavigationBar />
                    <div className={style.container}>
                        <main style={{ minHeight: '100vh' }}>
                            {children}
                        </main>
                        <Footer lang="en" />
                    </div>
                </LangProvider>
            </body>
        </html>
    );
}
