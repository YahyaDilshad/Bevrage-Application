 // ❓ Ye kya karta hai?
// Firebase core engine load karta hai
// firebase global object create karta hai
// ❌ Agar ye na ho
// firebase.initializeApp() exist hi nahi karega
// Error: firebase is not defined
// 👉 Ye bilkul aisa hai jaise forebase ko require krna : const firebase = require("firebase");
// lekin service worker style me down ma jo importScript hoti hai.
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");


importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCT12oHnxU5yp8_MUJCAYUuRJJXgVK4LK4",
  authDomain: "bevrages-88bd5.firebaseapp.com",
  projectId: "bevrages-88bd5",
  messagingSenderId:"1036831535126",
  appId: "1:1036831535126:web:f431e49e7885a7123f4537" 
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
