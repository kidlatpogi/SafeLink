import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, Animated, Dimensions } from "react-native";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import styles from "../Styles/Home.styles";

// Import components
import HomeHeader from "../Components/HomeHeader";
import HomeContent from "../Components/HomeContent";
import HamburgerMenu from "../Components/HamburgerMenu";
import LocationManager from "../Components/LocationManager";
import LocationStatus from "../Components/LocationStatus";

export default function Home({ navigation }) {
  const [user, setUser] = useState(null);
  const [displayName, setDisplayName] = useState("User");
  const [menuVisible, setMenuVisible] = useState(false);

  // Animation values
  const slideAnim = useRef(new Animated.Value(-280)).current; // Start off-screen (left)
  const opacityAnim = useRef(new Animated.Value(0)).current; // Start transparent
  const screenHeight = Dimensions.get('window').height;

  // Animation function
  const showMenu = () => {
    setMenuVisible(true);
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
        <HomeHeader showMenu={showMenu} />
        <LocationStatus styles={styles} />
        <HomeContent displayName={displayName} navigation={navigation} />
      </ScrollView>

      <HamburgerMenu 
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        navigation={navigation}
      />
    </View>
  );
}