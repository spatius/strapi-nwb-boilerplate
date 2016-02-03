import { createAction } from 'redux-actions';
import { routeActions } from 'react-router-redux'

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
          case "required": return "Required";
          case "minLength": return "Too short";
          case "maxLength": return "Too long";
          case "unique": return "Already taken";
          default: return error.rule;
        }
      });
    }
  }

  console.log(result, error);

  return result;
}

function signin({ email, password }) {
  return (dispatch, getState) => post("auth/local", { identifier: email, password })
  .then(response => {
    dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  .catch(error => {
    throw Object.assign({
      _error: "Signin failed!"
    }, parseError(error));
  });
}

function signup({ username, email, password }) {
  return (dispatch, getState) => post("auth/local/register", { username, email, password })
  .then(response => {
    dispatch(signedin(response));
    dispatch(routeActions.push("/"));

    return response;
  })
  .catch(error => {
    throw Object.assign({
      _error: "Signup failed!"
    }, parseError(error));
  });
}

function signout() {
  return (dispatch, getState) => {
    dispatch(doSignout());
    dispatch(routeActions.push("/"));
  };
}

// ???
function fetchUser() {
  return (dispatch, getState) => get("user/" + localStorage.getItem("uid"), { token: localStorage.getItem("jwt") })
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
  fetchUser
};
