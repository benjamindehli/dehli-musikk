import type { ReactNode } from 'react';
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
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
        ]
    },
    other: {
        'fb:app_id': '525744544728800'
    }
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
