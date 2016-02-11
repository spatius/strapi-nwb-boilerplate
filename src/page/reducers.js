import { handleActions } from 'redux-actions';

export default handleActions({
  "fetchPages/STATUS": (state, { payload: { status, data, error } }) => {
    return {
      status,
      data: status == 2 ? data : null,
      error: status == 3 ? error : null
    };
  }
}, { status: 0, data: null, error: null });
