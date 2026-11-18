import { LangProvider } from "lib/LangContext";
import { ModalProvider } from "lib/ModalContext";
import Analytics from "components/partials/Analytics";
import NavigationBar from "components/partials/NavigationBar";
import Footer from "components/partials/Footer";
import SiteJsonLd from "components/SiteJsonLd";
import WebMcpTools from "components/partials/WebMcpTools";
import { preload } from "react-dom";
import style from "App.module.scss";

export default function NoLayout({ children }: { children: React.ReactNode }) {
    /*
     * Called rather than rendered as <link rel="preload">: React turns such a
     * tag into this same hint and then renders the tag too, so every page had
     * the font preloaded twice. crossOrigin is required even same-origin:
     * fonts are always fetched in CORS mode, and without it the preload is not
     * reused and the font downloads twice.
     */
    preload("/fonts/Roboto.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

    return (
        <html lang="no">
            <head>
                {/* No YouTube preconnect here: the player is only fetched once a
                    visitor presses play, so a page-load hint would open a
                    connection that most pages never use. ListItemVideo warms it
                    when someone is about to click instead. */}
                <link rel="alternate" type="application/rss+xml" title="Dehli Musikk nyheter" href="https://www.dehlimusikk.no/feed-no.rss" />
                <SiteJsonLd lang="no" />
            </head>
            <body>
                <LangProvider lang="no">
                    <ModalProvider>
                        <NavigationBar />
                        <div className={style.container}>
                            <main style={{ minHeight: "100vh" }}>{children}</main>
                            <Footer lang="no" />
                        </div>
                        {/* Registers the site's tools with the browser for in-page
                            agents. Renders nothing. */}
                        <WebMcpTools lang="no" />
                        <Analytics />
                    </ModalProvider>
                </LangProvider>
            </body>
        </html>
    );
}
