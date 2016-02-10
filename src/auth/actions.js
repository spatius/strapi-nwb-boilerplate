import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux';

import { get, post } from "../fetch";

const signedin = createAction("SIGNIN_SUCCESS");
const doSignout = createAction("SIGNOUT");

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

  console.log(result, error);

  return result;
}

function signin({ email, password }) {
  return (dispatch, getState) => post("/api/auth/local", { identifier: email, password })
  .then(response => {
    dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  .catch(error => {
    throw Object.assign({
      _error: "Login failed!"
    }, parseError(error));
  });
}

function signup({ username, email, password }) {
  return (dispatch, getState) => post("/api/auth/local/register", { username, email, password })
  .then(response => {
    dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  .catch(error => {
    throw Object.assign({
      _error: "Registration failed!"
    }, parseError(error));
  });
}

function signout() {
  return (dispatch, getState) => {
    dispatch(doSignout());
    dispatch(routeActions.push("/"));
  };
}

function forgotPassword({ email }) {
  return (dispatch, getState) => post("/api/auth/forgot-password", { email })
  .then(response => {
    console.log(response);

    // dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  .catch(error => {
    throw Object.assign({
      _error: "Registration failed!"
    }, parseError(error));
  });
}

function changePassword({ token, password, password2 }) {
  return (dispatch, getState) => post("/api/auth/change-password", { code: token, password, passwordConfirmation: password2 })
  .then(response => {
    console.log(response);

    dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  .catch(error => {
    throw Object.assign({
      _error: "Registration failed!"
    }, parseError(error));
  });
}

function fetchUser() {
  return (dispatch, getState) => get("/api/user/" + localStorage.getItem("uid"), { token: localStorage.getItem("jwt") })
  .then(response => {
    response = {
      user: response,
      jwt: localStorage.getItem("jwt")
    };

    dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  // .catch(e => console.log(e));
}

export default {
  signin,
  signedin,
  signup,
  signout,
  forgotPassword,
  changePassword,
  fetchUser
};
