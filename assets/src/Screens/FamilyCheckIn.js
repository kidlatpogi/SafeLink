import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import styles from "../Styles/FamilyCheckIn.styles";
import Logo from "../Images/SafeLink_LOGO.png";

export default function FamilyCheckIn({ navigation, route }) {
  const { displayName } = route.params || { displayName: "User" };
  const userId = auth.currentUser?.uid;
  const [status, setStatus] = useState("Not Yet Responded");

  // 🔹 Listen for real-time updates of your own status
  useEffect(() => {
    if (!userId) return;

    const statusRef = doc(db, "users", userId, "checkInStatus", "status");

    const unsubscribe = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) {
        setStatus(docSnap.data().status);
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // 🔹 Update your status in Firestore
  const updateStatus = async (newStatus) => {
    if (!userId) return;

    try {
      await setDoc(doc(db, "users", userId, "checkInStatus", "status"), {
        status: newStatus,
        displayName,
        updatedAt: new Date(),
      });
      setStatus(newStatus); // locally as fallback
      Alert.alert("Status Updated", `Your status is now "${newStatus}"`);
    } catch (err) {
      console.log("Error updating status:", err);
      Alert.alert("Error", "Failed to update status.");
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color="white" />
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white" }}>Safe</Text>
              <Text style={{ color: "#E82222" }}>Link</Text>
            </Text>
          </View>

          <View style={{ padding: 6, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person-circle" size={32} color="white" />
          </View>
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
          style={[styles.optionButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => updateStatus("I'm Safe")}
        >
          <Ionicons name="checkmark" size={20} color="white" />
          <Text style={styles.optionText}>I'm Safe</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: "#FF9800" }]}
          onPress={() => updateStatus("Not Yet Responded")}
        >
          <Ionicons name="hourglass" size={20} color="white" />
          <Text style={styles.optionText}>Not Yet Responded</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: "#9E9E9E" }]}
          onPress={() => updateStatus("Unknown")}
        >
          <Ionicons name="help" size={20} color="white" />
          <Text style={styles.optionText}>Unknown</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: "#F44336" }]}
          onPress={() => updateStatus("Evacuated")}
        >
          <Ionicons name="flag" size={20} color="white" />
          <Text style={styles.optionText}>Evacuated</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
