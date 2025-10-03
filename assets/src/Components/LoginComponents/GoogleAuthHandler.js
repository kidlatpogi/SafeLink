
// LoginComponents/GoogleAuthHandler.js
import React from 'react';
import { Platform } from 'react-native';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db, GOOGLE_CLIENT_IDS } from '../../firebaseConfig';
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

export const useGoogleAuthHandler = (navigation, setError) => {
  // Google OAuth configuration
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'safelink',
    path: 'redirect',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      android: GOOGLE_CLIENT_IDS?.android || "947195980810-k4fso2tuih6ea7j5vfm1f72s8j5idcsl.apps.googleusercontent.com",
      ios: GOOGLE_CLIENT_IDS?.ios || "947195980810-iqn4dberfu733cuk9332aitc1ren96hl.apps.googleusercontent.com", 
      web: GOOGLE_CLIENT_IDS?.web || "947195980810-trgaoi6be6k2cva2vjc442n6lr6erlon.apps.googleusercontent.com",
    }),
    redirectUri,
  });

  // Handle Google login response
  React.useEffect(() => {
    if (response?.type === "success") {
      handleGoogleAuthSuccess(response, navigation, setError);
    }
  }, [response, navigation, setError]);

  const handleGoogleSignIn = async () => {
    setError("");
    if (Platform.OS === "web") {
      return handleWebGoogleSignIn(navigation, setError);
    } else {
      return promptAsync();
    }
  };

  return { handleGoogleSignIn };
};

const handleGoogleAuthSuccess = async (response, navigation, setError) => {
  try {
    const { id_token, access_token } = response.params;
    
    if (!id_token) {
      console.error("No id_token in response:", response.params);
      setError("Google authentication failed. Please try again.");
      return;
    }
    
    const credential = GoogleAuthProvider.credential(id_token, access_token);
    const userCredential = await signInWithCredential(auth, credential);
    const user = userCredential.user;

    console.log("User logged in via Google:", user.email);

    // Check user profile and navigate accordingly
    await checkUserProfileAndNavigate(user, navigation);
  } catch (err) {
    setError("Google login failed. Please try again.");
  }
};

const handleWebGoogleSignIn = async (navigation, setError) => {
  if (Platform.OS !== "web") return false;
  
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    
    await checkUserProfileAndNavigate(user, navigation);
    return true;
  } catch (err) {
    setError("Google login failed. Please try again.");
    return false;
  }
};

const checkUserProfileAndNavigate = async (user, navigation) => {
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    const destination = userDoc.exists() ? "Home" : "User_Form";
    
    navigation.reset({
      index: 0,
      routes: [{ name: destination }],
    });
  } catch (firestoreError) {
    navigation.reset({
      index: 0,
      routes: [{ name: "User_Form" }],
    });
  }
};