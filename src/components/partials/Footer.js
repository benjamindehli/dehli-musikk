// Dependencies
import React from 'react';
import Link from 'next/link';

// Lib
import { getLanguageSlug } from 'lib/i18n';
import { sectionLinks } from 'lib/sectionLinks';

// Stylesheets
import style from 'components/partials/Footer.module.scss';

const year = new Date().getFullYear();

/*
 * The same accounts the home page's social media section links, as plain text
 * rather than icons: the icon row pulls in the FontAwesome brands set, which
 * nothing else sitewide uses and which the footer would put on every page.
 */
const socialLinks = [
    { href: 'https://www.facebook.com/DehliMusikk/', label: 'Facebook', titleKey: 'facebook' },
    { href: 'https://www.instagram.com/benjamindehli/', label: 'Instagram', titleKey: 'instagram' },
    { href: 'https://youtube.com/@BenjaminDehli', label: 'YouTube', titleKey: 'youtube' },
    { href: 'https://github.com/benjamindehli', label: 'GitHub', titleKey: 'github' }
];

const translations = {
    no: {
        navLabel: 'Lenker i bunnteksten',
        pages: 'Sider',
        contact: 'Kontakt',
        home: 'Hjem',
        email: 'Send e-post',
        facebook: 'Dehli Musikk på Facebook',
        instagram: 'Dehli Musikk på Instagram',
        youtube: 'Dehli Musikk på YouTube',
        github: 'Benjamin Dehli på GitHub',
        feed: 'Nyheter som RSS'
    },
    en: {
        navLabel: 'Footer links',
        pages: 'Pages',
        contact: 'Contact',
        home: 'Home',
        email: 'Send an email',
        facebook: 'Dehli Musikk on Facebook',
        instagram: 'Dehli Musikk on Instagram',
        youtube: 'Dehli Musikk on YouTube',
        github: 'Benjamin Dehli on GitHub',
        feed: 'News as RSS'
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
                    <div className={`${style.linkSection} ${style.contactLinks}`}>
                        <h2>{t.contact}</h2>
                        <ul>
                            <li>
                                <a href="mailto:superelg@gmail.com" title={t.email}>
                                    superelg@gmail.com
                                </a>
                            </li>
                            {socialLinks.map((socialLink) => (
                                <li key={socialLink.href}>
                                    <a
                                        href={socialLink.href}
                                        title={t[socialLink.titleKey]}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {socialLink.label}
                                    </a>
                                </li>
                            ))}
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
