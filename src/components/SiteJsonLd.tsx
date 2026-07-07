const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://www.dehlimusikk.no/',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bø i Telemark',
        postalCode: '3804',
        streetAddress: 'Margretes veg 15',
        addressCountry: { name: 'NO' }
    },
    naics: '711130',
    sameAs: [
        'https://www.dehlimusikk.no/',
        'https://store.dehlimusikk.no/',
        'https://www.facebook.com/DehliMusikk/',
        'https://x.com/BenjaminDehli',
        'https://www.instagram.com/benjamindehli/',
        'https://youtube.com/@BenjaminDehli',
        'https://www.linkedin.com/in/benjamindehli/',
        'https://vimeo.com/benjamindehli',
        'https://flickr.com/photos/projectdehli/',
        'https://benjamindehli.tumblr.com/',
        'https://github.com/benjamindehli',
        'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f',
        'https://soundcloud.com/benjamin-dehli',
        'https://ko-fi.com/benjamindehli',
        'https://credits.muso.ai/profile/39f5096c-b6bd-41d0-9248-d959da8c4b81',
        'https://credits.muso.ai/profile/120086b1-1215-4d5c-a61d-d992e0b2289e'
    ],
    openingHours: ['Mo-Su 00:00-24:00'],
    priceRange: '$$',
    review: [
        {
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
            author: { '@type': 'Person', name: 'Ole Riege' }
        },
        {
            '@type': 'Review',
            reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
            author: { '@type': 'Person', name: 'tommy moen' }
        }
    ],
    aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: 10,
        bestRating: 10,
        ratingCount: 2
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
    description: 'Dehli Musikk is a local music business based in Bø i Telemark, Norway. Founded by Benjamin Dehli in 2019, it offers keyboard instrument tracks on recordings for artists and bands.',
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
        'https://www.linkedin.com/in/benjamindehli/',
        'https://vimeo.com/benjamindehli',
        'https://flickr.com/photos/projectdehli/',
        'https://benjamindehli.tumblr.com/',
        'https://github.com/benjamindehli',
        'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f',
        'https://soundcloud.com/benjamin-dehli',
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
    description: 'Benjamin Dehli is a keyboard player, composer and producer from Norway. Benjamin offers keyboard instrument tracks on recordings for artists and bands through his music business Dehli Musikk.',
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

const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Dehli Musikk',
    url: 'https://www.dehlimusikk.no',
    potentialAction: {
        '@type': 'SearchAction',
        target: 'https://www.dehlimusikk.no/search/?q={search_term_string}',
        'query-input': 'required name=search_term_string'
    },
    author: { '@id': 'https://musicbrainz.org/artist/56639e59-2bb5-40bd-9d5a-97d964298b6f' }
};

const SiteJsonLd = () => (
    <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
    </>
);

export default SiteJsonLd;
