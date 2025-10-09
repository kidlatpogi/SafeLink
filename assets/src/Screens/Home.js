import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Animated, Dimensions } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import styles from "../Styles/Home.styles";

// Import components
import AppHeader from "../Components/AppHeader";
import HomeContent from "../Components/HomeContent";
import LocationManager from "../Components/LocationManager";
import LocationStatus from "../Components/LocationStatus";

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Use displayName if available, otherwise use first part of email, or fallback to "User"
        if (currentUser.displayName) {
          setDisplayName(currentUser.displayName);
        } else if (currentUser.email) {
          // Extract name from email (part before @)
          const emailName = currentUser.email.split('@')[0];
          // Capitalize first letter
          const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
          setDisplayName(formattedName);
        } else {
          setDisplayName("User");
        }
      } else {
        setUser(null);
        setDisplayName("User");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <LocationManager />
      
      <ScrollView style={styles.container}>
        <AppHeader showBack={false} backgroundColor="#FF6F00" showLogo={true} navigation={navigation} />
        <LocationStatus styles={styles} />
        <HomeContent displayName={displayName} navigation={navigation} />
      </ScrollView>
    </View>
  );
}