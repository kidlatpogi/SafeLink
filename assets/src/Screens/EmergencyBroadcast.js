import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, updateDoc, arrayUnion } from "firebase/firestore";
import * as Location from "expo-location";
import useLocation from "../Components/useLocation";
import { useUser } from "../Components/UserContext";
import HamburgerMenu from "../Components/HamburgerMenu";
import styles from "../Styles/EmergencyBroadcast.styles";

export default function EmergencyBroadcast({ navigation }) {
  const { 
    userId, 
    displayName, 
    email, 
    isVerifiedOfficial, 
    canBroadcast, 
    officialRole, 
    barangayAssignment 
  } = useUser();
  
  // Use optimized location with emergency mode for high accuracy
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    refreshLocation 
  } = useLocation({
    enableTracking: true,
    emergencyMode: true,
  });

  // State variables
  const [coordinates, setCoordinates] = useState("Detecting...");
  const [location, setLocation] = useState("Detecting...");
  const [barangay, setBarangay] = useState("Detecting...");
  const [alertType, setAlertType] = useState("Emergency Alert");
  const [message, setMessage] = useState("");
  const [showAlertOptions, setShowAlertOptions] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [userAdminLocation, setUserAdminLocation] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Alert type options with enhanced design
  const alertTypes = [
    { 
      icon: "exclamation-triangle", 
      iconLibrary: "FontAwesome5",
      label: "Emergency Alert", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "General emergency situation"
    },
    { 
      icon: "wind", 
      iconLibrary: "FontAwesome5",
      label: "Typhoon Warning", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Severe weather alert"
    },
    { 
      icon: "water", 
      iconLibrary: "FontAwesome5",
      label: "Flood Warning", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Flood risk in area"
    },
    { 
      icon: "fire", 
      iconLibrary: "FontAwesome5",
      label: "Fire Alert", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Fire emergency"
    },
    { 
      icon: "home", 
      iconLibrary: "FontAwesome5",
      label: "Earthquake", 
      color: "#FF6F00",
      bgColor: "#F5F5DC",
      description: "Seismic activity alert"
    },
    { 
      icon: "heartbeat", 
      iconLibrary: "FontAwesome5",
      label: "Medical Emergency", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Medical assistance needed"
    },
    { 
      icon: "bolt", 
      iconLibrary: "FontAwesome5",
      label: "Power Outage", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Electrical service disruption"
    },
    { 
      icon: "shield", 
      iconLibrary: "FontAwesome5",
      label: "Security Alert", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Security concern"
    },
    { 
      icon: "bullhorn", 
      iconLibrary: "FontAwesome5",
      label: "General Announcement", 
      color: "#FF6F00",
      bgColor: "#FFF4E5",
      description: "Important community notice"
    },
  ];

  // Reverse geocode location to get address details
  const reverseGeocodeLocation = async (locationData) => {
    if (!locationData || isReverseGeocoding) return;
    
    setIsReverseGeocoding(true);
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: locationData.latitude,
        longitude: locationData.longitude
      });

      if (address && address.length > 0) {
        const place = address[0];
        const cityName = place.city || place.subregion || place.region || "Unknown City";
        setLocation(cityName);
        setBarangay(place.district || place.subregion || place.name || "Unknown Barangay");
      }
    } catch (err) {
      setLocation("Unknown City");
      setBarangay("Unknown Barangay");
    } finally {
      setIsReverseGeocoding(false);
    }
  };

  // Initialize location data when userLocation becomes available
  useEffect(() => {
    if (userLocation && coordinates === "Detecting...") {
      setCoordinates(`${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`);
      reverseGeocodeLocation(userLocation);
    }
  }, [userLocation]);

  // Handle broadcast submission
  const handleBroadcast = async () => {
    // Check official verification first
    if (!isVerifiedOfficial || !canBroadcast) {
      Alert.alert(
        "🚫 Access Denied",
        "Only verified barangay officials can send emergency broadcasts. Please complete the official verification process.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Verify Now", onPress: () => navigation.navigate('OfficialVerification') }
        ]
      );
      return;
    }

    if (!message.trim()) {
      Alert.alert("⚠️ Missing Message", "Please enter a message to broadcast.");
      return;
    }

    if (isBroadcasting) return;

    try {
      setIsBroadcasting(true);
      
      // Get current user info safely
      const currentUser = auth.currentUser;
      const broadcasterName = displayName || 
                            currentUser?.displayName || 
                            currentUser?.email?.split('@')[0] || 
                            'Anonymous User';
      
      const broadcastData = {
        location,
        barangay,
        alertType,
        message: message.trim(),
        emergencyType: alertType.split(' ')[0].toLowerCase(),
        createdAt: serverTimestamp(),
        broadcasterName,
        broadcasterId: currentUser?.uid || 'anonymous',
        // Official verification data
        isOfficialBroadcast: true,
        officialRole,
        barangayAssignment,
        // Seen counter functionality
        seenBy: [], // Array of user IDs who have seen this broadcast
        seenCount: 0,
        seenDetails: {}, // Object mapping userId to timestamp when they saw it
        // Analytics
        deliveredCount: 0,
        targetRadius: 10, // km - can be made configurable
      };

      // Add coordinates if available
      if (userLocation) {
        broadcastData.coordinates = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        };
      }

      // Add administrative location if available
      if (userAdminLocation) {
        broadcastData.administrativeLocation = userAdminLocation;
      }

      const docRef = await addDoc(collection(db, "broadcasts"), broadcastData);

      console.log("Emergency broadcast posted successfully");

      Alert.alert(
        "✅ Official Broadcast Sent", 
        `Your emergency message has been sent as ${officialRole?.replace('_', ' ')} of ${typeof barangayAssignment === 'object' 
          ? `${barangayAssignment.barangay}, ${barangayAssignment.municipality}, ${barangayAssignment.province}` 
          : barangayAssignment}.\n\nBroadcast ID: ${docRef.id}`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      setMessage("");
    } catch (error) {
      Alert.alert("❌ Error", "Failed to send broadcast. Please try again.");
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Get the current alert type details
  const getCurrentAlertType = () => {
    return alertTypes.find(type => type.label === alertType) || alertTypes[0];
  };

  // Hamburger menu functions
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

  const currentAlert = getCurrentAlertType();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF6F00" barStyle="light-content" />
      
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={32} color="white" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={require('../Images/SafeLink_LOGO.png')} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Safe</Text>
              <Text style={{ color: "#E82222", fontWeight: "bold", fontSize: 18 }}>Link</Text>
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.hamburgerButton}
            onPress={showMenu}
          >
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="megaphone" size={24} color="#FF6F00" />
        <Text style={styles.title}>Emergency Broadcast</Text>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          
          {/* Official Verification Status */}
          {isVerifiedOfficial ? (
            <View style={styles.officialCard}>
              <View style={styles.officialHeader}>
                <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
                <Text style={styles.officialTitle}>Verified Official</Text>
              </View>
              <Text style={styles.officialRole}>
                {officialRole?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={styles.officialBarangay}>
                {typeof barangayAssignment === 'object' 
                  ? `${barangayAssignment.barangay}, ${barangayAssignment.municipality}, ${barangayAssignment.province}` 
                  : barangayAssignment}
              </Text>
              <View style={styles.officialBadge}>
                <Ionicons name="megaphone" size={16} color="#4CAF50" />
                <Text style={styles.officialBadgeText}>Authorized to Broadcast</Text>
              </View>
            </View>
          ) : (
            <View style={styles.warningCard}>
              <View style={styles.warningHeader}>
                <Ionicons name="warning" size={24} color="#F44336" />
                <Text style={styles.warningTitle}>Verification Required</Text>
              </View>
              <Text style={styles.warningDescription}>
                Only verified barangay officials can send emergency broadcasts.
              </Text>
              <TouchableOpacity 
                style={styles.verifyButton}
                onPress={() => navigation.navigate('OfficialVerification')}
              >
                <Ionicons name="shield-checkmark" size={20} color="white" />
                <Text style={styles.verifyButtonText}>Apply for Verification</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* Location Information Card */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FF6F00' }]}>
                <Ionicons name="location" size={18} color="white" />
              </View>
              <Text style={styles.sectionTitle}>Current Location</Text>
            </View>
            
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>City:</Text>
              <Text style={styles.locationText}>
                {isReverseGeocoding ? "Loading..." : location}
              </Text>
            </View>
            
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Barangay:</Text>
              <Text style={styles.locationText}>
                {isReverseGeocoding ? "Loading..." : barangay}
              </Text>
            </View>
            
            <View style={styles.locationRow}>
              <Text style={styles.locationLabel}>Coordinates:</Text>
              <Text style={styles.locationText}>{coordinates}</Text>
            </View>

            {locationLoading && (
              <View style={styles.locationRow}>
                <ActivityIndicator size="small" color="#FF6F00" />
                <Text style={[styles.locationText, { marginLeft: 8 }]}>
                  Getting precise location...
                </Text>
              </View>
            )}

            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshLocation}
              disabled={locationLoading}
            >
              <Ionicons name="refresh" size={16} color="white" />
              <Text style={styles.refreshButtonText}>Refresh Location</Text>
            </TouchableOpacity>
          </View>

          {/* Alert Type Selection Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.inputLabel}>Alert Type</Text>
            
            <TouchableOpacity 
              style={[styles.alertSelector, { borderColor: currentAlert.color }]}
              onPress={() => setShowAlertOptions(true)}
            >
              <View style={[styles.alertIconContainer, { backgroundColor: currentAlert.color }]}>
                <FontAwesome5 name={currentAlert.icon} size={18} color="white" />
              </View>
              <View style={styles.alertTypeContent}>
                <Text style={[styles.alertTypeText, { color: currentAlert.color }]}>{currentAlert.label}</Text>
                <Text style={styles.alertDescription}>{currentAlert.description}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} style={styles.dropdownIcon} />
            </TouchableOpacity>
          </View>

          {/* Message Input Card */}
          <View style={styles.sectionCard}>
            <Text style={styles.inputLabel}>Emergency Message</Text>
            
            <TextInput
              style={[styles.messageInput, { 
                borderColor: message.length > 450 ? '#EF4444' : '#e9ecef',
              }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe the emergency situation in detail. Include location specifics, severity, and any immediate actions needed..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              maxLength={500}
            />
            <Text style={[styles.characterCount, { 
              color: message.length > 450 ? '#EF4444' : '#6c757d' 
            }]}>
              {message.length}/500 characters
            </Text>

            {/* Broadcast Button */}
            <TouchableOpacity
              style={[
                styles.broadcastButton,
                (isBroadcasting || !message.trim()) && styles.broadcastButtonDisabled
              ]}
              onPress={handleBroadcast}
              disabled={isBroadcasting || !message.trim()}
            >
              {isBroadcasting && (
                <ActivityIndicator 
                  size="small" 
                  color="white" 
                  style={styles.loadingIndicator}
                />
              )}
              <Ionicons name="megaphone" size={18} color="white" />
              <Text style={styles.broadcastButtonText}>
                {isBroadcasting ? 'Sending Alert...' : 'Send Emergency Alert'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Enhanced Alert Type Selection Modal */}
      <Modal
        visible={showAlertOptions}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAlertOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Alert Type</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowAlertOptions(false)}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              {alertTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.alertOption,
                    alertType === type.label && styles.alertOptionSelected,
                  ]}
                  onPress={() => {
                    setAlertType(type.label);
                    setShowAlertOptions(false);
                  }}
                >
                  <View style={[styles.alertOptionIcon, { backgroundColor: type.color }]}>
                    <FontAwesome5 name={type.icon} size={16} color="white" />
                  </View>
                  <View style={styles.alertOptionContent}>
                    <Text style={[styles.alertOptionTitle, { color: type.color }]}>
                      {type.label}
                    </Text>
                    <Text style={styles.alertOptionDesc}>{type.description}</Text>
                  </View>
                  {alertType === type.label && (
                    <Ionicons name="checkmark" size={20} color={type.color} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hamburger Menu */}
      <HamburgerMenu
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}