// Dependencies
import React from 'react';
import { useSelector } from 'react-redux';
import { saveAs } from 'file-saver';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Selectors
import { getLanguageSlugByKey } from 'reducers/AvailableLanguagesReducer';

// Helpers
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { convertToXmlFriendlyString } from 'helpers/xmlStringFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';

// Data
import posts from 'data/posts';

// Stylesheet
import style from 'components/routes/Dashboard.module.scss';


const Feeds = () => {

    // Redux store
    const languageSlug = {
        no: useSelector(state => getLanguageSlugByKey(state, 'no')),
        en: useSelector(state => getLanguageSlugByKey(state, 'en'))
    }


    const renderTitleElement = (title) => {
        return `<title>${convertToXmlFriendlyString(title)}</title>`;
    }

    const renderDescriptionElement = (description) => {
        const descriptionAsString = formatContentAsString(description);
        return `<description>${convertToXmlFriendlyString(descriptionAsString)}</description>`;
    }

    const renderPubDateElement = (timestamp) => {
        const pubDate = new Date(timestamp).toGMTString();
        return `<pubDate>${pubDate}</pubDate>`;
    }

    const renderLinkElement = (url) => {
        return `<link>https://www.dehlimusikk.no/${url}</link>`;
    }

    const renderGuidElement = (url) => {
        return `<guid>https://www.dehlimusikk.no/${url}</guid>`;
    }

    const renderPostItemElements = (languageKey) => {
        const latestPosts = posts?.slice(0, 20);
        return latestPosts && latestPosts.length
            ? latestPosts.map(post => {
                const url = `${languageSlug[languageKey]}posts/${convertToUrlFriendlyString(post.title[languageKey])}/`;
                return `<item>
                ${renderTitleElement(post.title[languageKey])}
                ${renderDescriptionElement(post.content[languageKey])}
                ${renderPubDateElement(post.timestamp)}
                ${renderLinkElement(url)}
                ${renderGuidElement(url)}
                <dc:creator>Benjamin Dehli</dc:creator>
                </item>\n`
            }).join('')
            : '';
    }

    const getNewsSitemapXML = (languageKey) => {
        return [
            '<?xml version="1.0" encoding="UTF-8"?>\n',
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">\n',
            '<channel>\n',
            `<title>Dehli Musikk ${languageKey === 'en' ? 'news' : 'nyheter'}</title>\n`,
            '<link>https://www.dehlimusikk.no/</link>\n',
            `<atom:link href="https://www.dehlimusikk.no/${languageKey === 'en' ? 'feed-en.rss' : 'feed-no.rss'}" rel="self" type="application/rss+xml" />\n`,
            '<description></description>\n',
            renderPostItemElements(languageKey),
            '</channel>\n',
            '</rss>'
        ].join('');
    }

    const saveFileContent = (fileContent, fileName) => {
        const blob = new Blob([fileContent], {
            type: "application/xml;charset=utf-8"
        });
        saveAs(blob, fileName);
    }


    return (
        <div className={style.grid}>
            <button className={style.gridItem} onClick={() => saveFileContent(getNewsSitemapXML('no'), 'feed-no.rss')}>
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={['fas', 'rss']} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={['fas', 'download']} />
                    </span>
                </span>
                <span className={style.gridItemName}>feed-no.rss</span>
            </button>
            <button className={style.gridItem} onClick={() => saveFileContent(getNewsSitemapXML('en'), 'feed-en.rss')}>
                <span className={style.gridItemIcon}>
                    <FontAwesomeIcon icon={['fas', 'rss']} size="3x" />
                    <span className={style.gridItemIconBadge}>
                        <FontAwesomeIcon icon={['fas', 'download']} />
                    </span>
                </span>
                <span className={style.gridItemName}>feed-en.rss</span>
            </button>
        </div>)
}

export default Feeds;
