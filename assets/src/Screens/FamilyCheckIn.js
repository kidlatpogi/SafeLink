import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Alert, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { useFamily } from '../Components/FamilyContext';
import styles from "../Styles/FamilyCheckIn.styles";
import Logo from "../Images/SafeLink_LOGO.png";
import HamburgerMenu from "../Components/HamburgerMenu";

export default function FamilyCheckIn({ navigation, route }) {
  const { displayName } = route.params || { displayName: "User" };
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;
  
  // Use FamilyContext for synchronized status management
  const { userStatus, updateUserStatus, familyCode } = useFamily();
  const [status, setStatus] = useState(userStatus || "Not Yet Responded");

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Hamburger menu function
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

  // Sync status with FamilyContext
  useEffect(() => {
    console.log('FamilyCheckIn - Status sync:', { userStatus, familyCode });
    setStatus(userStatus || "Not Yet Responded");
  }, [userStatus]);

  // Update status using FamilyContext for synchronized updates
  const updateStatus = async (newStatus) => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    if (!familyCode) {
      Alert.alert("Info", "You need to join or create a family first to update your status.");
      return;
    }

    console.log('FamilyCheckIn - Updating status:', { newStatus, userId, familyCode });

    try {
      // Use FamilyContext's updateUserStatus for synchronized updates
      const success = await updateUserStatus(newStatus);
      
      if (success) {
        // Also update the legacy checkInStatus for backward compatibility
        await setDoc(doc(db, "users", userId, "checkInStatus", "status"), {
          status: newStatus,
          displayName,
          updatedAt: new Date(),
        });

        setStatus(newStatus);
        Alert.alert("Status Updated", `Your status is now "${newStatus}"`);
        console.log('FamilyCheckIn - Status updated successfully:', newStatus);
      } else {
        Alert.alert("Error", "Failed to update status. Please try again.");
        console.error('FamilyCheckIn - Status update failed');
      }
    } catch (err) {
      console.error("FamilyCheckIn - Error updating status:", err);
      Alert.alert("Error", "Failed to update status. Please try again.");
    }
  };

  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case "i'm safe":
        return "#4CAF50";
      case "not yet responded":
        return "#FF9800";
      case "unknown":
        return "#9E9E9E";
      case "evacuated":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  // Get button style based on whether it's the active status
  const getButtonStyle = (buttonStatus) => {
    const isActive = status?.toLowerCase() === buttonStatus.toLowerCase();
    const baseColor = getButtonColor(buttonStatus);
    
    return {
      backgroundColor: isActive ? baseColor : '#E0E0E0',
      opacity: isActive ? 1 : 0.7,
      borderWidth: isActive ? 2 : 1,
      borderColor: isActive ? baseColor : '#BDBDBD',
    };
  };

  // Get text and icon color based on whether button is active
  const getButtonTextColor = (buttonStatus) => {
    const isActive = status?.toLowerCase() === buttonStatus.toLowerCase();
    return isActive ? 'white' : '#757575';
  };

  // Get base color for each status type
  const getButtonColor = (buttonStatus) => {
    switch (buttonStatus.toLowerCase()) {
      case "i'm safe":
        return "#4CAF50";
      case "not yet responded":
        return "#FF9800";
      case "unknown":
        return "#9E9E9E";
      case "evacuated":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={32} color="white" />
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white" }}>Safe</Text>
              <Text style={{ color: "#E82222" }}>Link</Text>
            </Text>
          </View>

          <TouchableOpacity onPress={showMenu}>
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Your Current Status:</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      {/* Status Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.sectionTitle}>Update Your Status:</Text>

        {/* I'm Safe */}
        <TouchableOpacity
          style={[styles.statusButton, getButtonStyle("I'm Safe")]}
          onPress={() => updateStatus("I'm Safe")}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="checkmark-circle" size={24} color={getButtonTextColor("I'm Safe")} />
            <Text style={[styles.buttonText, { color: getButtonTextColor("I'm Safe") }]}>
              I'm Safe
            </Text>
          </View>
        </TouchableOpacity>

        {/* Evacuated */}
        <TouchableOpacity
          style={[styles.statusButton, getButtonStyle("Evacuated")]}
          onPress={() => updateStatus("Evacuated")}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="warning" size={24} color={getButtonTextColor("Evacuated")} />
            <Text style={[styles.buttonText, { color: getButtonTextColor("Evacuated") }]}>
              Evacuated
            </Text>
          </View>
        </TouchableOpacity>

        {/* Unknown */}
        <TouchableOpacity
          style={[styles.statusButton, getButtonStyle("Unknown")]}
          onPress={() => updateStatus("Unknown")}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="help-circle" size={24} color={getButtonTextColor("Unknown")} />
            <Text style={[styles.buttonText, { color: getButtonTextColor("Unknown") }]}>
              Unknown
            </Text>
          </View>
        </TouchableOpacity>

        {/* Not Yet Responded */}
        <TouchableOpacity
          style={[styles.statusButton, getButtonStyle("Not Yet Responded")]}
          onPress={() => updateStatus("Not Yet Responded")}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="time" size={24} color={getButtonTextColor("Not Yet Responded")} />
            <Text style={[styles.buttonText, { color: getButtonTextColor("Not Yet Responded") }]}>
              Not Yet Responded
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instructions:</Text>
        <Text style={styles.instructionsText}>
          • Select your current safety status{'\n'}
          • Your family members will see your status update{'\n'}
          • Update regularly during emergencies{'\n'}
          • Contact authorities if you need immediate help
        </Text>
      </View>

      {/* Hamburger Menu */}
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