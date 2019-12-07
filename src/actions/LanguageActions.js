export const getLanguageSlug = (selectedLanguageKey) => (dispatch, getState) => {
  return getState().availableLanguages && getState().availableLanguages.hasOwnProperty(selectedLanguageKey)
    ? `${selectedLanguageKey}/`
    : '';
}
