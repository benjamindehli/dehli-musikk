import Link from "next/link";
import { getLanguageSlug } from "lib/i18n";
import { socialMetadata, WEBSITE_URL, type Lang } from "lib/pageMetadata";
import { sectionLinks } from "lib/sectionLinks";

/*
 * These rules are inline rather than in a CSS module. This file is the app's
 * not-found boundary, which means it is part of every page's segment tree, so a
 * stylesheet imported here becomes a <link rel="preload" as="style"> in the head
 * of every page - downloaded everywhere, used only on the 404. Inlining keeps it
 * on the one page that renders it.
 *
 * The 600px breakpoint mirrors $screen-sm in style/abstracts/variables. Class
 * names cannot collide with anything, as this page renders its own document and
 * pulls in no shared components.
 */
const styles = `
.notFound { max-width: 1200px; padding: 64px 24px; margin: auto }
.notFound h1 { margin-bottom: 0 }
.notFoundLogo { width: 100%; max-width: 340px; height: auto }
.notFoundSections { display: grid; gap: 24px; grid-template-columns: 1fr }
.notFoundSection ul { list-style: none; padding: 0 }
.notFoundSection li { margin: 6px 0 }
@media (min-width: 600px) {
    .notFoundSections { grid-template-columns: repeat(2, minmax(0, 1fr)) }
}
`;

/*
 * Firebase Hosting serves the exported 404.html for every path it cannot match,
 * with no way to vary it per directory, so this one page answers misses under
 * both / and /en/. It therefore says its piece in both languages rather than
 * guessing, and links into whichever tree the visitor was aiming for.
 *
 * No navigation bar or footer here: this file sits above the (no) and en layouts
 * and renders its own document, so the links are spelled out rather than pulling
 * in components that expect a language context.
 */
const translations = {
    no: {
        heading: "Siden finnes ikke",
        message: "Siden du lette etter er flyttet eller finnes ikke lenger. Prøv en av disse i stedet:",
        home: "Hjem",
        // Both languages are on the page, so each set of links is named by its
        // language: two nav landmarks called the same thing are no help to a
        // screen reader listing them.
        navLabel: "Norske sider"
    },
    en: {
        heading: "Page not found",
        message: "The page you were looking for has moved or no longer exists. Try one of these instead:",
        home: "Home",
        navLabel: "English pages"
    }
} as const;

export const metadata = {
    title: "404 - Siden finnes ikke - Page not found - Dehli Musikk",
    robots: { follow: true, index: false, archive: false },
    ...socialMetadata("no", {
        title: "404 - Siden finnes ikke - Page not found",
        description: "Siden finnes ikke. The page does not exist.",
        url: `${WEBSITE_URL}/`
    })
};

const renderSection = (lang: Lang) => {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return (
        <section lang={lang} className="notFoundSection">
            <h2>{t.heading}</h2>
            <p>{t.message}</p>
            <nav aria-label={t.navLabel}>
                <ul>
                    <li>
                        <Link href={`/${languageSlug}`} title={t.home}>
                            {t.home}
                        </Link>
                    </li>
                    {sectionLinks.map((sectionLink) => (
                        <li key={sectionLink.path}>
                            <Link href={`/${languageSlug}${sectionLink.path}`} title={sectionLink.label[lang]}>
                                {sectionLink.label[lang]}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
        </section>
    );
};

export default function NotFound() {
    return (
        <html lang="no">
            <body>
                <style dangerouslySetInnerHTML={{ __html: styles }} />
                <div className="notFound">
                    <Link href="/" title="Dehli Musikk">
                        <img src="/images/DehliMusikkLogoHorizontal.svg" alt="Dehli Musikk" width="680" height="112" className="notFoundLogo" />
                    </Link>
                    <h1>404</h1>
                    <div className="notFoundSections">
                        {renderSection("no")}
                        {renderSection("en")}
                    </div>
                </div>
            </body>
        </html>
    );
}
