import { LOGIN_SUCCESS, LOGIN_FAILURE } from "./userActions";
const initialState = {
  user: null,
  error: null,
};

const userReducer = (
  state = initialState,
  action: { type: any; payload: any }
) => {
  switch (action.type) {
    case LOGIN_SUCCESS:
      return { ...state, user: action.payload, error: null };
    case LOGIN_FAILURE:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export default userReducer;
