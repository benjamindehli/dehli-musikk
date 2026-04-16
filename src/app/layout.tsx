import type { ReactNode } from 'react';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import 'style/styles.scss';

config.autoAddCss = false;

export const metadata = {
    metadataBase: new URL('https://www.dehlimusikk.no'),
    openGraph: {
        type: 'website',
        images: [
            {
                url: '/images/DehliMusikk-OpenGraph.jpg',
                width: 1200,
                height: 630
            }
        ],
        siteName: 'Dehli Musikk'
    },
    twitter: {
        card: 'summary',
        site: '@BenjaminDehli',
        creator: '@BenjaminDehli',
        images: '/images/DehliMusikk-OpenGraph.jpg'
    },
    other: {
        'fb:app_id': '525744544728800'
    }
};

export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
