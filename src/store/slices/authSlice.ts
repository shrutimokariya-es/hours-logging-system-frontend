import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AuthInterface {
  token?: string | null;
  isAuthenticated?: boolean;
  accessToken?: string | null;
  isAuthInitialized?: boolean;
  permission?: string | null;
  user?: any;
}

const initialState: AuthInterface = {
  token: null,
  accessToken: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  permission: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLogoutData(state: AuthInterface) {
      state.accessToken = null;
      state.token = null;
      state.isAuthInitialized = false;
      state.isAuthenticated = false;
      state.user = null;
    },
    setAuthInitialized(state: AuthInterface) {
      state.isAuthInitialized = true;
    },
    // setCredentials(state: AuthInterface, action: PayloadAction<AuthInterface>) {
    //   const { token, accessToken, user } = action.payload;
    //   if (token) {
    //     console.log("Set credentials:", action.payload.user);
    //     state.accessToken = accessToken;
    //     state.token = token;
    //     state.isAuthenticated = true;
    //     state.user = user;
    //   } else {
    //     state.accessToken = null;
    //     state.token = null;
    //     state.isAuthenticated = false;
    //     state.user = null;
    //   }
    // },
    setCredentials(state: AuthInterface, action: PayloadAction<AuthInterface>) {
  const { token, accessToken, user } = action.payload;
  
  state.isAuthInitialized = true; // ← Always mark as initialized
  
  if (token) {
    state.accessToken = accessToken;
    state.token = token;
    state.isAuthenticated = true;
    state.user = user;
  } else {
    state.accessToken = null;
    state.token = null;
    state.isAuthenticated = false;
    state.user = null;
  }
},
  },
});

export const { 
  setLogoutData, 
  setCredentials, 
  setAuthInitialized
} = authSlice.actions;

export const { reducer } = authSlice;