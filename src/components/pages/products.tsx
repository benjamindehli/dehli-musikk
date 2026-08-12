import JsonLd from 'components/JsonLd';
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
import { generateProductSnippet } from 'helpers/richSnippetsGenerators';
import { BACKDROP_LIST_ITEM_LIMIT } from 'lib/constants';
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, ogLocale, WEBSITE_URL, type Lang } from 'lib/pageMetadata';
import products from 'data/products';

const translations = {
    no: {
        metaTitle: 'Produkter | Dehli Musikk',
        pageTitle: 'Produkter',
        description: 'Produkter fra Dehli Musikk',
        listName: 'Produkter fra Dehli Musikk'
    },
    en: {
        metaTitle: 'Products | Dehli Musikk',
        pageTitle: 'Products',
        description: 'Products from Dehli Musikk',
        listName: 'Products by Dehli Musikk'
    }
} as const;

type ProductRouteProps = { params: Promise<{ productId: string }> };

export function getProductsPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: 'products/', en: 'products/' }),
        openGraph: {
            title: t.pageTitle, url: `${WEBSITE_URL}/${languageSlug}products/`,
            description: t.description, ...ogLocale(lang)
        },
        twitter: { title: t.pageTitle, description: t.description }
    };
}

export function ProductsPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const productItems = products.map((product, index) => ({
        '@type': 'ListItem',
        name: product.title,
        position: index + 1,
        item: generateProductSnippet(product, languageSlug, lang)
    }));
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${WEBSITE_URL}/products/`,
        name: t.listName,
        itemListElement: productItems
    };

    const breadcrumbs = [{ name: t.pageTitle, path: `/${languageSlug}products/` }];

    return (
        <>
            <JsonLd data={jsonLd} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{t.pageTitle}</h1>
                <p>{t.description}</p>
            </Container>
            <Container>
                <List>
                    {products.map((product, index) => {
                        const productId = convertToUrlFriendlyString(product.title);
                        return (
                            <ListItem key={productId}>
                                <Product product={product} priority={index === 0} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}

export function getProductStaticParams() {
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

export async function getProductDetailsMetadata(lang: Lang, { params }: ProductRouteProps): Promise<Metadata> {
    const { productId } = await params;
    const product = getProduct(productId);
    if (!product) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const title = `${product.title} - ${t.metaTitle}`;
    const description = formatContentAsString(product.content[lang]);

    return {
        title, description,
        alternates: buildAlternates(lang, {
            no: `products/${productId}/`,
            en: `products/${productId}/`
        }),
        openGraph: {
            title: product.title, url: `${WEBSITE_URL}/${languageSlug}products/${productId}/`,
            description, ...ogLocale(lang),
            images: [{ url: `${WEBSITE_URL}/data/products/web/jpg/${productId}_540.jpg`, width: 540, height: 400 }]
        },
        twitter: { title: product.title, description, images: [`${WEBSITE_URL}/data/products/web/jpg/${productId}_540.jpg`] }
    };
}

export async function ProductDetailsPage({ lang, params }: { lang: Lang } & ProductRouteProps) {
    const { productId } = await params;
    const product = getProduct(productId);

    if (!product) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}products/` },
        { name: product.title, path: `/${languageSlug}products/${productId}/` }
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
                <h2 data-size="h1">{t.pageTitle}</h2>
                <p>{t.description}</p>
            </Container>
            <Container blur>
                <List>
                    {products.slice(0, BACKDROP_LIST_ITEM_LIMIT).map((p) => {
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
