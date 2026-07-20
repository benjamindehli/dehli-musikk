// Escapes "<" so data can never break out of the inline script tag
// (e.g. a "</script>" or "<!--" sequence inside a content string).
const JsonLd = ({ data }: { data: object }) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
);

export default JsonLd;
