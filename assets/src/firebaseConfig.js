// firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";

// Firebase config (from Firebase Console → Project settings)
const firebaseConfig = {
  apiKey: "AIzaSyDcqCr3W0ShMeRZAYglc_QIwSFVHKF6nIc",
  authDomain: "disaster-preparedness-b21f9.firebaseapp.com",
  projectId: "disaster-preparedness-b21f9",
  storageBucket: "disaster-preparedness-b21f9.appspot.com",
  messagingSenderId: "947195980810",
  appId: "1:947195980810:web:8d76e07db1f7fefc0503f3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth: use AsyncStorage persistence for native, normal for web
let auth;
try {
  auth = Platform.OS === "web"
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });
} catch (error) {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };

// Firestore
export const db = getFirestore(app);

// Google Sign-In Client IDs (from Google Cloud Console)
export const GOOGLE_CLIENT_IDS = {
  // Web Client ID (OAuth 2.0 client from Google Cloud Console)
  web: "947195980810-trgaoi6be6k2cva2vjc442n6lr6erlon.apps.googleusercontent.com",
  
  // Android Client ID (from Google Cloud Console - Android client)
  android: "947195980810-k4fso2tuih6ea7j5vfm1f72s8j5idcsl.apps.googleusercontent.com",
  
  // iOS Client ID (from Google Cloud Console - iOS client)
  ios: "947195980810-iqn4dberfu733cuk9332aitc1ren96hl.apps.googleusercontent.com",
};

// Backward compatibility
export const GOOGLE_WEB_CLIENT_ID = GOOGLE_CLIENT_IDS.web;