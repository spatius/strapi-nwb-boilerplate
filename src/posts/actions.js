import { createAction } from 'redux-actions';

import { get, post } from "../fetch";

const fetchPostsStatus = createAction("fetchPosts/STATUS");
const fetchPostStatus = createAction("fetchPost/STATUS");

function fetchPosts() {
  return dispatch => {
    dispatch(fetchPostsStatus({ status: 1 }));

    return get("/api/post")
    .then(data => {
      dispatch(fetchPostsStatus({ status: 2, data }));

      return data;
    })
    .catch(error => {
      dispatch(fetchPostsStatus({ status: 3, error }));

      throw error;
    });
  }
}
function fetchPost(id) {
  return dispatch => {
    dispatch(fetchPostStatus({ status: 1 }));

    return get("/api/post/"+id)
    .then(data => {
      dispatch(fetchPostStatus({ status: 2, data }));

      return data;
    })
    .catch(error => {
      dispatch(fetchPostStatus({ status: 3, error }));

      throw error;
    });
  }
}

export default {
  fetchPosts,
  fetchPost
};
