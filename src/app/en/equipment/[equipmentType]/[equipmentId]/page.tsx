import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import Modal from 'components/template/Modal';
import EquipmentItem from 'components/partials/EquipmentItem';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import equipment from 'data/equipment';

const lang = 'en';
const languageSlug = 'en/';
const VALID_EQUIPMENT_TYPES = ['instruments', 'effects', 'amplifiers'];

export function generateStaticParams() {
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

export async function generateMetadata({ params }: { params: Promise<{ equipmentType: string; equipmentId: string }> }): Promise<Metadata> {
    const { equipmentType, equipmentId } = await params;
    const equipmentTypeData = equipment[equipmentType];
    if (!equipmentTypeData) return {};
    const item = getEquipmentItem(equipmentType, equipmentId);
    if (!item) return {};

    const itemName = `${item.brand} ${item.model}`;
    const typeName = equipmentTypeData.name[lang];
    const title = `${itemName} - ${typeName} - Equipment | Dehli Musikk`;

    return {
        title, description: itemName,
        alternates: {
            canonical: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/${equipmentId}/`,
            languages: {
                no: `https://www.dehlimusikk.no/equipment/${equipmentType}/${equipmentId}/`,
                en: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/${equipmentId}/`,
                'x-default': `https://www.dehlimusikk.no/equipment/${equipmentType}/${equipmentId}/`
            }
        },
        openGraph: {
            title: itemName, url: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/${equipmentId}/`,
            description: itemName, locale: 'en_US', alternateLocale: 'nb_NO',
            images: [{ url: `https://www.dehlimusikk.no/data/equipment/${equipmentType}/web/jpg/${equipmentId}_945.jpg`, width: 945, height: 700 }]
        },
        twitter: { title: itemName, description: itemName, images: [`https://www.dehlimusikk.no/data/equipment/${equipmentType}/web/jpg/${equipmentId}_945.jpg`] }
    };
}

export default async function EquipmentItemPage({ params }: { params: Promise<{ equipmentType: string; equipmentId: string }> }) {
    const { equipmentType, equipmentId } = await params;
    const equipmentTypeData = equipment[equipmentType];

    if (!equipmentTypeData) notFound();

    const item = getEquipmentItem(equipmentType, equipmentId);
    if (!item) notFound();

    const itemName = `${item.brand} ${item.model}`;
    const typeName = equipmentTypeData.name[lang];

    const breadcrumbs = [
        { name: 'Equipment', path: '/en/equipment/' },
        { name: typeName, path: `/en/equipment/${equipmentType}/` },
        { name: itemName, path: `/en/equipment/${equipmentType}/${equipmentId}/` }
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
                <p>{typeName} I use during recording</p>
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
