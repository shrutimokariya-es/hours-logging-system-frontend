//========================== Packages ==========================//
import axios, { AxiosRequestHeaders, InternalAxiosRequestConfig } from "axios";

//========================== Redux ==========================//
import { Store } from "@reduxjs/toolkit";
import { setLogoutData } from "../store/slices/authSlice";
import { ToastShow } from "../store/slices/toastSlice";

//========================== Others ==========================//
import { VITE_BACKEND_BASE_URL } from "../config";
import { navigateTo } from "../helper/Navigate/Navigation";
import { ROUTES } from "../router/constant/routes.path";
import { cookieSet } from "../helper/cookieSet";

export const Axios = axios.create({ baseURL: `${VITE_BACKEND_BASE_URL}` });

export const setupAxios = (store: Store) => {
  const SKIP_COOKIE_ROUTES = [
    "/setup-2fa",
    "/verify-2fa",
    "/resend-code",
    "/login",
    "/forgot-password",
    "/register",
    "/confirm-registration",
  ];

  Axios.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    const storeData = store.getState();

    const authToken = storeData.auth.token;
    const accessToken = storeData.auth.accessToken;
    const url = request.url || "";
    const shouldSkipCookie = SKIP_COOKIE_ROUTES.some((route) =>
      url.includes(route)
    );
    let cookieSetResult = false;
    if (!shouldSkipCookie) {
      cookieSetResult = cookieSet();
    }
    // ✅ Cancel the request if cookieSetResult is true
    if (cookieSetResult) {
      return Promise.reject(
        new axios.Cancel("Request cancelled by interceptor due to cookieSet.")
      );
    }
    if (authToken) {
      (
        request.headers as AxiosRequestHeaders
      ).Authorization = `Bearer ${authToken}`;

      (request.headers as AxiosRequestHeaders)["accesstoken"] = accessToken;
    }
    return request;
  });

  Axios.interceptors.response.use(
    (res) => {
      const redirectUrl = res?.data?.redirectUrl;

      if (redirectUrl) {
        navigateTo(redirectUrl);
      }

      const toast = res?.data?.toast;
      if (toast) {
        store.dispatch(
          ToastShow({
            message: res.data.message,
            type: res.data.responseType,
          })
        );
      }
      return res;
    },
    (e) => {
      console.log("e>>>", e);

      // ✅ Handle cancellation gracefully
      if (axios.isCancel(e)) {
        console.warn("Request cancelled by interceptor:", e.message);
        // You can either return nothing or return a cancelled response if needed
        return Promise.resolve({ cancelled: true });
      }

      const redirectUrl = e?.response?.data?.redirectUrl;

      // Token Expired ot Invalid
      if (e?.response?.status === 401) {
        console.log("response status :>> ", e?.response?.status);
        store.dispatch(setLogoutData());
        navigateTo(ROUTES.LOGIN);
        return Promise.reject(e);
      }

      // Network issues — here there is no need to logout the user.
      if (e.code === "ERR_NETWORK") {
        console.warn("Network error (not logging out):", e.message);
        store.dispatch(
          ToastShow({
            message:
              "Network issue. Please check your connection and try again.",
            type: "error",
          })
        );
        return Promise.reject(e);
      }

      if (redirectUrl) {
        navigateTo(redirectUrl);
      }
      const toast = e?.response?.data?.toast;
      const message = e?.response?.data?.message;

      if (toast) {
        store.dispatch(
          ToastShow({
            message: message,
            type: e?.response?.data?.responseType || "",
          })
        );
      }
      throw e;
    }
  );
};

export default axios;
