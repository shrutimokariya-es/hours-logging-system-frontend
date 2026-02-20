import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

import { reducer as authReducer } from "./slices/authSlice";
import { reducer as userReducer } from "./slices/userSlice";
import toastReducer from "./slices/toastSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  toast: toastReducer,
});

export default persistReducer(persistConfig, rootReducer);
