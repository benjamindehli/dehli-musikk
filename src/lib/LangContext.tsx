"use client";
import { createContext, useContext, type ReactNode } from "react";
import type { Lang } from "lib/pageMetadata";

type LangContextValue = { lang: Lang; languageSlug: string };

const LangContext = createContext<LangContextValue>({ lang: "no", languageSlug: "" });

/** Provides language context to client components. */
export const LangProvider = ({ lang, children }: { lang: Lang; children: ReactNode }) => {
    const languageSlug = lang === "en" ? "en/" : "";
    return <LangContext.Provider value={{ lang, languageSlug }}>{children}</LangContext.Provider>;
};

export const useLang = (): LangContextValue => useContext(LangContext);
