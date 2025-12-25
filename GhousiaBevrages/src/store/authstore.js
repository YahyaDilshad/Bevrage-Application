import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axiosInstance from '../utils/axiosInstace'
import Geolocation from 'react-native-geolocation-service'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'

export const authstore = create(
  persist(
    (set, get) => ({
      user: null,
      location: null,
      isloggedin: false,
      isloading: false,
      isSignUp: false,

      signup: async (formdata) => {
        set({ isloading: true, isSignUp: true })
        try {
          const response = await axiosInstance.post('/auth/signup', formdata)
          const user = response.data.user
          set({ user, isloggedin: true, isloading: false })
          return user
        } catch (error) {
          console.error("Signup error:", error?.response?.data ?? error)
          set({ isloading: false })
          return null
        } finally {
          set({ isSignUp: false })
        }
      },

      signin: async (formdata) => {
        set({ isloading: true, isSignUp: true })
        try {
          const response = await axiosInstance.post('/auth/login', formdata)
          const user = response.data.user
          set({ user, isloggedin: true, isloading: false })
          return user
        } catch (error) {
          console.error("Signin error:", error?.response?.data ?? error)
          set({ isloading: false })
          return null
        } finally {
          set({ isSignUp: false })
        }
      },

      signout: async () => {
        set({ isloading: true })
        try {
          await axiosInstance.post('/auth/logout')
          set({ user: null, isloggedin: false, isloading: false })
        } catch (error) {
          console.error("Signout error:", error)
          set({ isloading: false })
        }
      },

      // LOCATION USING react-native-geolocation-service
      getlocation: async () => {
        try {
          let permission;

          // Android permission
          permission = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION)

          if (permission !== RESULTS.GRANTED) {
            alert("Location permission denied")
            return
          }

          Geolocation.getCurrentPosition(
            async (pos) => {
              const { latitude, longitude } = pos.coords
              const user = get().user
              if (!user) return console.warn("No user logged in")

              const res = await axiosInstance.post('/auth/update-location', {
                userId: user._id,
                latitude,
                longitude,
                address: "Unknown"  // if no reverse geolocation
              })

              set({ location: pos })
              console.log("📍 Location updated:", res.data)
            },
            (err) => {
              console.log("Location error:", err)
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
          )
        } catch (error) {
          console.error("Location error:", error)
        }
      },
    }),

    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isloggedin: state.isloggedin,
      }),
    }
  )
)
