import { handleActions } from 'redux-actions';

const jwt = localStorage.getItem("jwt");

function processResponse(state, { payload: { status, data: { user, jwt } = { }, error } }) {
  if(status == 2) {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("uid", user.id);
  }

  return {
    status,
    user,
    jwt,
    loggedIn: !!jwt,
    error
  };
}

export default handleActions({
  "signin/STATUS": processResponse,
  "signup/STATUS": processResponse,
  "signout/STATUS": (state, { payload: { status, error } }) => {
    if(status == 2) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("uid");
    }

    return {
      status,
      user: null,
      jwt: null,
      loggedIn: false,
      error
    };
  },
  "forgotPassword/STATUS": processResponse,
  "changePassword/STATUS": processResponse,
  "fetchUser/STATUS": processResponse,

  "profile/edit/STATUS": (state, { payload: { status, data, error } }) => {
    if(status != 2)
      return state;

    return {
      ...state,
      user: {
        ...state.user,
        profile: data
      }
    };
  }
}, { status: 0, user: null, jwt: jwt, loggedIn: !!jwt });
