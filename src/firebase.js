// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyBHfCuKTw1p5BJ-aDtp9Tvpr6DEv0aMbH0",
    authDomain: "to-do-list-app-29005.firebaseapp.com",
    projectId: "to-do-list-app-29005",
    storageBucket: "to-do-list-app-29005.appspot.com",
    messagingSenderId: "35453089197",
    appId: "1:35453089197:web:a64697fa685956e161dd24",
    measurementId: "G-27L293D70C"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

// التعامل مع الإشعارات أثناء فتح التطبيق
onMessage(messaging, (payload) => {
    console.log('Message received. ', payload);
    alert(`Notification: ${payload.notification.title} - ${payload.notification.body}`);
});
