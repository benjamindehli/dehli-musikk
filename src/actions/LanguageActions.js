import { UPDATE_MULTILINGUAL_ROUTES, UPDATE_SELECTED_LANGUAGE_KEY } from 'constants/types';

export const updateMultilingualRoutes = (location, availableLanguages) => {
  if (location.pathname) {
    const appDomain = window.location.origin;
    let multilingualRoutes = {};
    if (availableLanguages && Object.keys(availableLanguages).length) {
      Object.keys(availableLanguages).forEach(languageKey => {
        const availableLanguage = availableLanguages[languageKey];
        let pathnameWithoutLanguageSlug = location.pathname;
        const languageSlugRegExp = new RegExp(`^/en/`);
        pathnameWithoutLanguageSlug = pathnameWithoutLanguageSlug.replace(languageSlugRegExp, '/');
        pathnameWithoutLanguageSlug = pathnameWithoutLanguageSlug.replace(/^\//, '');
        multilingualRoutes[languageKey] = {
          url: `${appDomain}/${availableLanguage.path}${pathnameWithoutLanguageSlug}${location.search}`,
          path: `/${availableLanguage.path}${pathnameWithoutLanguageSlug}${location.search}`
        }
      });
    }
    return { type: UPDATE_MULTILINGUAL_ROUTES, payload: multilingualRoutes };
  }
}

export const updateSelectedLanguageKey = (languageKey) => ({
  type: UPDATE_SELECTED_LANGUAGE_KEY, payload: languageKey
});

