import { handleActions } from 'redux-actions';

export default handleActions({
  PAGE_FETCH_SUCCESS: (state, { payload: { page } }) => {
    return {
      page
    }
  }
}, { page: null });
