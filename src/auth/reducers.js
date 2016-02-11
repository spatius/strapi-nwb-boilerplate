import { handleActions } from 'redux-actions';

const jwt = localStorage.getItem("jwt");

function processResponse({ payload: { status, data: { user, jwt } = { }, error } }) {
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
  }
}

export default handleActions({
  "signin/STATUS": (state, action) => {
    return processResponse(action);
  },
  "signup/STATUS": (state, action) => {
    return processResponse(action);
  },
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
    }
  },
  "forgotPassword/STATUS": (state, action) => {
    return processResponse(action);
  },
  "changePassword/STATUS": (state, action) => {
    return processResponse(action);
  },
  "fetchUser/STATUS": (state, action) => {
    return processResponse(action);
  },
}, { status: 0, user: null, jwt: jwt, loggedIn: !!jwt });
