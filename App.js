import React, { useEffect, useState } from "react";
import { Text, View, Platform } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { auth, db } from "./assets/src/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { createStackNavigator } from "@react-navigation/stack";

// Context Providers
import { UserProvider } from "./assets/src/Components/UserContext";
import { FamilyProvider } from "./assets/src/Components/FamilyContext";

// Screens
import Get_Started from "./assets/src/Screens/Get_Started";
import Create_Account from "./assets/src/Screens/Create_Account";
import Login from "./assets/src/Screens/Login";
import Forgot_Password from "./assets/src/Screens/Forgot_Password";
import Home from "./assets/src/Screens/Home";
import TermsPrivacy from "./assets/src/Screens/TermsPrivacy";
import User_Form from "./assets/src/Screens/User_Form";
import LocationSettings from "./assets/src/Screens/LocationSettings";
import BroadcastSettingsScreen from "./assets/src/Screens/BroadcastSettingsScreen";
import LocationTest from "./assets/src/Screens/LocationTest";
import EmergencyBroadcast from "./assets/src/Screens/EmergencyBroadcast";
import BroadcastFeed from "./assets/src/Screens/BroadcastFeed";
import EvacuationCenters from "./assets/src/Screens/EvacuationCenters";
import FamilyCheckIn from "./assets/src/Screens/FamilyCheckIn";
import AddFamily from "./assets/src/Screens/AddFamily";
import FamilyDetails from "./assets/src/Screens/FamilyDetails";
import Go_Bag from "./assets/src/Screens/Go_Bag";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    "CanvaSans-Regular": require("./assets/Fonts/canva-sans-regular.otf"),
    "Montserrat-Regular": require("./assets/Fonts/Montserrat-VariableFont_wght.ttf"),
  });

  const [initialRoute, setInitialRoute] = useState("GetStarted");
  const [checkingAuth, setCheckingAuth] = useState(true);

  const checkProfileComplete = async (user) => {
    try {
      console.log("Checking profile completeness for user:", user.uid);
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        console.log("User document doesn't exist, profile incomplete");
        return false;
      }

      const userData = userDoc.data();
      
      // Check if profile exists and has required fields
      if (!userData.profile) {
        console.log("No profile object found, profile incomplete");
        return false;
      }

      const profile = userData.profile;
      const requiredFields = ['firstName', 'lastName', 'birthdate'];
      
      const hasRequiredFields = requiredFields.every(field => {
        const value = profile[field];
        return value && value.toString().trim() !== '';
      });

      console.log("Profile completeness:", { hasRequiredFields, profile });
      return hasRequiredFields;
    } catch (error) {
      console.error("Error checking profile:", error);
      return false;
    }
  };

  useEffect(() => {
    let unsubscribe;
    try {
      unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("Auth state changed:", user ? "User logged in" : "User not logged in");
        
        if (user) {
          // Check if user has complete profile
          const profileComplete = await checkProfileComplete(user);
          
          if (profileComplete) {
            console.log("Profile complete, navigating to Home");
            setInitialRoute("Home");
          } else {
            console.log("Profile incomplete, navigating to User_Form");
            setInitialRoute("User_Form");
          }
        } else {
          setInitialRoute("GetStarted");
        }
        
        setCheckingAuth(false);
      });
    } catch (error) {
      console.error("Auth state change error:", error);
      setCheckingAuth(false);
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!fontsLoaded || checkingAuth) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  // Main Navigation
  return (
    <UserProvider>
      <FamilyProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={initialRoute}
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="GetStarted" component={Get_Started} />
            <Stack.Screen name="CreateAccount" component={Create_Account} />
            <Stack.Screen name="ForgotPassword" component={Forgot_Password} />
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="TermsPrivacy" component={TermsPrivacy} />
            <Stack.Screen name="User_Form" component={User_Form} />
            <Stack.Screen name="LocationSettings" component={LocationSettings} />
            <Stack.Screen name="BroadcastSettings" component={BroadcastSettingsScreen} />
            <Stack.Screen name="LocationTest" component={LocationTest} />
            <Stack.Screen name="EmergencyBroadcast" component={EmergencyBroadcast} />
            <Stack.Screen name="BroadcastFeed" component={BroadcastFeed} />
            <Stack.Screen name="EvacuationCenters" component={EvacuationCenters} />
            <Stack.Screen name="FamilyCheckIn" component={FamilyCheckIn} />
            <Stack.Screen name="AddFamily" component={AddFamily} />
            <Stack.Screen name="FamilyDetails" component={FamilyDetails} />
            <Stack.Screen name="Go_Bag" component={Go_Bag} />
          </Stack.Navigator>
        </NavigationContainer>
      </FamilyProvider>
    </UserProvider>
  );
}