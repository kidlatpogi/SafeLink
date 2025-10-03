// LoginComponents/LoginFormHandler.js
import { Alert } from 'react-native';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebaseConfig';
import { handleEmailVerification } from './EmailVerificationHandler';
import { checkUserProfileCompleteAndNavigate } from './UserProfileChecker';

export const handleEmailLogin = async (
  email,
  password,
  resendAttempts,
  lastResendTime,
  setResendAttempts,
  setLastResendTime,
  setHasUnverifiedEmail,
  setIsLoading,
  navigation
) => {
  // Validate inputs first
  if (!validateLoginInputs(email, password)) {
    return;
  }

  try {
    setIsLoading(true);
    
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log("User logged in:", user.email);
    
    // Check if email is verified
    if (!user.emailVerified) {
      await handleEmailVerification(
        user,
        email,
        password,
        resendAttempts,
        lastResendTime,
        setResendAttempts,
        setLastResendTime,
        setHasUnverifiedEmail
      );
      return;
    }
    
    // If email is verified, check profile and navigate
    await checkUserProfileCompleteAndNavigate(
      user,
      setIsLoading,
      navigation,
      setHasUnverifiedEmail
    );
    
  } catch (error) {
    console.error("Email/password login error:", error);
    setIsLoading(false);
    
    // Handle different types of authentication errors
    handleLoginError(error);
  }
};

const validateLoginInputs = (email, password) => {
  if (!email || !password) {
    Alert.alert("Missing Information", "Please enter both email and password.");
    return false;
  }
  
  if (!isValidEmail(email)) {
    Alert.alert("Invalid Email", "Please enter a valid email address.");
    return false;
  }
  
  return true;
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleLoginError = (error) => {
  let errorMessage = "An error occurred during login. Please try again.";
  
  switch (error.code) {
    case "auth/user-not-found":
      errorMessage = "No account found with this email address.";
      break;
    case "auth/wrong-password":
      errorMessage = "Incorrect password. Please try again.";
      break;
    case "auth/invalid-email":
      errorMessage = "Please enter a valid email address.";
      break;
    case "auth/user-disabled":
      errorMessage = "This account has been disabled. Please contact support.";
      break;
    case "auth/too-many-requests":
      errorMessage = "Too many failed attempts. Please try again later.";
      break;
    case "auth/network-request-failed":
      errorMessage = "Network error. Please check your internet connection.";
      break;
    default:
      // Error handling for unknown login errors
      break;
  }
  
  Alert.alert("Login Failed", errorMessage);
};