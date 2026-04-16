import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import ExpansionPanel from 'components/template/ExpansionPanel';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';
import frequentlyAskedQuestions from 'data/frequentlyAskedQuestions';
import style from 'components/routes/Faq.module.scss';

const lang = 'en';
const languageSlug = 'en/';

export const metadata: Metadata = {
    title: 'Frequently Asked Questions | Dehli Musikk',
    description: 'Frequently asked questions about Dehli Musikk, products, and services.',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/en/frequently-asked-questions/',
        languages: {
            no: 'https://www.dehlimusikk.no/frequently-asked-questions/',
            en: 'https://www.dehlimusikk.no/en/frequently-asked-questions/',
            'x-default': 'https://www.dehlimusikk.no/frequently-asked-questions/'
        }
    },
    openGraph: {
        title: 'Frequently Asked Questions', url: 'https://www.dehlimusikk.no/en/frequently-asked-questions/',
        description: 'Frequently asked questions about Dehli Musikk, products, and services.', locale: 'en_US', alternateLocale: 'nb_NO'
    },
    twitter: { title: 'Frequently Asked Questions', description: 'Frequently asked questions about Dehli Musikk, products, and services.' }
};

export default function FaqPage() {
    const faqItems = frequentlyAskedQuestions.map((faq) => ({
        '@type': 'Question',
        name: faq.question[lang],
        acceptedAnswer: {
            '@type': 'Answer',
            text: formatContentAsString(faq.answer[lang])
        }
    }));
    const jsonLd = {
        '@context': 'http://schema.org',
        '@type': 'FAQPage',
        '@id': 'https://www.dehlimusikk.no/frequently-asked-questions/',
        mainEntity: faqItems
    };

    const breadcrumbs = [{ name: 'Frequently Asked Questions', path: '/en/frequently-asked-questions/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Frequently Asked Questions</h1>
                <p>Here are some frequently asked questions about Dehli Musikk, my products, and services.</p>
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
