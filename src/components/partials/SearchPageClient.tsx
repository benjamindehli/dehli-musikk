'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import List from 'components/template/List';
import ListItem from 'components/template/List/ListItem';
import SearchResult from 'components/partials/SearchResult';
import { getSearchResults } from 'helpers/search';
import { useLang } from 'lib/LangContext';
import style from 'components/routes/Search.module.scss';

const searchCategoryNames: Record<string, { en: string; no: string }> = {
    all: { en: 'Show all', no: 'Vis alle' },
    release: { en: 'Releases', no: 'Utgivelser' },
    post: { en: 'Posts', no: 'Innlegg' },
    video: { en: 'Videos', no: 'Videoer' },
    product: { en: 'Products', no: 'Produkter' },
    instruments: { en: 'Instruments', no: 'Instrumenter' },
    effects: { en: 'Effects', no: 'Effekter' },
    amplifiers: { en: 'Amplifiers', no: 'Forsterkere' },
    faq: { en: 'Frequently Asked Questions', no: 'Ofte stilte spørsmål' }
};

function SearchContent() {
    const { lang, languageSlug } = useLang();
    const router = useRouter();
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q') || null;
    const searchCategory = searchParams.get('category') || 'all';

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchResultsCount, setSearchResultsCount] = useState<Record<string, number>>({});

    const hasSearchResultsCount = Object.keys(searchResultsCount).length > 0;

    useEffect(() => {
        if (!searchQuery || searchQuery.trim().length < 2) {
            router.replace(`/${languageSlug}`);
            return;
        }
        getSearchResults(searchQuery, lang, searchCategory).then((results) => {
            const sorted = results || [];
            setSearchResults(sorted);
            if (searchCategory === 'all') {
                const counts: Record<string, number> = { all: sorted.length };
                sorted.forEach((r: any) => {
                    counts[r.type] = (counts[r.type] || 0) + 1;
                });
                setSearchResultsCount(counts);
            }
        });
    }, [searchQuery, lang, searchCategory, languageSlug, router]);

    const handleSearchCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const value = event.target.value;
        const urlParameters = value !== 'all' ? `?q=${searchQuery}&category=${value}` : `?q=${searchQuery}`;
        router.push(`/${languageSlug}search/${urlParameters}`);
    };

    const getTitle = () => {
        if (!searchQuery) return lang === 'en' ? 'Search for content' : 'Søk etter innhold';
        if (searchCategory !== 'all') {
            return lang === 'en'
                ? `Results for ${searchCategoryNames[searchCategory]?.en?.toLowerCase()} with the search term "${searchQuery}"`
                : `Resultat for ${searchCategoryNames[searchCategory]?.no?.toLowerCase()} med søkeordet "${searchQuery}"`;
        }
        return lang === 'en'
            ? `All results with the search term "${searchQuery}"`
            : `Alle resultater med søkeordet "${searchQuery}"`;
    };

    const heading = getTitle();
    const breadcrumbs = [
        { name: heading, path: `/${languageSlug}search/${searchQuery ? `?q=${searchQuery}` : ''}` }
    ];

    return (
        <>
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{heading}</h1>
                <p>
                    {lang === 'en'
                        ? hasSearchResultsCount
                            ? `Shows ${searchResults.length} of ${searchResultsCount.all} results`
                            : `${searchResults.length} results`
                        : hasSearchResultsCount
                        ? `Viser ${searchResults.length} av ${searchResultsCount.all} treff`
                        : `${searchResults.length} treff`}
                </p>
            </Container>
            <Container>
                <label className={style.selectListLabel} htmlFor="searchCategory">
                    {lang === 'en' ? 'Filter results by category' : 'Filtrer resultat på kategori'}
                </label>
                <div className={style.selectListContainer}>
                    <FontAwesomeIcon icon={faSliders} />
                    <select
                        id="searchCategory"
                        name="searchCategory"
                        value={searchCategory}
                        onChange={handleSearchCategoryChange}
                    >
                        {Object.keys(searchCategoryNames).map((categoryKey) => {
                            const category = searchCategoryNames[categoryKey];
                            const count = searchResultsCount[categoryKey] || 0;
                            const isDisabled = hasSearchResultsCount && !count;
                            return (
                                <option value={categoryKey} disabled={isDisabled} key={categoryKey}>
                                    {category[lang as 'en' | 'no']}{hasSearchResultsCount ? ` (${count})` : ''}
                                </option>
                            );
                        })}
                    </select>
                    <FontAwesomeIcon icon={faChevronDown} />
                </div>
                <div className={style.listContainer}>
                    <List compact={true}>
                        {searchResults.map((searchResult, index) => (
                            <ListItem compact={true} key={index}>
                                <SearchResult searchResult={searchResult} lang={lang} />
                            </ListItem>
                        ))}
                    </List>
                </div>
            </Container>
        </>
    );
}

export default function SearchPageClient() {
    return (
        <Suspense fallback={null}>
            <SearchContent />
        </Suspense>
    );
}
