import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

const HamburgerMenu = ({ 
  menuVisible, 
  setMenuVisible, 
  slideAnim, 
  opacityAnim, 
  navigation 
}) => {
  const screenHeight = Dimensions.get('window').height;

  const hideMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -280,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMenuVisible(false);
    });
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(auth);
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }]
              });
            } catch (error) {
              Alert.alert("Error", "Failed to logout. Please try again.");
              console.error("Logout error:", error);
            }
          }
        }
      ]
    );
  };

  if (!menuVisible) return null;

  return (
    <View style={styles.menuOverlay}>
      <Animated.View 
        style={[
          styles.menuBackdrop,
          {
            opacity: opacityAnim,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.menuBackdropTouchable}
          onPress={hideMenu}
        />
      </Animated.View>
      <Animated.View 
        style={[
          styles.menuContainer,
          {
            height: screenHeight,
            transform: [{ translateX: slideAnim }],
          }
        ]}
      >
        <LinearGradient
          colors={["#eb4b3f", "#f0945b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.menuGradient, { height: screenHeight }]}
        >
          {/* Menu Header */}
          <View style={styles.menuHeader}>
            <Text style={styles.menuTitle}>Menu</Text>
            <TouchableOpacity
              style={styles.menuClose}
              onPress={hideMenu}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.menuContent}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                hideMenu();
                navigation.navigate("User_Form");
              }}
            >
              <Ionicons name="person-circle-outline" size={24} color="#fff" />
              <Text style={styles.menuText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                hideMenu();
                navigation.navigate("LocationSettings");
              }}
            >
              <Ionicons name="location-outline" size={24} color="#fff" />
              <Text style={styles.menuText}>Location Settings</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                hideMenu();
                handleLogout();
              }}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
              <Text style={styles.menuText}>Logout</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animated.View>
    </View>
  );
};

// Import styles from Home.styles.js
import styles from '../Styles/Home.styles';

export default HamburgerMenu;