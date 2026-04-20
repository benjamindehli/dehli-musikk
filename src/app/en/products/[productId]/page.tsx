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

const lang = 'en';
const languageSlug = 'en/';

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

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
    const { productId } = await params;
    const product = getProduct(productId);
    if (!product) return {};

    const title = `${product.title} - Products | Dehli Musikk`;
    const description = formatContentAsString(product.content[lang]);

    return {
        title, description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/en/products/${productId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/products/${productId}/`,
                en: `https://www.dehlimusikk.no/en/products/${productId}/`,
                'x-default': `https://www.dehlimusikk.no/products/${productId}/`
            }
        },
        openGraph: {
            title: product.title, url: `https://www.dehlimusikk.no/en/products/${productId}/`,
            description, locale: 'en_US', alternateLocale: 'nb_NO',
            images: [{ url: `https://www.dehlimusikk.no/data/products/web/jpg/${productId}_540.jpg`, width: 540, height: 400 }]
        },
        twitter: { title: product.title, description, images: [`https://www.dehlimusikk.no/data/products/web/jpg/${productId}_540.jpg`] }
    };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
    const { productId } = await params;
    const product = getProduct(productId);

    if (!product) notFound();

    const breadcrumbs = [
        { name: 'Products', path: '/en/products/' },
        { name: product.title, path: `/en/products/${productId}/` }
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
                <h2 data-size="h1">Products</h2>
                <p>Products from Dehli Musikk</p>
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
