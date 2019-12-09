import {UPDATE_HAS_ACCEPTED_POLICY} from '../constants/types';

export const updateHasAcceptedPolicy = (hasAcceptedPolicy) => dispatch => {
  dispatch({type: UPDATE_HAS_ACCEPTED_POLICY, payload: hasAcceptedPolicy});
}
