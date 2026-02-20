
import { persistStore } from "redux-persist";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

const Middlewares: any[] = [];

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware: any) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(Middlewares),
});

export const persistor = persistStore(store);
const exportStore = { store, persistor };

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default exportStore;
