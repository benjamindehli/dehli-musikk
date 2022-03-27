const initialState = {
  no: {
    name: 'norsk',
    path: ''
  },
  en: {
    name: 'english',
    path: 'en/'
  }
};

const reducer = (state = initialState) => {
  return state;
};

export default reducer;


// Selectors
export const getLanguageSlug = (state) => {
  const selectedLanguageKey = state.selectedLanguageKey || 'no';
  return state.availableLanguages?.hasOwnProperty(selectedLanguageKey)
    ? state.availableLanguages[selectedLanguageKey].path
    : '';
}

export const getLanguageSlugByKey = (state, languageKey) => {
  return state.availableLanguages?.hasOwnProperty(languageKey)
    ? state.availableLanguages?.[languageKey]?.path
    : '';
}

