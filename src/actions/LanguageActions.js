import { UPDATE_MULTILINGUAL_ROUTES, UPDATE_SELECTED_LANGUAGE_KEY } from "constants/types";

export const updateMultilingualRoutes = (multilingualPaths, availableLanguages) => {
    const appDomain = window.location.origin;
    let multilingualRoutes = {};
    Object.keys(availableLanguages).forEach((availableLanguageKey) => {
        const availableLanguage = availableLanguages[availableLanguageKey];
        const multilingualPath = multilingualPaths[availableLanguageKey];
        multilingualRoutes[availableLanguageKey] = {
            url: `${appDomain}/${availableLanguage.path}${multilingualPath}`,
            path: `/${availableLanguage.path}${multilingualPath}`
        };
    });
    return { type: UPDATE_MULTILINGUAL_ROUTES, payload: multilingualRoutes };
};

export const updateSelectedLanguageKey = (languageKey) => ({
    type: UPDATE_SELECTED_LANGUAGE_KEY,
    payload: languageKey
});
