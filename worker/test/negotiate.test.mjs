/*
 * Run with: yarn worker:test
 *
 * The cases that matter most are the negative ones. This Worker sits in front of
 * every request the site serves, so a false positive does not degrade markdown
 * support, it serves plain text to somebody's browser.
 */
import assert from 'node:assert/strict';
import test from 'node:test';

import { acceptQuality, markdownPathFor, prefersMarkdown } from '../src/negotiate.js';

test('real browser Accept headers keep getting HTML', () => {
    const browsers = {
        chrome: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        firefox: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        safari: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
    };
    for (const [name, accept] of Object.entries(browsers)) {
        assert.equal(prefersMarkdown(accept), false, `${name} should get HTML`);
    }
});

test('clients that send no preference keep getting HTML', () => {
    assert.equal(prefersMarkdown(null), false, 'missing header');
    assert.equal(prefersMarkdown(''), false, 'empty header');
    assert.equal(prefersMarkdown('*/*'), false, 'curl default: a tie must go to HTML');
    assert.equal(prefersMarkdown('text/*'), false, 'text wildcard is still a tie');
});

test('an explicit markdown request gets markdown', () => {
    assert.equal(prefersMarkdown('text/markdown'), true);
    assert.equal(prefersMarkdown('text/x-markdown'), true);
    assert.equal(prefersMarkdown('text/markdown, */*;q=0.1'), true);
    assert.equal(prefersMarkdown('text/markdown;q=1.0, text/html;q=0.8'), true);
    assert.equal(prefersMarkdown('TEXT/MARKDOWN'), true, 'media types are case insensitive');
    assert.equal(prefersMarkdown('  text/markdown  '), true, 'surrounding whitespace');
});

test('markdown loses when the client rates HTML at least as highly', () => {
    assert.equal(prefersMarkdown('text/html, text/markdown'), false, 'tie goes to HTML');
    assert.equal(prefersMarkdown('text/markdown;q=0.5, text/html'), false);
    assert.equal(prefersMarkdown('text/markdown;q=0'), false, 'q=0 means not acceptable');
});

test('specificity beats position', () => {
    // The wildcard comes second but must not raise markdown above its own 0.2
    assert.equal(acceptQuality('text/markdown;q=0.2, */*;q=0.9', 'text/markdown'), 0.2);
    // ... and an exact HTML match outranks the wildcard that follows it
    assert.equal(acceptQuality('text/html;q=0.3, */*;q=0.9', 'text/html'), 0.3);
});

test('quality values are parsed and clamped', () => {
    assert.equal(acceptQuality('text/markdown;q=0.75', 'text/markdown'), 0.75);
    assert.equal(acceptQuality('text/markdown;q=nonsense', 'text/markdown'), 1, 'unparseable q falls back to 1');
    assert.equal(acceptQuality('text/markdown;q=9', 'text/markdown'), 1, 'clamped to 1');
    assert.equal(acceptQuality('text/markdown;q=-1', 'text/markdown'), 0, 'clamped to 0');
    assert.equal(acceptQuality('text/markdown; q=0.4', 'text/markdown'), 0.4, 'space before the parameter');
    assert.equal(acceptQuality('application/json', 'text/markdown'), 0, 'unrelated type');
});

test('only page URLs have a markdown twin', () => {
    assert.equal(markdownPathFor('/'), '/index.md');
    assert.equal(markdownPathFor('/en/products/subc/'), '/en/products/subc/index.md');
    assert.equal(markdownPathFor('/videos/twin-peaks-theme-cover/video/'), '/videos/twin-peaks-theme-cover/video/index.md');

    // Anything without a trailing slash is not a page on this site
    assert.equal(markdownPathFor('/en/products/subc/index.md'), null, 'a twin has no twin of its own');
    assert.equal(markdownPathFor('/llms.txt'), null);
    assert.equal(markdownPathFor('/sitemap.xml'), null);
    assert.equal(markdownPathFor('/feed-en.rss'), null);
    assert.equal(markdownPathFor('/images/header_1260.jpg'), null);
    assert.equal(markdownPathFor('/en/products/subc'), null, 'Firebase redirects this to the slashed form first');
});
