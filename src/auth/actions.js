import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux';

import { get, post } from "../fetch";

const signinStatus = createAction("signin/STATUS");
const signupStatus = createAction("signup/STATUS");
const signoutStatus = createAction("signout/STATUS");
const forgotPasswordStatus = createAction("forgotPassword/STATUS");
const changePasswordStatus = createAction("changePassword/STATUS");
const fetchUserStatus = createAction("fetchUser/STATUS");

function parseError(error) {
  const { invalidAttributes } = error;

  var result = {};

  // Parse server side validation
  if(invalidAttributes) {
    for(let key of Object.keys(invalidAttributes)) {
      result[key] = invalidAttributes[key].map(error => {
        switch(error.rule) {
          case "required": return "required";
          case "minLength": return "too short";
          case "maxLength": return "too long";
          case "unique": return "already taken";
          default: return error.rule;
        }
      });
    }
  } else
    result._error = error.message || error;

  return result;
}

function signin({ email, password }) {
  return (dispatch, getState) => {
    dispatch(signinStatus({ status: 1 }));

    return post("/api/auth/local", { identifier: email, password })
    .then(data => {
      dispatch(signinStatus({ status: 2, data }));

      const { router: { location: { query: { next } } } } = getState();

      if(next)
        dispatch(routeActions.replace(next));
      else
        dispatch(routeActions.replace("/"));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Login failed!"
      }, parseError(error));

      dispatch(signinStatus({ status: 3, error }));

      throw error;
    });
  }
}

function signup({ username, email, password }) {
  return (dispatch, getState) => {
    dispatch(signupStatus({ status: 1 }));

    return post("/api/auth/local/register", { username, email, password })
    .then(data => {
      dispatch(signupStatus({ status: 2, data }));
      dispatch(routeActions.replace("/"));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Registration failed!"
      }, parseError(error));

      dispatch(signupStatus({ status: 3, error }));

      throw error;
    });
  }
}

function signout() {
  return (dispatch, getState) => {
    dispatch(signoutStatus({ status: 1 }));

    return post("/api/auth/logout")
    .then(data => {
      dispatch(signoutStatus({ status: 2, data }));
      // dispatch(routeActions.replace("/"));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Logout failed!"
      }, parseError(error));

      dispatch(signoutStatus({ status: 3, error }));

      throw error;
    });
  };
}

function forgotPassword({ email }) {
  return (dispatch, getState) => {
    dispatch(forgotPasswordStatus({ status: 1 }));

    return post("/api/auth/forgot-password", { email })
    .then(data => {
      dispatch(forgotPasswordStatus({ status: 2, data }));
      dispatch(routeActions.replace("/"));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Password reset failed!"
      }, parseError(error));

      dispatch(forgotPasswordStatus({ status: 3, error }));

      throw error;
    });
  }
}

function changePassword({ token, password, password2 }) {
  return (dispatch, getState) => {
    dispatch(changePasswordStatus({ status: 1 }));

    return post("/api/auth/change-password", { code: token, password, passwordConfirmation: password2 })
    .then(data => {
      dispatch(changePasswordStatus({ status: 1, data }));
      dispatch(routeActions.replace("/"));

      return data;
    })
    .catch(error => {
      error = Object.assign({
        _error: "Password reset failed!"
      }, parseError(error));

      dispatch(changePasswordStatus({ status: 3, error }));

      throw error;
    });
  }
}

function fetchUser() {
  return (dispatch, getState) => {
    dispatch(fetchUserStatus({ status: 1 }));

    return get("/api/user/" + localStorage.getItem("uid"), { token: localStorage.getItem("jwt") })
    .then(data => {
      data = {
        user: data,
        jwt: localStorage.getItem("jwt")
      };

      dispatch(fetchUserStatus({ status: 2, data }));
      // dispatch(routeActions.replace("/"));

      return data;
    })
    .catch(error => {
      dispatch(fetchUserStatus({ status: 3, error }));

      throw error;
    });
  }
}

export default {
  signin,
  signup,
  signout,
  forgotPassword,
  changePassword,
  fetchUser
};
