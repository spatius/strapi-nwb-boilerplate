export default ["posts", {
  "posts": (state, { status, data, error }) => {
    return {
      status,
      posts: status == 2 ? data : null,
      error: status == 3 ? error : null
    };
  },
  "post": (state, { status, data, error }) => {
    return {
      status,
      data: status == 2 ? data : null,
      error: status == 3 ? error : null
    };
  }
}];
