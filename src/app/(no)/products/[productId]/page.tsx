import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import Product from 'components/partials/Product';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString } from 'helpers/contentFormatter';
import products from 'data/products';

const lang = 'no';
const languageSlug = '';

export function generateStaticParams() {
    return products.map((product) => ({
        productId: convertToUrlFriendlyString(product.title)
    }));
}

function getProduct(productId: string) {
    const index = products.findIndex(
        (p) => convertToUrlFriendlyString(p.title) === productId
    );
    if (index === -1) return null;
    return {
        ...products[index],
        previousProductId: index > 0 ? convertToUrlFriendlyString(products[index - 1].title) : null,
        nextProductId: index < products.length - 1 ? convertToUrlFriendlyString(products[index + 1].title) : null
    };
}

export async function generateMetadata({ params }: { params: { productId: string } }): Promise<Metadata> {
    const { productId } = params;
    const product = getProduct(productId);
    if (!product) return {};

    const title = `${product.title} - Produkter | Dehli Musikk`;
    const description = formatContentAsString(product.content[lang]);

    return {
        title, description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/products/${productId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/products/${productId}/`,
                en: `https://www.dehlimusikk.no/en/products/${productId}/`,
                'x-default': `https://www.dehlimusikk.no/products/${productId}/`
            }
        },
        openGraph: {
            title: product.title, url: `https://www.dehlimusikk.no/products/${productId}/`,
            description, locale: 'no_NO', alternateLocale: 'en_US'
        },
        twitter: { title: product.title, description }
    };
}

export default function ProductDetailPage({ params }: { params: { productId: string } }) {
    const { productId } = params;
    const product = getProduct(productId);

    if (!product) notFound();

    const breadcrumbs = [
        { name: 'Produkter', path: '/products/' },
        { name: product.title, path: `/products/${productId}/` }
    ];

    return (
        <>
            <Container blur>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Modal
                listPath={`/${languageSlug}products/`}
                arrowLeftLink={product.previousProductId ? `/${languageSlug}products/${product.previousProductId}/` : null}
                arrowRightLink={product.nextProductId ? `/${languageSlug}products/${product.nextProductId}/` : null}
                maxWidth="540px"
                lang={lang}
            >
                <Product product={product} fullscreen={true} lang={lang} languageSlug={languageSlug} />
            </Modal>
            <Container blur>
                <h2 data-size="h1">Produkter</h2>
                <p>Produkter fra Dehli Musikk</p>
            </Container>
            <Container blur>
                <List>
                    {products.map((p) => {
                        const pId = convertToUrlFriendlyString(p.title);
                        return (
                            <ListItem key={pId}>
                                <Product product={p} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}
