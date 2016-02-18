function processResponse(state, { status, data, error }) {
  return {
    status,
    data: data ? data.profile : null,
    error
  };
}

export default ["profile", {
  saveProfile: (state, action) => action,

  signin: processResponse,
  signup: processResponse,
  forgotPassword: processResponse,
  changePassword: processResponse,
  user: processResponse
}];
