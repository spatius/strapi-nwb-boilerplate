import { handleActions } from 'redux-actions';

export default handleActions({
  "fetchPosts/STATUS": (state, { payload: { status, data, error } }) => {
    return {
      status,
      posts: status == 2 ? data : null,
      error: status == 3 ? error : null
    };
  },
  "fetchPost/STATUS": (state, { payload: { status, data, error } }) => {
    return {
      status,
      data: status == 2 ? data : null,
      error: status == 3 ? error : null
    };
  }

}, { status: 0, posts:null, data: {}, error: null });
