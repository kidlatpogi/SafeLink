import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { auth, db } from '../firebaseConfig';
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

import styles from '../Styles/Create_Account.styles'; // Reusing styles

// Enhanced styles for the professional header
const enhancedStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6F00',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
});

// Import components
import UserFormHeader from '../Components/UserFormHeader';
import NameInputs from '../Components/NameInputs';
import PhoneInput from '../Components/PhoneInput';
import LocationPicker from '../Components/LocationPicker';
import PhilippineAddressSelector from '../Components/PhilippineAddressSelector';
import HamburgerMenu from '../Components/HamburgerMenu';
// import LocationSettings from '../Components/LocationSettings'; // Temporarily disabled
import BirthdatePicker from '../Components/BirthdatePicker';
import InfoBox from '../Components/InfoBox';
import UserFormActions from '../Components/UserFormActions';

export default function User_Form({ navigation, route }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("09");
  const [address, setAddress] = useState("");
  const [coordinates, setCoordinates] = useState(null);
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Animation values for hamburger menu
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  // Administrative location state
  const [administrativeLocation, setAdministrativeLocation] = useState({
    region: '',
    province: '',
    municipality: '',
    barangay: ''
  });

  // Check if this is edit mode (coming from hamburger menu) or first-time setup
  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            // User has existing profile - this is edit mode
            setIsEditMode(true);
            const userData = userDoc.data();
            const profile = userData.profile || {};
            
            // Pre-populate form with existing data
            setFirstName(profile.firstName || "");
            setLastName(profile.lastName || "");
            setPhoneNumber(userData.phoneNumber || "09");
            setAddress(profile.address || "");
            
            // Handle coordinates if available
            if (profile.coordinates) {
              setCoordinates(profile.coordinates);
            }
            
            // Handle administrative location
            if (profile.administrativeLocation) {
              setAdministrativeLocation(profile.administrativeLocation);
            }
            
            // Handle broadcast settings
            
            // Handle birthdate
            if (profile.birthdate) {
              const birthdateFromDB = new Date(profile.birthdate);
              if (!isNaN(birthdateFromDB.getTime())) {
                setBirthdate(birthdateFromDB);
              }
            }
            
            console.log("Edit mode: Pre-populated form with existing data");
          } else {
            // No existing profile - this is first-time setup
            setIsEditMode(false);
            console.log("First-time setup mode");
          }
        }
      } catch (error) {
        console.log("Error checking existing profile:", error);
        setIsEditMode(false);
      }
    };

    checkExistingProfile();
  }, []);

  const showMenu = () => {
    setIsMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSaveProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Error", "First name and last name are required");
      return;
    }

    if (!phoneNumber.trim() || phoneNumber === "09") {
      Alert.alert("Error", "Please enter a valid phone number");
      return;
    }

    // Validate phone number format (Philippine mobile numbers)
    const phoneRegex = /^09[0-9]{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      Alert.alert("Error", "Please enter a valid Philippine phone number (e.g., 09123456789)");
      return;
    }

    // Address is optional - users can skip if they don't want to provide location
    // if (!address.trim()) {
    //   Alert.alert("Error", "Address is required");
    //   return;
    // }

    // Birthdate validation - ensure it's not today's date (should be in the past)
    const today = new Date();
    if (birthdate >= today) {
      Alert.alert("Error", "Please select a valid birthdate in the past");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const user = auth.currentUser;
      if (user) {
        const displayName = `${firstName} ${lastName}`;
        
        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: displayName,
        });

        // Create user document in Firestore following your structure
        const userDocRef = doc(db, 'users', user.uid);
        
        // Prepare user data - conditionally include createdAt only for new profiles
        const userData = {
          displayName: displayName,
          email: user.email,
          emailVerified: user.emailVerified,
          isAuth: true,
          phoneNumber: phoneNumber,
          profile: {
            address: address || "", // Allow empty address
            coordinates: coordinates, // Store precise GPS coordinates (can be null)
            birthdate: birthdate.toISOString().split('T')[0], // Format as YYYY-MM-DD
            firstName: firstName,
            lastName: lastName,
            role: "family_member", // Default role
            profilePhoto: "",
            administrativeLocation: administrativeLocation // Store country, province, municipality, barangay
          },
          userId: user.uid,
          updatedAt: new Date().toLocaleString() // Track when profile was last updated
        };

        // Only add createdAt for new profiles (not in edit mode)
        if (!isEditMode) {
          userData.createdAt = new Date().toLocaleString();
        }
        
        // Use merge option to preserve existing data and avoid potential conflicts
        await setDoc(userDocRef, userData, { merge: true });

        // Store profile completion status in AsyncStorage
        await AsyncStorage.setItem('userProfile', JSON.stringify({
          profileCompleted: true,
          completedAt: new Date().toISOString()
        }));

        console.log("User profile created in Firestore:", {
          uid: user.uid,
          displayName: displayName,
          phoneNumber: phoneNumber
        });

        console.log("Profile save successful, navigating...", { isEditMode, userId: user.uid });

        // Navigate to Home
        Alert.alert(
          isEditMode ? "Profile Updated" : "Profile Completed", 
          isEditMode ? "Your profile has been updated successfully." : "Welcome to SafeLink! Your profile has been set up successfully.",
          [
            {
              text: "Continue",
              onPress: () => {
                try {
                  console.log("Navigation triggered", { isEditMode });
                  
                  // Small delay to ensure Firestore update is processed
                  setTimeout(() => {
                    try {
                      if (isEditMode) {
                        console.log("Going back to Home (edit mode)");
                        navigation.goBack(); // Go back to Home if editing
                      } else {
                        console.log("Resetting navigation to Home (first-time setup)");
                        navigation.reset({
                          index: 0,
                          routes: [{ name: "Home" }],
                        }); // Reset navigation if first-time setup
                      }
                    } catch (innerNavError) {
                      console.error("Inner navigation error:", innerNavError);
                      navigation.navigate("Home");
                    }
                  }, 500); // 500ms delay
                  
                } catch (navError) {
                  console.error("Navigation error:", navError);
                  // Fallback navigation
                  navigation.navigate("Home");
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log("Profile update error:", error);
      setError("Failed to save profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneNumberChange = (text) => {
    // Ensure the phone number always starts with 09
    if (!text.startsWith("09")) {
      setPhoneNumber("09");
    } else {
      // Remove any non-digit characters
      const cleaned = text.replace(/[^\d]/g, '');
      if (cleaned.startsWith("09")) {
        setPhoneNumber(cleaned);
      } else {
        setPhoneNumber("09");
      }
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || birthdate;
    setShowDatePicker(Platform.OS === 'ios');
    setBirthdate(currentDate);
  };

  const showDatePickerHandler = () => {
    setShowDatePicker(true);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Enhanced Header */}
      <View style={enhancedStyles.header}>
        <TouchableOpacity 
          style={enhancedStyles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={32} color="#fff" />
        </TouchableOpacity>
        
        <View style={enhancedStyles.headerCenter}>
          <Text style={enhancedStyles.headerTitle}>
            {isEditMode ? 'Edit Profile' : 'Complete Profile'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={enhancedStyles.headerButton}
          onPress={showMenu}
        >
          <Ionicons name="menu" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ marginTop: 20 }}>
            <NameInputs 
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              styles={styles}
            />

            <PhoneInput 
              phoneNumber={phoneNumber}
              handlePhoneNumberChange={handlePhoneNumberChange}
              styles={styles}
            />

            <LocationPicker 
              address={address}
              setAddress={setAddress}
              coordinates={coordinates}
              setCoordinates={setCoordinates}
              styles={styles}
            />

            <PhilippineAddressSelector
              onLocationChange={setAdministrativeLocation}
              initialRegion={administrativeLocation.region}
              initialProvince={administrativeLocation.province}
              initialCity={administrativeLocation.municipality}
              initialBarangay={administrativeLocation.barangay}
              coordinates={coordinates}
            />

            {/* <LocationSettings styles={styles} /> */}

            <BirthdatePicker 
              birthdate={birthdate}
              showDatePicker={showDatePicker}
              showDatePickerHandler={showDatePickerHandler}
              onDateChange={onDateChange}
              styles={styles}
            />

            <InfoBox />

            <UserFormActions 
              error={error}
              isLoading={isLoading}
              handleSaveProfile={handleSaveProfile}
              isEditMode={isEditMode}
              navigation={navigation}
              styles={styles}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <HamburgerMenu 
        menuVisible={isMenuVisible}
        setMenuVisible={setIsMenuVisible}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        navigation={navigation}
      />
    </View>
  );
}
