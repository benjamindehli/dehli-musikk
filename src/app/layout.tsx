import type { ReactNode } from 'react';
import type { Viewport } from 'next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'style/styles.scss';

config.autoAddCss = false;

/*
 * No openGraph or twitter here. Next.js resolves those two by replacing the
 * parent's object rather than merging into it, so any default set at this level
 * is discarded by every page that declares its own, which is all of them. The
 * sitewide defaults live in socialMetadata() in lib/pageMetadata instead.
 *
 * The fields below are safe here because no page sets them, so nothing
 * overwrites them.
 */
export const metadata = {
    metadataBase: new URL('https://www.dehlimusikk.no'),
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
        ],
        // iOS ignores the manifest icons and looks for this one
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }]
    },
    other: {
        'fb:app_id': '525744544728800'
    }
};

/*
 * Only themeColor is set: mergeViewport copies the keys a viewport export
 * actually declares over Next's defaults, so width=device-width and
 * initial-scale=1 still come from those and do not need restating.
 *
 * The value matches theme_color in public/manifest.json, which is what the
 * browser falls back to once the site is installed.
 */
export const viewport: Viewport = {
    themeColor: '#C32A22'
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
