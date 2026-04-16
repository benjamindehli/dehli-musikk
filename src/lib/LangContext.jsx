'use client';
import { createContext, useContext } from 'react';

/** @type {React.Context<{lang: string, languageSlug: string}>} */
const LangContext = createContext({ lang: 'no', languageSlug: '' });

/**
 * Provides language context to client components.
 * @param {{ lang: string, children: React.ReactNode }} props
 */
export const LangProvider = ({ lang, children }) => {
  const languageSlug = lang === 'en' ? 'en/' : '';
  return (
    <LangContext.Provider value={{ lang, languageSlug }}>
      {children}
    </LangContext.Provider>
  );
};

/** @returns {{ lang: string, languageSlug: string }} */
export const useLang = () => useContext(LangContext);
