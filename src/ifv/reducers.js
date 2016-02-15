import { handleActions } from 'redux-actions';

export default handleActions({
  "ifv/save/STATUS": (state, { payload: { status, data, error } }) => {
    return {
      status,
      data: data ? {
        [data.key]: {
          id: data.id,
          ...data.data
        }
      } : null,
      error
    };
  },

  "ifv/fetch/STATUS": (state, { payload: { status, data, error } }) => {
    return {
      status,
      data: data ? data.reduce((memo, value) => {
        memo[value.key] = {
          id: value.id,
          ...value.data
        };

        return memo;
      }, {}) : null,
      error
    };
  }
}, { status: 0, data: null });
