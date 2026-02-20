import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  user: any | null;
}

const initialState: UserState = {
  user: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setRemoveUser: (state) => {
      state.user = null;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { setRemoveUser, setUser } = userSlice.actions;
export const { reducer } = userSlice;