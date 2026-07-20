import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import Modal from 'components/template/Modal';
import EquipmentItem from 'components/partials/EquipmentItem';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, ogLocale, WEBSITE_URL, type Lang } from 'lib/pageMetadata';
import equipment from 'data/equipment';

const translations = {
    no: {
        metaTitle: 'Utstyr | Dehli Musikk',
        pageTitle: 'Utstyr',
        description: 'Utstyr jeg bruker under innspilling',
        listName: 'Utstyr brukt av Dehli Musikk',
        typeDescription: (typeName: string) => `${typeName} jeg bruker under innspilling`
    },
    en: {
        metaTitle: 'Equipment | Dehli Musikk',
        pageTitle: 'Equipment',
        description: 'Equipment I use during recording',
        listName: 'Equipment used by Dehli Musikk',
        typeDescription: (typeName: string) => `${typeName} I use during recording`
    }
} as const;

const VALID_EQUIPMENT_TYPES = ['instruments', 'effects', 'amplifiers'];

type EquipmentTypeRouteProps = { params: Promise<{ equipmentType: string }> };
type EquipmentItemRouteProps = { params: Promise<{ equipmentType: string; equipmentId: string }> };

export function getEquipmentPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: 'equipment/', en: 'equipment/' }),
        openGraph: {
            title: t.pageTitle, url: `${WEBSITE_URL}/${languageSlug}equipment/`,
            description: t.description, ...ogLocale(lang)
        },
        twitter: { title: t.pageTitle, description: t.description }
    };
}

export function EquipmentPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const equipmentTypeItems = Object.keys(equipment).map((equipmentTypeKey, index) => ({
        '@type': 'ListItem',
        '@id': `${WEBSITE_URL}/equipment/${equipmentTypeKey}/`,
        name: equipment[equipmentTypeKey].name[lang],
        position: index + 1,
        url: `${WEBSITE_URL}/${languageSlug}equipment/${equipmentTypeKey}/`
    }));
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${WEBSITE_URL}/equipment/`,
        name: t.listName,
        itemListElement: equipmentTypeItems
    };

    const breadcrumbs = [{ name: t.pageTitle, path: `/${languageSlug}equipment/` }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{t.pageTitle}</h1>
                <p>{t.description}</p>
            </Container>
            <Container>
                <List>
                    {Object.keys(equipment).map((equipmentTypeKey) => {
                        const equipmentType = equipment[equipmentTypeKey];
                        const itemPath = `/${languageSlug}equipment/${equipmentTypeKey}/`;
                        const link = { to: itemPath, title: equipmentType.name[lang] };
                        const image = {
                            avif55: `/data/equipment/web/avif/${equipmentTypeKey}_55.avif`,
                            avif350: `/data/equipment/web/avif/${equipmentTypeKey}_350.avif`,
                            avif540: `/data/equipment/web/avif/${equipmentTypeKey}_540.avif`,
                            avif945: `/data/equipment/web/avif/${equipmentTypeKey}_945.avif`,
                            webp55: `/data/equipment/web/webp/${equipmentTypeKey}_55.webp`,
                            webp350: `/data/equipment/web/webp/${equipmentTypeKey}_350.webp`,
                            webp540: `/data/equipment/web/webp/${equipmentTypeKey}_540.webp`,
                            webp945: `/data/equipment/web/webp/${equipmentTypeKey}_945.webp`,
                            jpg55: `/data/equipment/web/jpg/${equipmentTypeKey}_55.jpg`,
                            jpg350: `/data/equipment/web/jpg/${equipmentTypeKey}_350.jpg`,
                            jpg540: `/data/equipment/web/jpg/${equipmentTypeKey}_540.jpg`,
                            jpg945: `/data/equipment/web/jpg/${equipmentTypeKey}_945.jpg`
                        };
                        return (
                            <ListItem key={equipmentTypeKey}>
                                <ListItemThumbnail link={link}>
                                    <source sizes="175px" srcSet={`${image.avif55} 55w, ${image.avif350} 350w, ${image.avif540} 540w, ${image.avif945} 945w`} type="image/avif" />
                                    <source sizes="175px" srcSet={`${image.webp55} 55w, ${image.webp350} 350w, ${image.webp540} 540w, ${image.webp945} 945w`} type="image/webp" />
                                    <source sizes="175px" srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`} type="image/jpeg" />
                                    <img loading="lazy" width="350" height="260" src={image.jpg350} alt={equipmentType.name[lang]} />
                                </ListItemThumbnail>
                                <ListItemContent>
                                    <ListItemContentHeader link={link}>
                                        <h2>{equipmentType.name[lang]}</h2>
                                    </ListItemContentHeader>
                                </ListItemContent>
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}

export function getEquipmentTypeStaticParams() {
    return VALID_EQUIPMENT_TYPES.map((equipmentType) => ({ equipmentType }));
}

export async function getEquipmentTypeMetadata(lang: Lang, { params }: EquipmentTypeRouteProps): Promise<Metadata> {
    const { equipmentType } = await params;
    const equipmentTypeData = equipment[equipmentType];
    if (!equipmentTypeData) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const typeName = equipmentTypeData.name[lang];
    const title = `${typeName} - ${t.metaTitle}`;
    const description = t.typeDescription(typeName);

    return {
        title, description,
        alternates: buildAlternates(lang, {
            no: `equipment/${equipmentType}/`,
            en: `equipment/${equipmentType}/`
        }),
        openGraph: {
            title: typeName, url: `${WEBSITE_URL}/${languageSlug}equipment/${equipmentType}/`,
            description, ...ogLocale(lang)
        },
        twitter: { title: typeName, description }
    };
}

export async function EquipmentTypePage({ lang, params }: { lang: Lang } & EquipmentTypeRouteProps) {
    const { equipmentType } = await params;
    const equipmentTypeData = equipment[equipmentType];

    if (!equipmentTypeData) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const typeName = equipmentTypeData.name[lang];
    const description = t.typeDescription(typeName);

    const equipmentItems = equipmentTypeData.items.map((item, index) => {
        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
        return {
            '@type': 'ListItem',
            '@id': `${WEBSITE_URL}/equipment/${equipmentType}/${itemId}/`,
            name: `${item.brand} ${item.model}`,
            position: index + 1,
            url: `${WEBSITE_URL}/${languageSlug}equipment/${equipmentType}/${itemId}/`
        };
    });
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': `${WEBSITE_URL}/equipment/${equipmentType}/`,
        name: typeName,
        itemListElement: equipmentItems
    };

    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}equipment/` },
        { name: typeName, path: `/${languageSlug}equipment/${equipmentType}/` }
    ];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{typeName}</h1>
                <p>{description}</p>
            </Container>
            <Container>
                <List>
                    {equipmentTypeData.items.map((item) => {
                        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
                        return (
                            <ListItem key={itemId}>
                                <EquipmentItem item={item} itemId={itemId} itemType={equipmentType} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}

export function getEquipmentItemStaticParams() {
    return VALID_EQUIPMENT_TYPES.flatMap((equipmentType) =>
        equipment[equipmentType].items.map((item) => ({
            equipmentType,
            equipmentId: convertToUrlFriendlyString(`${item.brand} ${item.model}`)
        }))
    );
}

function getEquipmentItem(equipmentType: string, equipmentId: string) {
    const typeData = equipment[equipmentType];
    if (!typeData) return null;
    const index = typeData.items.findIndex(
        (item) => convertToUrlFriendlyString(`${item.brand} ${item.model}`) === equipmentId
    );
    if (index === -1) return null;
    const item = typeData.items[index];
    return {
        ...item,
        previousEquipmentItemId: index > 0
            ? convertToUrlFriendlyString(`${typeData.items[index - 1].brand} ${typeData.items[index - 1].model}`)
            : null,
        nextEquipmentItemId: index < typeData.items.length - 1
            ? convertToUrlFriendlyString(`${typeData.items[index + 1].brand} ${typeData.items[index + 1].model}`)
            : null
    };
}

export async function getEquipmentItemMetadata(lang: Lang, { params }: EquipmentItemRouteProps): Promise<Metadata> {
    const { equipmentType, equipmentId } = await params;
    const equipmentTypeData = equipment[equipmentType];
    if (!equipmentTypeData) return {};
    const item = getEquipmentItem(equipmentType, equipmentId);
    if (!item) return {};

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const itemName = `${item.brand} ${item.model}`;
    const typeName = equipmentTypeData.name[lang];
    const title = `${itemName} - ${typeName} - ${t.metaTitle}`;

    return {
        title, description: itemName,
        alternates: buildAlternates(lang, {
            no: `equipment/${equipmentType}/${equipmentId}/`,
            en: `equipment/${equipmentType}/${equipmentId}/`
        }),
        openGraph: {
            title: itemName, url: `${WEBSITE_URL}/${languageSlug}equipment/${equipmentType}/${equipmentId}/`,
            description: itemName, ...ogLocale(lang),
            images: [{ url: `${WEBSITE_URL}/data/equipment/${equipmentType}/web/jpg/${equipmentId}_945.jpg`, width: 945, height: 700 }]
        },
        twitter: { title: itemName, description: itemName, images: [`${WEBSITE_URL}/data/equipment/${equipmentType}/web/jpg/${equipmentId}_945.jpg`] }
    };
}

export async function EquipmentItemPage({ lang, params }: { lang: Lang } & EquipmentItemRouteProps) {
    const { equipmentType, equipmentId } = await params;
    const equipmentTypeData = equipment[equipmentType];

    if (!equipmentTypeData) notFound();

    const item = getEquipmentItem(equipmentType, equipmentId);
    if (!item) notFound();

    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const itemName = `${item.brand} ${item.model}`;
    const typeName = equipmentTypeData.name[lang];

    const breadcrumbs = [
        { name: t.pageTitle, path: `/${languageSlug}equipment/` },
        { name: typeName, path: `/${languageSlug}equipment/${equipmentType}/` },
        { name: itemName, path: `/${languageSlug}equipment/${equipmentType}/${equipmentId}/` }
    ];

    return (
        <>
            <Container blur>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
            </Container>
            <Modal
                listPath={`/${languageSlug}equipment/${equipmentType}/`}
                arrowLeftLink={item.previousEquipmentItemId ? `/${languageSlug}equipment/${equipmentType}/${item.previousEquipmentItemId}/` : null}
                arrowRightLink={item.nextEquipmentItemId ? `/${languageSlug}equipment/${equipmentType}/${item.nextEquipmentItemId}/` : null}
                maxWidth="945px"
                lang={lang}
            >
                <EquipmentItem item={item} itemId={equipmentId} itemType={equipmentType} fullscreen={true} lang={lang} languageSlug={languageSlug} />
            </Modal>
            <Container blur>
                <h2 data-size="h1">{typeName}</h2>
                <p>{t.typeDescription(typeName)}</p>
            </Container>
            <Container blur>
                <List>
                    {equipmentTypeData.items.map((e) => {
                        const eId = convertToUrlFriendlyString(`${e.brand} ${e.model}`);
                        return (
                            <ListItem key={eId}>
                                <EquipmentItem item={e} itemId={eId} itemType={equipmentType} lang={lang} languageSlug={languageSlug} />
                            </ListItem>
                        );
                    })}
                </List>
            </Container>
        </>
    );
}
