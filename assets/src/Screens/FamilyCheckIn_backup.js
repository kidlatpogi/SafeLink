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

export default function FamilyCheckIn({ navigation, route }) {
  const { displayName } = route.params || { displayName: "User" };
  const userId = auth.currentUser?.uid;
  const userEmail = auth.currentUser?.email;
  const [status, setStatus] = useState("Not Yet Responded");
  const [familyId, setFamilyId] = useState(null);

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
    setStatus(userStatus || "Not Yet Responded");
  }, [userStatus]);

  // Update status using FamilyContext for synchronized updates
  const updateStatus = async (newStatus) => {
    if (!userId) return;

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
      } else {
        Alert.alert("Error", "Failed to update status. Please try again.");
      }
    } catch (err) {
      console.error("Error updating status:", err);
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

      {/* Title Row */}
      <View style={styles.titleRow}>
        <Ionicons name="people-circle" size={24} color="#FF6F00" />
        <Text style={styles.title}>Family Check-In</Text>
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        {/* Use a more visually appealing icon from Ionicons */}
        <View style={[styles.profilePic, { borderColor: getStatusColor(), alignItems: "center", justifyContent: "center", backgroundColor: "#f5f5f5" }]}>
          <Ionicons name="person-circle-outline" size={72} color={getStatusColor()} />
        </View>
        <Text style={styles.memberName}>{displayName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>Current Status: {status}</Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.optionButton, getButtonStyle("I'm Safe")]}
          onPress={() => updateStatus("I'm Safe")}
        >
          <Ionicons name="checkmark" size={20} color={getButtonTextColor("I'm Safe")} />
          <Text style={[styles.optionText, { color: getButtonTextColor("I'm Safe") }]}>I'm Safe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, getButtonStyle("Not Yet Responded")]}
          onPress={() => updateStatus("Not Yet Responded")}
        >
          <Ionicons name="hourglass" size={20} color={getButtonTextColor("Not Yet Responded")} />
          <Text style={[styles.optionText, { color: getButtonTextColor("Not Yet Responded") }]}>Not Yet Responded</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, getButtonStyle("Unknown")]}
          onPress={() => updateStatus("Unknown")}
        >
          <Ionicons name="help" size={20} color={getButtonTextColor("Unknown")} />
          <Text style={[styles.optionText, { color: getButtonTextColor("Unknown") }]}>Unknown</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, getButtonStyle("Evacuated")]}
          onPress={() => updateStatus("Evacuated")}
        >
          <Ionicons name="flag" size={20} color={getButtonTextColor("Evacuated")} />
          <Text style={[styles.optionText, { color: getButtonTextColor("Evacuated") }]}>Evacuated</Text>
        </TouchableOpacity>
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
