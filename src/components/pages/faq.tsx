import JsonLd from 'components/JsonLd';
import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import ExpansionPanel from 'components/template/ExpansionPanel';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';
import { getLanguageSlug } from 'lib/i18n';
import { buildAlternates, socialMetadata, WEBSITE_URL, type Lang } from 'lib/pageMetadata';
import frequentlyAskedQuestions from 'data/frequentlyAskedQuestions';
import style from 'components/routes/Faq.module.scss';

const translations = {
    no: {
        metaTitle: 'Ofte stilte spørsmål | Dehli Musikk',
        pageTitle: 'Ofte stilte spørsmål',
        description: 'Ofte stilte spørsmål om Dehli Musikk, produkter og tjenester.',
        intro: 'Her er noen ofte stilte spørsmål om Dehli Musikk, mine produkter og tjenester.'
    },
    en: {
        metaTitle: 'Frequently Asked Questions | Dehli Musikk',
        pageTitle: 'Frequently Asked Questions',
        description: 'Frequently asked questions about Dehli Musikk, products, and services.',
        intro: 'Here are some frequently asked questions about Dehli Musikk, my products, and services.'
    }
} as const;

export function getFaqPageMetadata(lang: Lang): Metadata {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    return {
        title: t.metaTitle,
        description: t.description,
        alternates: buildAlternates(lang, { no: 'frequently-asked-questions/', en: 'frequently-asked-questions/' }),
        ...socialMetadata(lang, {
            title: t.pageTitle,
            url: `${WEBSITE_URL}/${languageSlug}frequently-asked-questions/`,
            description: t.description
        })
    };
}

export function FaqPage({ lang }: { lang: Lang }) {
    const t = translations[lang];
    const languageSlug = getLanguageSlug(lang);
    const faqItems = frequentlyAskedQuestions.map((faq) => ({
        '@type': 'Question',
        name: faq.question[lang],
        acceptedAnswer: {
            '@type': 'Answer',
            text: formatContentAsString(faq.answer[lang])
        }
    }));
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': `${WEBSITE_URL}/frequently-asked-questions/`,
        mainEntity: faqItems
    };

    const breadcrumbs = [{ name: t.pageTitle, path: `/${languageSlug}frequently-asked-questions/` }];

    return (
        <>
            <JsonLd data={jsonLd} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>{t.pageTitle}</h1>
                <p>{t.intro}</p>
            </Container>
            <Container>
                <div className={style.listContainer}>
                    {frequentlyAskedQuestions.map((faq, index) => {
                        const question = faq.question[lang];
                        const answer = faq.answer[lang];
                        const id = convertToUrlFriendlyString(question);
                        return (
                            <ExpansionPanel elementId={id} panelTitle={question} key={index}>
                                <div className={style.faqItem}>
                                    {formatContentWithReactLinks(answer, languageSlug)}
                                </div>
                            </ExpansionPanel>
                        );
                    })}
                </div>
            </Container>
        </>
    );
}
