import axiosInstance from "../lib/axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "react-toastify";

const useauthstore = create(
  persist(
    (set, get) => ({
      authuser: null,
      products: [],
      productsLoading: false,
      isCheckingAuth: true,
      isAuthenticated: false,
      isloggedin: false,
      isupdatingprofile: false,
      isSignup: false,
      connectedSocket: null,
      FCMtoken : [],
      //send token to backend and save in db
      sendtokentobackend : async (token)=>{
        const tokendata = {
          token,
          deviceType : 'web',
          Headers : {
            'Content-Type' : 'application/json'
          },
          devicename: navigator.userAgent
        }
        try {
          await axiosInstance.post('/device/save' , tokendata)
          set({FCMtoken : tokendata.token})
          console.log("Token sent to backend successfully");
        } catch (error) {
          console.log("token send to backend error", error.message)
        }
      },
      // ✅ Fetch products
      fetchProducts: async (category) => {
        set({ productsLoading: true });
        try {
          const url = category
            ? `/products?category=${encodeURIComponent(category)}`
            : "/products";
          const res = await axiosInstance.get(url);
          const payload = res.data?.data ?? res.data ?? [];
          set({ products: payload });
          return payload;
        } catch (err) {
          console.error("fetchProducts error:", err);
          set({ products: [] });
          return [];
        } finally {
          set({ productsLoading: false });
        }
      },

      // ✅ Signup
      signup: async (formdata) => {
        set({ isSignup: true });
        try {
          const response = await axiosInstance.post("/auth/signup", formdata);
          set({ authuser: response.data.user });
          toast.success("Signup successful");
          return response.data;
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Signup failed"
          );
          throw error;
        } finally {
          set({ isSignup: false });
        }
      },

      // ✅ Login
    login: async (formdata) => {
     try {
      const response = await axiosInstance.post('/auth/login', formdata);
      const user = response.data.user
      set({
        authuser: user,
        isAuthenticated: true,
        isloggedin: true,
      });

      return user
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Login failed");
    }
  },


      // ✅ Logout
      logout: async () => {
        try {
          await axiosInstance.post("/auth/logout");
          localStorage.removeItem("auth-storage"); // clear persisted user
          set({ authuser: null, isAuthenticated: false, isloggedin: false });
          localStorage.removeItem("fcm_registered") // clean up fcm token 
          toast.success(" Logged out successfully");
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Logout failed"
          );
        }
      },
    }),
    {
      name: "auth-storage", // localStorage key
      getStorage: () => localStorage, // default storage
    }
  )
);

export default useauthstore;
