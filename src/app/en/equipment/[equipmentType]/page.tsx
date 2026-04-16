import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import EquipmentItem from 'components/partials/EquipmentItem';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import equipment from 'data/equipment';

const lang = 'en';
const languageSlug = 'en/';
const VALID_EQUIPMENT_TYPES = ['instruments', 'effects', 'amplifiers'];

export function generateStaticParams() {
    return VALID_EQUIPMENT_TYPES.map((equipmentType) => ({ equipmentType }));
}

export async function generateMetadata({ params }: { params: { equipmentType: string } }): Promise<Metadata> {
    const { equipmentType } = params;
    const equipmentTypeData = equipment[equipmentType];
    if (!equipmentTypeData) return {};

    const typeName = equipmentTypeData.name[lang];
    const title = `${typeName} - Equipment | Dehli Musikk`;
    const description = `${typeName} I use during recording`;

    return {
        title, description,
        alternates: {
            canonical: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/`,
            languages: {
                no: `https://www.dehlimusikk.no/equipment/${equipmentType}/`,
                en: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/`,
                'x-default': `https://www.dehlimusikk.no/equipment/${equipmentType}/`
            }
        },
        openGraph: {
            title: typeName, url: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/`,
            description, locale: 'en_US', alternateLocale: 'nb_NO'
        },
        twitter: { title: typeName, description }
    };
}

export default function EquipmentTypePage({ params }: { params: { equipmentType: string } }) {
    const { equipmentType } = params;
    const equipmentTypeData = equipment[equipmentType];

    if (!equipmentTypeData) notFound();

    const typeName = equipmentTypeData.name[lang];
    const description = `${typeName} I use during recording`;

    const equipmentItems = equipmentTypeData.items.map((item, index) => {
        const itemId = convertToUrlFriendlyString(`${item.brand} ${item.model}`);
        return {
            '@type': 'ListItem',
            '@id': `https://www.dehlimusikk.no/equipment/${equipmentType}/${itemId}/`,
            name: `${item.brand} ${item.model}`,
            position: index + 1,
            url: `https://www.dehlimusikk.no/en/equipment/${equipmentType}/${itemId}/`
        };
    });
    const jsonLd = {
        '@context': 'http://schema.org',
        '@type': 'ItemList',
        '@id': `https://www.dehlimusikk.no/equipment/${equipmentType}/`,
        name: typeName,
        itemListElement: equipmentItems
    };

    const breadcrumbs = [
        { name: 'Equipment', path: '/en/equipment/' },
        { name: typeName, path: `/en/equipment/${equipmentType}/` }
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
