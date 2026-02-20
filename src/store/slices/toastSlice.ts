import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface IToastType {
  message: string | null;
  type: string | null;
}

const initialState = {
  message: null,
  type: null,
};

export const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    ToastShow: (state: IToastType, action: PayloadAction<IToastType>) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
    },
  },
});

export const toastSelector = (state: { toast: IToastType }) => {
  return { message: state.toast.message, type: state.toast.type };
};

const { actions, reducer } = toastSlice;

export const { ToastShow } = actions;

export default reducer;
