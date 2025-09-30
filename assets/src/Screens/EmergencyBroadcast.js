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
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Animated,
} from "react-native";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import * as Location from "expo-location";
import useOptimizedLocation from "../Components/useOptimizedLocation";
import HamburgerMenu from "../Components/HamburgerMenu";

const { width, height } = Dimensions.get('window');

export default function EmergencyBroadcast({ navigation }) {
  // Use optimized location with emergency mode for high accuracy
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    refreshLocation 
  } = useOptimizedLocation({
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
      icon: "alert-triangle", 
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
      icon: "shield-alt", 
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
      console.log("Reverse geocode failed:", err);
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
    if (!message.trim()) {
      Alert.alert("⚠️ Missing Message", "Please enter a message to broadcast.");
      return;
    }

    if (isBroadcasting) return;

    try {
      setIsBroadcasting(true);
      
      // Get current user info safely
      const currentUser = auth.currentUser;
      const broadcasterName = currentUser?.displayName || 
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

      await addDoc(collection(db, "broadcasts"), broadcastData);

      Alert.alert("✅ Broadcast Sent", "Your emergency message has been sent to all users in the area.");
      setMessage("");
    } catch (error) {
      console.error("Error sending broadcast: ", error);
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

  // Enhanced Styles
  const styles = {
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    header: {
      backgroundColor: '#FF6F00',
      paddingTop: Platform.OS === 'android' ? 50 : 50,
      paddingBottom: 16,
      paddingHorizontal: 16,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    logoWrapper: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
    },
    logoImage: {
      width: 32,
      height: 32,
      marginRight: 8,
    },
    logo: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
    },
    hamburgerButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      color: 'white',
      fontSize: 20,
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
    },
    scrollContent: {
      flex: 1,
      padding: 16,
      paddingBottom: 100,
    },
    sectionCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    sectionIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    locationLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: '#666',
      width: 80,
    },
    locationText: {
      fontSize: 14,
      color: '#333',
      flex: 1,
      fontWeight: '500',
    },
    refreshButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF6F00',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    refreshButtonText: {
      color: 'white',
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '500',
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 8,
    },
    alertSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f8f9fa',
      borderWidth: 1,
      borderColor: '#e9ecef',
      borderRadius: 10,
      padding: 16,
      marginBottom: 16,
    },
    alertIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    alertTypeContent: {
      flex: 1,
    },
    alertTypeText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 2,
    },
    alertDescription: {
      fontSize: 12,
      color: '#666',
    },
    dropdownIcon: {
      color: '#666',
    },
    messageInput: {
      borderWidth: 1,
      borderColor: '#e9ecef',
      borderRadius: 10,
      padding: 16,
      fontSize: 16,
      color: '#333',
      backgroundColor: '#f8f9fa',
      textAlignVertical: 'top',
      minHeight: 120,
      marginBottom: 8,
    },
    characterCount: {
      fontSize: 12,
      color: '#6c757d',
      textAlign: 'right',
      marginBottom: 16,
    },
    broadcastButton: {
      backgroundColor: '#FF6F00',
      borderRadius: 10,
      paddingVertical: 16,
      paddingHorizontal: 24,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 3,
      shadowColor: '#FF6F00',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      marginBottom: 20,
    },
    broadcastButtonDisabled: {
      backgroundColor: '#BDBDBD',
      elevation: 0,
      shadowOpacity: 0,
    },
    broadcastButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    loadingIndicator: {
      marginRight: 8,
    },
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 20,
      width: width - 40,
      maxHeight: height * 0.8,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      flex: 1,
    },
    closeButton: {
      backgroundColor: '#6c757d',
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 8,
      alignSelf: 'center',
      marginTop: 16,
    },
    closeButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
    },
    alertOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#f1f3f4',
    },
    alertOptionSelected: {
      backgroundColor: '#FFF3E0',
    },
    alertOptionIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    alertOptionContent: {
      flex: 1,
    },
    alertOptionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: '#333',
      marginBottom: 2,
    },
    alertOptionDesc: {
      fontSize: 12,
      color: '#666',
    },
  };

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
            <Text style={styles.logo}>SafeLink</Text>
          </View>
          <TouchableOpacity 
            style={styles.hamburgerButton}
            onPress={showMenu}
          >
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          
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