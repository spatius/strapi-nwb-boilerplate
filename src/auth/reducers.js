import { handleActions } from 'redux-actions';

const jwt = localStorage.getItem("jwt");

export default handleActions({
  SIGNIN_SUCCESS: (state, { payload: { user, jwt } }) => {
    localStorage.setItem("jwt", jwt);
    localStorage.setItem("uid", user.id);

    return {
      user,
      jwt,
      loggedIn: !!jwt
    }
  },
  SIGNOUT: (state, action) => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("uid");

    return {
      user: null,
      jwt: null,
      loggedIn: false
    }
  }
}, { user: null, jwt: jwt, loggedIn: !!jwt });
