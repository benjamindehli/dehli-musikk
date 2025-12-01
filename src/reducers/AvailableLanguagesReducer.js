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

// Reducer
const reducer = (state = initialState) => {
  return state;
};

export default reducer;


// Selectors
export const getLanguageSlug = (state) => {
  const selectedLanguageKey = state.selectedLanguageKey || 'no';
  return state.availableLanguages?.[selectedLanguageKey]?.path ?? '';
}
