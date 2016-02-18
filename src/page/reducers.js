export default ["pages", {
  "pages": (state, { status, data, error }) => {
    return {
      status,
      data: status == 2 ? data : null,
      error: status == 3 ? error : null
    };
  }
}];
