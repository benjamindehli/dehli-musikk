import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Product from 'components/partials/Product';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { generateProductSnippet } from 'helpers/richSnippetsGenerators';
import products from 'data/products';

const lang = 'no';
const languageSlug = '';

export const metadata: Metadata = {
    title: 'Produkter | Dehli Musikk',
    description: 'Produkter fra Dehli Musikk',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/products/',
        languages: {
            no: 'https://www.dehlimusikk.no/products/',
            en: 'https://www.dehlimusikk.no/en/products/',
            'x-default': 'https://www.dehlimusikk.no/products/'
        }
    },
    openGraph: {
        title: 'Produkter', url: 'https://www.dehlimusikk.no/products/',
        description: 'Produkter fra Dehli Musikk', locale: 'no_NO', alternateLocale: 'en_US'
    },
    twitter: { title: 'Produkter', description: 'Produkter fra Dehli Musikk' }
};

export default function ProductsPage() {
    const productItems = products.map((product, index) => ({
        '@type': 'ListItem',
        '@id': product.link.url,
        name: product.title,
        position: index + 1,
        item: generateProductSnippet(product, languageSlug, lang)
    }));
    const jsonLd = {
        '@context': 'http://schema.org',
        '@type': 'ItemList',
        '@id': 'https://www.dehlimusikk.no/products/',
        name: 'Produkter fra Dehli Musikk',
        itemListElement: productItems
    };

    const breadcrumbs = [{ name: 'Produkter', path: '/products/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Produkter</h1>
                <p>Produkter fra Dehli Musikk</p>
            </Container>
            <Container>
                <List>
                    {products.map((product) => {
                        const productId = convertToUrlFriendlyString(product.title);
                        return (
                            <ListItem key={productId}>
                                <Product product={product} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}
