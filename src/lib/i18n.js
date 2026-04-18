export const LANGUAGES = {
  no: { name: 'norsk', slug: '' },
  en: { name: 'english', slug: 'en/' }
};

export const isValidLang = (lang) => lang === 'no' || lang === 'en';

export const getLanguageSlug = (lang) => LANGUAGES[lang]?.slug ?? '';
