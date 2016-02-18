import { api } from "../api";

function signin({ email, password }) {
  return api("signin", {}, { identifier: email, password });
}

function signup({ username, email, password }) {
  return api("signup", {}, { username, email, password });
}

function signout() {
  return api("signout", {}, {});
}

function forgotPassword({ email }) {
  return api("forgotPassword", {}, { email });
}

function changePassword({ token, password, password2 }) {
  return api("changePassword", {}, { code: token, password, passwordConfirmation: password2 });
}

function fetchUser() {
  return api("user", { id: localStorage.getItem("uid") }, { token: localStorage.getItem("jwt") });
}

export default {
  signin,
  signup,
  signout,
  forgotPassword,
  changePassword,
  fetchUser
};
