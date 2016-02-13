import { handleActions } from 'redux-actions';

function processResponse(state, { payload: { status, data: { user } = { }, error } }) {
  return {
    status,
    data: user ? user.profile : null,
    error
  };
}

export default handleActions({
  "profile/edit/STATUS": (state, { payload: { status, data, error } }) => {
    return {
      status,
      data,
      error
    };
  },

  "signin/STATUS": processResponse,
  "signup/STATUS": processResponse,
  "forgotPassword/STATUS": processResponse,
  "changePassword/STATUS": processResponse,
  "fetchUser/STATUS": processResponse
}, { status: 0, data: null });
