// Dependencies
import React from 'react';
import Link from 'next/link';

// Lib
import { getLanguageSlug } from 'lib/i18n';
import { sectionLinks } from 'lib/sectionLinks';

// Stylesheets
import style from 'components/partials/Footer.module.scss';

const year = new Date().getFullYear();

const translations = {
    no: {
        navLabel: 'Lenker i bunnteksten',
        pages: 'Sider',
        contact: 'Kontakt',
        home: 'Hjem',
        email: 'Send e-post',
        facebook: 'Dehli Musikk på Facebook',
        feed: 'Nyheter som RSS',
        country: 'Norge'
    },
    en: {
        navLabel: 'Footer links',
        pages: 'Pages',
        contact: 'Contact',
        home: 'Home',
        email: 'Send an email',
        facebook: 'Dehli Musikk on Facebook',
        feed: 'News as RSS',
        country: 'Norway'
    }
};

const Footer = ({ lang }) => {
    const t = translations[lang] || translations.no;
    const languageSlug = getLanguageSlug(lang);
    const feedPath = lang === 'en' ? '/feed-en.rss' : '/feed-no.rss';

    return (
        <footer className={style.footer}>
            <div className={style.contentSection}>
                <nav className={style.grid} aria-label={t.navLabel}>
                    <div className={style.linkSection}>
                        <h2>{t.pages}</h2>
                        <ul>
                            <li>
                                <Link href={`/${languageSlug}`} title={t.home}>
                                    {t.home}
                                </Link>
                            </li>
                            {sectionLinks.map((sectionLink) => {
                                const label = sectionLink.label[lang] || sectionLink.label.no;
                                return (
                                    <li key={sectionLink.path}>
                                        <Link href={`/${languageSlug}${sectionLink.path}`} title={label}>
                                            {label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                    <div className={`${style.linkSection} ${style.addressContent}`}>
                        <h2>{t.contact}</h2>
                        {/* Matches the address and telephone in the LocalBusiness
                            structured data, so the two cannot disagree about
                            where the business is. */}
                        <address>
                            Margretes veg 15
                            <br />
                            3804 Bø i Telemark
                            <br />
                            {t.country}
                        </address>
                        <ul>
                            <li>
                                <a href="mailto:superelg@gmail.com" title={t.email}>
                                    superelg@gmail.com
                                </a>
                            </li>
                            <li>
                                <a href="tel:+4792292719" title={t.contact}>
                                    +47 92 29 27 19
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.facebook.com/DehliMusikk/"
                                    title={t.facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Facebook
                                </a>
                            </li>
                            <li>
                                <a href={feedPath} title={t.feed}>
                                    RSS
                                </a>
                            </li>
                        </ul>
                    </div>
                </nav>
                <div className={style.copyright}>© {year} Dehli Musikk</div>
            </div>
        </footer>
    );
};

export default Footer;
