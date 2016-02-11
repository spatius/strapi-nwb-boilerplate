import { createAction } from 'redux-actions';

import { get, post } from "../fetch";

const fetchPagesStatus = createAction("fetchPages/STATUS");

function fetchPages() {
  return dispatch => {
    dispatch(fetchPagesStatus({ status: 1 }));

    return get("/api/page")
    .then(data => {
      dispatch(fetchPagesStatus({ status: 2, data }));

      return data;
    })
    .catch(error => {
      dispatch(fetchPagesStatus({ status: 3, error }));

      throw error;
    });
  }
}

export default {
  fetchPages
};
