import type { Metadata } from 'next';
import Breadcrumbs from 'components/partials/Breadcrumbs';
import Container from 'components/template/Container';
import ExpansionPanel from 'components/template/ExpansionPanel';
import { convertToUrlFriendlyString } from 'helpers/urlFormatter';
import { formatContentAsString, formatContentWithReactLinks } from 'helpers/contentFormatter';
import frequentlyAskedQuestions from 'data/frequentlyAskedQuestions';
import style from 'components/routes/Faq.module.scss';

const lang = 'no';
const languageSlug = '';

export const metadata: Metadata = {
    title: 'Ofte stilte spørsmål | Dehli Musikk',
    description: 'Ofte stilte spørsmål om Dehli Musikk, produkter og tjenester.',
    alternates: {
        canonical: 'https://www.dehlimusikk.no/frequently-asked-questions/',
        languages: {
            no: 'https://www.dehlimusikk.no/frequently-asked-questions/',
            en: 'https://www.dehlimusikk.no/en/frequently-asked-questions/',
            'x-default': 'https://www.dehlimusikk.no/frequently-asked-questions/'
        }
    },
    openGraph: {
        title: 'Ofte stilte spørsmål', url: 'https://www.dehlimusikk.no/frequently-asked-questions/',
        description: 'Ofte stilte spørsmål om Dehli Musikk, produkter og tjenester.', locale: 'no_NO', alternateLocale: 'en_US'
    },
    twitter: { title: 'Ofte stilte spørsmål', description: 'Ofte stilte spørsmål om Dehli Musikk, produkter og tjenester.' }
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
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': 'https://www.dehlimusikk.no/frequently-asked-questions/',
        mainEntity: faqItems
    };

    const breadcrumbs = [{ name: 'Ofte stilte spørsmål', path: '/frequently-asked-questions/' }];

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <Container>
                <Breadcrumbs breadcrumbs={breadcrumbs} languageSlug={languageSlug} />
                <h1>Ofte stilte spørsmål</h1>
                <p>Her er noen ofte stilte spørsmål om Dehli Musikk, mine produkter og tjenester.</p>
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
