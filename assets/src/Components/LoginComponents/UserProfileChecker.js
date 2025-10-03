// LoginComponents/UserProfileChecker.js
import { Alert } from 'react-native';
import { doc, getDoc } from "firebase/firestore";
import { db } from '../../firebaseConfig';

export const checkUserProfileCompleteAndNavigate = async (user, setIsLoading, navigation, setHasUnverifiedEmail) => {
  try {
    setIsLoading(true);
    
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if all required profile fields are complete
      const isProfileComplete = checkRequiredFields(userData);
      
      if (isProfileComplete) {
        // Clear any email verification state before navigating
        setHasUnverifiedEmail(false);
        
        // Navigate to Home
        navigation.navigate("Home");
      } else {
        // Clear any email verification state before navigating
        setHasUnverifiedEmail(false);
        
        // Navigate to profile completion form
        navigation.navigate("User_Form");
      }
    } else {
      // Clear any email verification state before navigating
      setHasUnverifiedEmail(false);
      
      // Navigate to create profile
      navigation.navigate("User_Form");
    }
  } catch (error) {
    console.error("Error checking user profile:", error);
    Alert.alert("Error", "Failed to load user profile. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

const checkRequiredFields = (userData) => {
  // Check if profile exists and has basic info
  if (!userData.profile) {
    return false;
  }

  const profile = userData.profile;
  const requiredFields = [
    'firstName',
    'lastName', 
    'birthdate'
    // Note: address is optional - users can skip location if they prefer
  ];
  
  // Check email and phone from main userData object
  if (!userData.email || !userData.phoneNumber) {
    return false;
  }
  
  const hasRequiredFields = requiredFields.every(field => {
    const value = profile[field];
    return value && value.toString().trim() !== '';
  });

  return hasRequiredFields;
};

export const handleProfileCheckError = (error, setIsLoading) => {
  console.error("Profile check error:", error);
  setIsLoading(false);
  
  Alert.alert(
    "Connection Error", 
    "Unable to verify your profile. Please check your internet connection and try again.",
    [{ text: "OK" }]
  );
};