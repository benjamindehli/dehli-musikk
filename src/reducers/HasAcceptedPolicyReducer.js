import { UPDATE_HAS_ACCEPTED_POLICY } from "../constants/types";

const initialState = false;

const reducer = (state = initialState, action) => {
    if (action.type === UPDATE_HAS_ACCEPTED_POLICY) {
        return action.payload;
    } else {
        return state;
    }
};

export default reducer;
