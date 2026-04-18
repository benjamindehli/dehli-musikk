import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Product from 'components/partials/Product';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { generateProductSnippet } from 'helpers/richSnippetsGenerators';
import products from 'data/products';

const lang = 'en';
const languageSlug = 'en/';

export const metadata: Metadata = {
    title: 'Products | Dehli Musikk',
    description: 'Products from Dehli Musikk',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/en/products/',
        languages: {
            no: 'https://www.dehlimusikk.no/products/',
            en: 'https://www.dehlimusikk.no/en/products/',
            'x-default': 'https://www.dehlimusikk.no/products/'
        }
    },
    openGraph: {
        title: 'Products', url: 'https://www.dehlimusikk.no/en/products/',
        description: 'Products from Dehli Musikk', locale: 'en_US', alternateLocale: 'nb_NO'
    },
    twitter: { title: 'Products', description: 'Products from Dehli Musikk' }
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
        name: 'Products by Dehli Musikk',
        itemListElement: productItems
    };

    const breadcrumbs = [{ name: 'Products', path: '/en/products/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Products</h1>
                <p>Products from Dehli Musikk</p>
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
