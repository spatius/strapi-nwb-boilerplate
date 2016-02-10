import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux';

import { get, post } from "../fetch";

const pageFetched = createAction("PAGE_FETCH_SUCCESS");

function fetchPage(id) {
  return (dispatch, getState) => get("/api/page/" + id)
  .then(response => {
    response = {
      page: response
    };

    dispatch(pageFetched(response));

    return response;
  })
  // .catch(e => console.log(e));
}

export default {
  pageFetched,
  fetchPage
};
