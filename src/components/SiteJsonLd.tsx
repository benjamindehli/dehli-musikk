import JsonLd from 'components/JsonLd';
import { getLanguageSlug } from 'lib/i18n';
import type { Lang } from 'lib/pageMetadata';

const localBusinessDescriptions: Record<Lang, string> = {
    no: 'Dehli Musikk er et enkeltpersonsforetak i Bø i Telemark, drevet av Benjamin Dehli siden 2019, som tilbyr spilling av tangentinstrumenter på låter for artister og band.',
    en: 'Dehli Musikk is a local music business based in Bø i Telemark, Norway. Founded by Benjamin Dehli in 2019, it offers keyboard instrument tracks on recordings for artists and bands.'
};

/*
 * The one thing the business actually sells was described only in prose. Nothing
 * in the structured data said a service was on offer at all: the LocalBusiness
 * gave an address and a price range, the products cover the sample libraries, and
 * between them the keyboard session work went unstated.
 *
 * No price on the Offer. The work is quoted per song rather than sold at a set
 * rate, so any number here would be invented, and priceRange on the
 * LocalBusiness already gives the rough answer.
 */
const serviceNames: Record<Lang, string> = {
    no: 'Innspilling av tangentinstrumenter',
    en: 'Keyboard instrument recording'
};

const serviceDescriptions: Record<Lang, string> = {
    no: 'Spilling av tangentinstrumenter på låter for artister og band. Sporene spilles inn i Bø i Telemark og leveres som lydfiler.',
    en: 'Keyboard instrument tracks played on songs for artists and bands. The tracks are recorded in Bø i Telemark and delivered as audio files.'
};

const serviceTypes: Record<Lang, string> = {
    no: 'Musikkinnspilling',
    en: 'Music recording'
};

const getServiceOffer = (lang: Lang) => ({
    '@type': 'Offer',
    itemOffered: {
        '@type': 'Service',
        // Language independent, like the other @ids, with the localised address
        // in the channel's serviceUrl below
        '@id': 'https://www.dehlimusikk.no/#service',
        name: serviceNames[lang],
        description: serviceDescriptions[lang],
        serviceType: serviceTypes[lang],
        provider: { '@id': 'https://www.dehlimusikk.no/' },
        // Matches areaServed on the LocalBusiness rather than claiming wider
        // reach than the business itself states
        areaServed: {
            '@type': 'Country',
            name: 'Norway'
        },
        availableChannel: {
            '@type': 'ServiceChannel',
            // The contact section on the home page, which is also where
            // acquireLicensePage points
            serviceUrl: `https://www.dehlimusikk.no/${getLanguageSlug(lang)}#contact`,
            availableLanguage: [
                { '@type': 'Language', name: 'Norwegian', alternateName: 'no' },
                { '@type': 'Language', name: 'English', alternateName: 'en' }
            ]
        }
    }
});

const personDescriptions: Record<Lang, string> = {
    no: 'Benjamin Dehli er tangentspiller, komponist og produsent fra Norge. Gjennom musikkvirksomheten Dehli Musikk tilbyr han spilling av tangentinstrumenter på låter for artister og band.',
    en: 'Benjamin Dehli is a keyboard player, composer and producer from Norway. Benjamin offers keyboard instrument tracks on recordings for artists and bands through his music business Dehli Musikk.'
};

const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.dehlimusikk.no/',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bø i Telemark',
        postalCode: '3804',
        streetAddress: 'Margretes veg 15',
        addressCountry: { '@type': 'Country', name: 'NO' }
    },
    // elevation is in metres, per WGS 84, which is what a bare number means here
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 59.445747,
        longitude: 9.084364,
        elevation: 193.1
    },
    naics: '711130',
    // Without https://www.dehlimusikk.no/, which the Person's list below does
    // carry: sameAs points at other pages identifying the same thing, and this
    // node already owns that URL as both its @id and its url. On the Person,
    // a separate node, naming the site still says something.
    sameAs: [
        'https://store.dehlimusikk.no/',
        'https://www.facebook.com/DehliMusikk/',
        'https://x.com/BenjaminDehli',
        'https://www.instagram.com/benjamindehli/',
        'https://youtube.com/@BenjaminDehli',
        'https://www.youtube.com/@RMW8T7jZaH',
        'https://www.linkedin.com/in/benjamindehli/',
        'https://vimeo.com/benjamindehli',
        'https://flickr.com/photos/projectdehli/',
        'https://benjamindehli.tumblr.com/',
        'https://github.com/benjamindehli',
        'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f',
        'https://soundcloud.com/benjamin-dehli',
        'https://soundcloud.com/rmw8t7jzah',
        'https://ko-fi.com/benjamindehli',
        'https://credits.muso.ai/profile/39f5096c-b6bd-41d0-9248-d959da8c4b81',
        'https://credits.muso.ai/profile/120086b1-1215-4d5c-a61d-d992e0b2289e'
    ],
    // No openingHours: the work is booked rather than served over a counter, and
    // claiming Mo-Su 00:00-24:00 from a home address reads as inflated, which
    // risks the whole LocalBusiness node being discounted.
    priceRange: '$$',
    // The recordings are delivered as files, so the service is not limited to
    // the area around the address
    areaServed: {
        '@type': 'Country',
        name: 'Norway'
    },
    hasPos: {
        '@type': 'Place',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Bø i Telemark',
            postalCode: '3804',
            streetAddress: 'Margretes veg 15',
            addressCountry: { name: 'NO' }
        },
        hasMap: 'https://www.google.com/maps?cid=13331960642102658320'
    },
    // description is set per language by SiteJsonLd
    foundingDate: '2019-10-01',
    foundingLocation: {
        '@type': 'Place',
        address: {
            '@type': 'PostalAddress',
            addressLocality: 'Bø i Telemark',
            postalCode: '3804',
            streetAddress: 'Margretes veg 15',
            addressCountry: { name: 'NO' }
        },
        hasMap: 'https://www.google.com/maps?cid=13331960642102658320'
    },
    logo: {
        '@type': 'ImageObject',
        url: 'https://www.dehlimusikk.no/DehliMusikkLogo.png',
        contentUrl: 'https://www.dehlimusikk.no/DehliMusikkLogo.png',
        license: 'https://creativecommons.org/licenses/by/4.0/legalcode',
        acquireLicensePage: 'https://www.dehlimusikk.no/#contact',
        copyrightNotice: 'Benjamin Dehli',
        creditText: 'Dehli Musikk',
        creator: { '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f' }
    },
    image: {
        '@type': 'ImageObject',
        url: 'https://www.dehlimusikk.no/DehliMusikkLogo.png',
        contentUrl: 'https://www.dehlimusikk.no/DehliMusikkLogo.png',
        license: 'https://creativecommons.org/licenses/by/4.0/legalcode',
        acquireLicensePage: 'https://www.dehlimusikk.no/#contact',
        copyrightNotice: 'Benjamin Dehli',
        creditText: 'Dehli Musikk',
        creator: { '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f' }
    },
    email: 'superelg@gmail.com',
    founder: { '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f' },
    name: 'Dehli Musikk',
    telephone: '+47 92 29 27 19',
    url: 'https://www.dehlimusikk.no/'
};

const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': ['Person', 'MusicGroup'],
    '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f',
    name: 'Benjamin Dehli',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bø i Telemark',
        postalCode: '3804',
        streetAddress: 'Margretes veg 15',
        addressCountry: { name: 'NO' }
    },
    email: 'superelg@gmail.com',
    telephone: '+47 92 29 27 19',
    image: {
        '@type': 'ImageObject',
        url: 'https://www.dehlimusikk.no/benjamin-dehli.jpg',
        contentUrl: 'https://www.dehlimusikk.no/benjamin-dehli.jpg',
        license: 'https://creativecommons.org/licenses/by/4.0/legalcode',
        acquireLicensePage: 'https://www.dehlimusikk.no/#contact',
        copyrightNotice: 'Benjamin Dehli',
        creditText: 'Dehli Musikk',
        creator: { '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f' }
    },
    birthPlace: {
        '@type': 'City',
        name: 'Langesund',
        containedIn: {
            '@type': 'AdministrativeArea',
            containedIn: { name: 'Norway', '@type': 'Country' },
            name: 'Telemark'
        }
    },
    birthDate: '1989-09-11',
    naics: '711130',
    sameAs: [
        'https://www.dehlimusikk.no/',
        'https://store.dehlimusikk.no/',
        'https://www.facebook.com/DehliMusikk/',
        'https://x.com/BenjaminDehli',
        'https://www.instagram.com/benjamindehli/',
        'https://youtube.com/@BenjaminDehli',
        'https://www.youtube.com/@RMW8T7jZaH',
        'https://www.linkedin.com/in/benjamindehli/',
        'https://vimeo.com/benjamindehli',
        'https://flickr.com/photos/projectdehli/',
        'https://benjamindehli.tumblr.com/',
        'https://github.com/benjamindehli',
        'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f',
        'https://soundcloud.com/benjamin-dehli',
        'https://soundcloud.com/rmw8t7jzah',
        'https://ko-fi.com/benjamindehli',
        'https://credits.muso.ai/profile/39f5096c-b6bd-41d0-9248-d959da8c4b81',
        'https://credits.muso.ai/profile/120086b1-1215-4d5c-a61d-d992e0b2289e',
        'https://www.discogs.com/artist/6942564-Benjamin-Dehli'
    ],
    brand: { '@id': 'https://www.dehlimusikk.no/' },
    jobTitle: {
        '@context': 'https://schema.org/',
        '@type': 'DefinedTerm',
        termCode: '711130',
        name: 'Musical Groups and Artists',
        url: 'https://www.naics.com/naics-code-description/?code=711130',
        inDefinedTermSet: 'NAICS (North American Industry Classification System)'
    },
    worksFor: { '@id': 'https://www.dehlimusikk.no/' },
    // description is set per language by SiteJsonLd
    memberOf: [
        {
            '@type': 'OrganizationRole',
            memberOf: {
                '@type': 'MusicGroup',
                '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f',
                name: 'Benjamin Dehli'
            },
            roleName: ['Producer', 'Composer', 'Recording Engineer', 'Mixing Engineer', 'Mellotron', 'Organ', 'Piano', 'Electric Piano', 'Synthesizer', 'Keyboards', 'Vocoder', 'Glass'],
            startDate: '2020'
        },
        {
            '@type': 'OrganizationRole',
            memberOf: {
                '@type': 'MusicGroup',
                '@id': 'https://musicbrainz.org/artist/0fd2a19c-77dc-45ee-bc77-a7ad35ffa7f5',
                name: 'KAASIN'
            },
            roleName: ['Producer', 'Composer', 'Recording Engineer', 'Mixing Engineer', 'Mellotron', 'Organ', 'Piano', 'Electric Piano', 'Synthesizer', 'Keyboards', 'Glass'],
            startDate: '2020'
        },
        {
            '@type': 'OrganizationRole',
            memberOf: {
                name: "Set One's Cap",
                '@id': 'https://musicbrainz.org/artist/90418515-6b90-465a-bacc-699f3c9b7297',
                '@type': 'MusicGroup'
            },
            roleName: ['Organ', 'Piano', 'Electric Piano', 'Synthesizer', 'Vocoder', 'Keytar', 'Keyboards'],
            startDate: '2014'
        },
        {
            '@type': 'OrganizationRole',
            memberOf: {
                name: 'Confusion',
                '@id': 'https://www.dehlimusikk.no/#artist-confusion',
                '@type': 'MusicGroup'
            },
            roleName: ['Organ', 'Piano', 'Electric Piano', 'Synthesizer', 'Keyboards', 'Accordion'],
            startDate: '2011'
        }
    ]
};

const getWebsiteJsonLd = (lang: Lang) => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    // Distinct from the LocalBusiness, which owns https://www.dehlimusikk.no/
    '@id': 'https://www.dehlimusikk.no/#website',
    name: 'Dehli Musikk',
    url: 'https://www.dehlimusikk.no',
    inLanguage: ['no', 'en'],
    potentialAction: {
        '@type': 'SearchAction',
        target: `https://www.dehlimusikk.no/${getLanguageSlug(lang)}search/?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
    },
    author: { '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f' }
});

const SiteJsonLd = ({ lang }: { lang: Lang }) => (
    <>
        <JsonLd
            data={{
                ...localBusinessJsonLd,
                description: localBusinessDescriptions[lang],
                makesOffer: getServiceOffer(lang)
            }}
        />
        <JsonLd data={{ ...personJsonLd, description: personDescriptions[lang] }} />
        <JsonLd data={getWebsiteJsonLd(lang)} />
    </>
);

export default SiteJsonLd;
