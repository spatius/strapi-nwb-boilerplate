import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux';

import { get, post } from "../fetch";

const pageFetched = createAction("PAGE_FETCH_SUCCESS");
const pagesFetched = createAction("PAGES_FETCH_SUCCESS");

function fetchPages() {
  return (dispatch, getState) => get("/api/page")
  .then(response => {
    dispatch(pagesFetched(response));

    return response;
  })
  // .catch(e => console.log(e));
}

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
  pagesFetched,
  pageFetched,
  fetchPages,
  fetchPage
};
