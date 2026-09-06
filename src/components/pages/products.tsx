import JsonLd from "components/JsonLd";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumbs from "components/partials/Breadcrumbs";
import Container from "components/template/Container";
import List from "components/template/List";
import ListItem from "components/template/List/ListItem";
import Modal from "components/template/Modal";
import Product from "components/partials/Product";
import { convertToUrlFriendlyString } from "helpers/urlFormatter";
import { getPrettyDate } from "helpers/dateFormatter";
import { formatContentAsString } from "helpers/contentFormatter";
import { generateProductSnippet } from "helpers/richSnippetsGenerators";
import { BACKDROP_LIST_ITEM_LIMIT } from "lib/constants";
import { getLanguageSlug } from "lib/i18n";
import { buildAlternates, socialMetadata, WEBSITE_URL, metaDescription, detailTitle, type Lang } from "lib/pageMetadata";
import products from "data/products";

const translations = {
    no: {
        metaTitle: "Produkter | Dehli Musikk",
        pageTitle: "Produkter",
        description: "Produkter fra Dehli Musikk",
        listMetaDescription:
            "Virtuelle instrumenter og patch-bibliotek fra Dehli Musikk: samplede tangentinstrumenter og trommemaskiner for Decent Sampler, plugins og editorer.",
        listName: "Produkter fra Dehli Musikk",
        descriptionFallback: (title: string, excerpt: string, date: string) => `${title}. ${excerpt} Produkt fra Dehli Musikk, publisert ${date}.`
    },
    en: {
        metaTitle: "Products | Dehli Musikk",
        pageTitle: "Products",
        description: "Products from Dehli Musikk",
        listMetaDescription:
            "Virtual instruments and patch libraries from Dehli Musikk: sampled keyboards and drum machines for Decent Sampler, plus plugins and editor software.",
        listName: "Products by Dehli Musikk",
        descriptionFallback: (title: string, excerpt: string, date: string) => `${title}. ${excerpt} A product from Dehli Musikk, published ${date}.`
    }
} as const;

type ProductRouteProps = { params: Promise<{ productId: string }> };

export function getProductsPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    // Longer than the paragraph the page opens with: that one sits under a
    // heading that has already said "Products", a search snippet stands alone
    const description = t.listMetaDescription;
    return {
        title: t.metaTitle,
        description,
        alternates: buildAlternates(lang, { no: "products/", en: "products/" }),
        ...socialMetadata(lang, {
            title: t.pageTitle,
            url: `${WEBSITE_URL}/${languageSlug}products/`,
            description
        })
    };
}

export function ProductsPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const productItems = products.map((product, index) => ({
        "@type": "ListItem",
        name: product.title,
        position: index + 1,
        item: generateProductSnippet(product, languageSlug, lang)
    }));
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "@id": `${WEBSITE_URL}/products/`,
        name: t.listName,
        numberOfItems: productItems.length,
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
    const index = products.findIndex((p) => convertToUrlFriendlyString(p.title) === productId);
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
    const title = detailTitle(product.title);
    /*
     * Truncated: this feeds meta, og and twitter descriptions, all shown at about
     * 155 characters. generateProductSnippet keeps the full text for JSON-LD.
     */
    const excerpt = formatContentAsString(product.content[lang]);
    const description = metaDescription(excerpt, t.descriptionFallback(product.title, excerpt, getPrettyDate(new Date(product.timestamp), lang)));

    return {
        title,
        description,
        alternates: buildAlternates(lang, {
            no: `products/${productId}/`,
            en: `products/${productId}/`
        }),
        ...socialMetadata(lang, {
            title: product.title,
            url: `${WEBSITE_URL}/${languageSlug}products/${productId}/`,
            description,
            images: [{ url: `${WEBSITE_URL}/data/products/web/jpg/${productId}_540.jpg`, width: 540, height: 400 }]
        })
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
