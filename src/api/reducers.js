import { handleActions } from 'redux-actions';
import _ from "lodash";

const reducers = [
  require("../auth/reducers"),
  require("../ifv/reducers"),
  require("../page/reducers"),
  require("../posts/reducers"),
  require("../profile/reducers")
];

export default handleActions({
  "api/STATUS": (state, { payload }) => {
    const action = _.omit(payload, "key");

    return reducers.reduce((memo, [key, reducer]) => {
      const r = reducer[payload.key];

      if(!r)
        return memo;

      return {
        ...memo,
        [key]: r(memo[key] || {}, action)
      };
    }, state);
  }
}, _.reduce(reducers, (memo, [key, reducer, defaultValue]) => {
  if(!memo[key])
    memo[key] = { status: 0 };

  if(defaultValue)
    memo[key] = {
      ...memo[key],
      ...defaultValue()
    };

  return memo;
}, {}));
