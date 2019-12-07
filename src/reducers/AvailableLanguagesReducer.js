import { GET_SELECTED_LANGUAGE } from '../constants/types';

const initialState = {
  no: {
    name: 'norsk',
    path: ''
  },
  en: {
    name: 'english',
    path: 'en/'
  }
}

export default function(state = initialState) {
	return state
}
