import { handleActions } from 'redux-actions';

export default handleActions({
  PAGES_FETCH_SUCCESS: (state, { payload }) => {
    return payload;
  },
  // PAGE_FETCH_SUCCESS: (state, { payload: { page } }) => {
  //   return {
  //     [page.id]: page
  //   }
  // }
}, []);
