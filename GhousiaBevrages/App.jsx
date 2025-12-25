import React, { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";

import messaging from "@react-native-firebase/messaging";

export default function App() {
  // -----------------------------
  // REQUEST PERMISSION (Android 13+)
  // -----------------------------
  const requestNotificationPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("🔔 Notification permission granted.");
    } else {
      console.log("❌ Notification permission denied.");
    }
  };

  // -----------------------------
  // GET FCM TOKEN
  // -----------------------------
  const getFCMToken = async () => {
    try {
      const token = await messaging().getToken();
      console.log("📌 FCM TOKEN:", token);
      // 👉 is token ko backend server ko send karo
      messaging().onTokenRefresh(token => {
      console.log("🔁 NEW FCM TOKEN:", token);
      // 👉 Yaha backend ko update karo
    });

    } catch (err) {
      console.log("FCM Token Error:", err);
    }
  };

  // -----------------------------
  // FOREGROUND MESSAGE LISTENER
  // -----------------------------
  const setupForegroundListener = () => {
    return messaging().onMessage(async remoteMessage => {
      console.log("📩 Foreground Notification:", remoteMessage);

      const { title, body } = remoteMessage.notification ?? {};

      if (title || body) {
        Alert.alert(title, body);
      }
    });
  };

  // -----------------------------
  // USE EFFECT
  // -----------------------------
  useEffect(() => {
    if (Platform.OS === "android") {
      requestNotificationPermission();
      getFCMToken();
    }

    const unsubscribe = setupForegroundListener();

    return unsubscribe; // Clean listener on unmount
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
