// LoginComponents/EmailVerificationHandler.js
import { Alert } from 'react-native';
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from '../../firebaseConfig';

export const handleEmailVerification = async (
  user, 
  email, 
  password, 
  resendAttempts, 
  lastResendTime,
  setResendAttempts,
  setLastResendTime,
  setHasUnverifiedEmail
) => {
  console.log("Email not verified for user:", user.email);
  
  // Set state to show resend button in UI
  setHasUnverifiedEmail(true);
  
  // Sign out the unverified user
  await auth.signOut();
  
  // Check conditions for showing resend option
  const currentTime = Date.now();
  const timeSinceLastResend = lastResendTime ? currentTime - lastResendTime : null;
  const canResend = resendAttempts < 3 && (!timeSinceLastResend || timeSinceLastResend > 60000);
  
  // Create alert buttons based on conditions
  const alertButtons = [{ text: "OK", style: "default" }];
  
  // Only add resend button if conditions are met
  if (canResend) {
    alertButtons.unshift({
      text: "Resend Email",
      onPress: () => resendVerificationEmail(email, password, setResendAttempts, setLastResendTime)
    });
  }
  
  // Show alert with conditional resend option
  const alertMessage = getVerificationMessage(canResend, resendAttempts, user.email);
  
  Alert.alert("Email Not Verified", alertMessage, alertButtons);
};

const resendVerificationEmail = async (email, password, setResendAttempts, setLastResendTime) => {
  try {
    // Sign in again temporarily to send verification email
    const tempCredential = await signInWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(tempCredential.user);
    await auth.signOut();
    
    // Update resend tracking
    setResendAttempts(prev => prev + 1);
    setLastResendTime(Date.now());
    
    Alert.alert("Verification Sent", "We've sent another verification email. Please check your inbox.");
  } catch (error) {
    console.log("Error resending verification:", error);
    Alert.alert("Error", "Failed to resend verification email. Please try again.");
  }
};

const getVerificationMessage = (canResend, resendAttempts, email) => {
  if (canResend) {
    return `Please verify your email address before logging in. We sent a verification email to ${email}.`;
  } else if (resendAttempts >= 3) {
    return `Please verify your email address before logging in. You've reached the maximum resend limit. Please check your spam folder or contact support.`;
  } else {
    return `Please verify your email address before logging in. Please wait before requesting another verification email.`;
  }
};