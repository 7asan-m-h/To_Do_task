// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBHfCuKTw1p5BJ-aDtp9Tvpr6DEv0aMbH0",
  authDomain: "to-do-list-app-29005.firebaseapp.com",
  projectId: "to-do-list-app-29005",
  storageBucket: "to-do-list-app-29005.appspot.com",
  messagingSenderId: "35453089197",
  appId: "1:35453089197:web:a64697fa685956e161dd24",
  measurementId: "G-27L293D70C"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
