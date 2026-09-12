import type { Lang } from "lib/pageMetadata";

export const LANGUAGES: Record<Lang, { name: string; slug: string }> = {
    no: { name: "norsk", slug: "" },
    en: { name: "english", slug: "en/" }
};

export const isValidLang = (lang: string): lang is Lang => lang === "no" || lang === "en";

export const getLanguageSlug = (lang: Lang): string => LANGUAGES[lang]?.slug ?? "";
