import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import ListItemContent from 'components/template/List/ListItem/ListItemContent';
import ListItemContentHeader from 'components/template/List/ListItem/ListItemContent/ListItemContentHeader';
import ListItemThumbnail from 'components/template/List/ListItem/ListItemThumbnail';
import equipment from 'data/equipment';

const lang = 'en';
const languageSlug = 'en/';

export const metadata: Metadata = {
    title: 'Equipment | Dehli Musikk',
    description: 'Equipment I use during recording',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/en/equipment/',
        languages: {
            no: 'https://www.dehlimusikk.no/equipment/',
            en: 'https://www.dehlimusikk.no/en/equipment/',
            'x-default': 'https://www.dehlimusikk.no/equipment/'
        }
    },
    openGraph: {
        title: 'Equipment', url: 'https://www.dehlimusikk.no/en/equipment/',
        description: 'Equipment I use during recording', locale: 'en_US', alternateLocale: 'nb_NO'
    },
    twitter: { title: 'Equipment', description: 'Equipment I use during recording' }
};

export default function EquipmentPage() {
    const equipmentTypeItems = Object.keys(equipment).map((equipmentTypeKey, index) => ({
        '@type': 'ListItem',
        '@id': `https://www.dehlimusikk.no/equipment/${equipmentTypeKey}/`,
        name: equipment[equipmentTypeKey].name[lang],
        position: index + 1,
        url: `https://www.dehlimusikk.no/en/equipment/${equipmentTypeKey}/`
    }));
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        '@id': 'https://www.dehlimusikk.no/equipment/',
        name: 'Equipment used by Dehli Musikk',
        itemListElement: equipmentTypeItems
    };

    const breadcrumbs = [{ name: 'Equipment', path: '/en/equipment/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Equipment</h1>
                <p>Equipment I use during recording</p>
            </Container>
            <Container>
                <List>
                    {Object.keys(equipment).map((equipmentTypeKey) => {
                        const equipmentType = equipment[equipmentTypeKey];
                        const itemPath = `/en/equipment/${equipmentTypeKey}/`;
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
                                    <source sizes="175px" srcSet={`${image.jpg55} 55w, ${image.jpg350} 350w, ${image.jpg540} 540w, ${image.jpg945} 945w`} type="image/jpg" />
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
