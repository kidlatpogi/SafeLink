import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Location from "expo-location";
import styles from "../Styles/EmergencyBroadcast.styles";
import Logo from "../Images/SafeLink_LOGO.png";

export default function EmergencyBroadcast({ navigation }) {
  const [location, setLocation] = useState("Detecting...");
  const [barangay, setBarangay] = useState("Detecting...");
  const [alertType, setAlertType] = useState("Typhoon Warning");
  const [message, setMessage] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(true);
  const [showAlertOptions, setShowAlertOptions] = useState(false);

  const alertTypes = [
    "Typhoon Warning",
    "Flood Alert",
    "Earthquake Advisory",
    "Storm Surge Warning",
    "Tsunami Advisory",
    "Landslide Warning",
    "Volcanic Eruption Alert",
    "Extreme Heat Advisory",
    "Severe Wind Warning",
    "Heavy Rainfall Advisory",
  ];

  // 🔹 Detect GPS immediately and reverse geocode in background
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "Location access is needed for broadcasting."
        );
        setLocation("Unknown");
        setBarangay("Unknown");
        setLoadingLocation(false);
        return;
      }

      // Watch position
      Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (loc) => {
          // Show GPS coordinates immediately
          setLocation(
            `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`
          );

          // Reverse geocode only if barangay not yet detected
          if (barangay === "Detecting...") {
            try {
              const address = await Location.reverseGeocodeAsync(loc.coords);
              if (address.length > 0) {
                let place = address[0];
                setBarangay(
                  place.district || place.subregion || place.name || "Unknown Barangay"
                );
              }
            } catch (err) {
              console.log("Reverse geocode failed:", err);
              setBarangay("Unknown Barangay");
            } finally {
              setLoadingLocation(false);
            }
          } else {
            setLoadingLocation(false);
          }
        }
      );
    })();
  }, []);

  // 🔹 Broadcast Message to Firestore
  const broadcast = async () => {
    if (!message.trim()) {
      Alert.alert("⚠️ Empty Message", "Please write a message to broadcast.");
      return;
    }

    try {
      await addDoc(collection(db, "broadcasts"), {
        location,
        barangay,
        alertType,
        message,
        createdAt: serverTimestamp(),
      });

      Alert.alert("✅ Broadcast Sent", "Message was sent to all users.");
      setMessage(""); // reset input
    } catch (error) {
      console.error("Error sending broadcast: ", error);
      Alert.alert("❌ Error", "Failed to send broadcast.");
    }
  };

  // 🔹 Render Alert Type Dropdown Item
  const renderOption = (item, onSelect) => (
    <TouchableOpacity
      style={styles.optionItem}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.optionText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white" }}>Safe</Text>
              <Text style={{ color: "#E82222" }}>Link</Text>
            </Text>
          </View>

          <View style={styles.backBtn}>
            <Ionicons name="person-circle" size={32} color="white" />
          </View>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="megaphone" size={24} color="#E65100" />
        <Text style={styles.title}>Emergency Broadcast</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <View style={styles.selector}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color="orange" />
          ) : (
            <Text style={styles.selectorText}>{location}</Text>
          )}
        </View>

        {/* Barangay */}
        <Text style={styles.label}>Barangay</Text>
        <View style={styles.selector}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color="orange" />
          ) : (
            <Text style={styles.selectorText}>{barangay}</Text>
          )}
        </View>

        {/* Alert Type */}
        <Text style={styles.label}>Alert Type</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowAlertOptions((s) => !s)}
        >
          <Text style={styles.selectorText}>{alertType}</Text>
          <Ionicons name={showAlertOptions ? "chevron-up" : "chevron-down"} size={18} />
        </TouchableOpacity>

        {showAlertOptions && (
          <View
            style={[
              styles.optionsBox,
              { maxHeight: 3 * 40 }, // show only 3 items, scrollable if more
            ]}
          >
            <FlatList
              data={alertTypes}
              keyExtractor={(i) => i}
              renderItem={({ item }) =>
                renderOption(item, (val) => {
                  setAlertType(val);
                  setShowAlertOptions(false);
                })
              }
            />
          </View>
        )}

        {/* Message */}
        <Text style={styles.label}>Message</Text>
        <TextInput
          style={[styles.input, styles.messageInput]}
          multiline
          value={message}
          onChangeText={setMessage}
          textAlignVertical="top"
          placeholder="Write a broadcast message..."
          placeholderTextColor="#888"
        />

        {/* Broadcast Button */}
        <TouchableOpacity style={styles.broadcastButton} onPress={broadcast}>
          <Text style={styles.broadcastText}>BROADCAST MESSAGE</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
