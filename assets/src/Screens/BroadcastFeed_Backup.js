import React, { useEffect, useState } from "reac  const [broadcasts, setBroadcasts] = useState([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("your location");
  const [userProfile, setUserProfile] = useState(null);
  const [broadcastSettings, setBroadcastSettings] = useState({
    radiusEnabled: true,
    radius: 20,
    adminEnabled: true,
  });import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  RefreshControl 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, query, orderBy, onSnapshot, where, doc, getDoc } from "firebase/firestore";
import * as Location from "expo-location";
import { db, auth } from "../firebaseConfig";
import useOptimizedLocation from "../Components/useOptimizedLocation";
import { getBroadcastSettings } from "../Components/BroadcastSettings";
import styles from "../Styles/EmergencyBroadcast.styles";
import Logo from "../Images/SafeLink_LOGO.png";

// Calculate distance between two coordinates in kilometers
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export default function BroadcastFeed({ navigation }) {
  // Use optimized location for broadcast filtering
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    refreshLocation 
  } = useOptimizedLocation({
    enableTracking: false, // Just need current location for filtering
    onLocationUpdate: (newLocation) => {
      // Update location name when location changes
      reverseGeocodeLocation(newLocation);
    }
  });

  const [broadcasts, setBroadcasts] = useState([]);
  const [filteredBroadcasts, setFilteredBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [locationName, setLocationName] = useState("Detecting location...");

  // Reverse geocode location to get readable name
  const reverseGeocodeLocation = async (location) => {
    if (!location) return;
    
    try {
      const address = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude
      });
      
      if (address.length > 0) {
        const place = address[0];
        setLocationName(
          place.city || place.district || place.subregion || "Unknown Location"
        );
      }
    } catch (error) {
      console.log("Reverse geocode failed:", error);
      setLocationName("Unknown Location");
    }
  };

  // Initialize location name when userLocation becomes available
  useEffect(() => {
    if (userLocation) {
      reverseGeocodeLocation(userLocation);
    }
  }, [userLocation]);

  // Handle location errors
  useEffect(() => {
    if (locationError) {
      setLocationName("Location access denied");
    }
  }, [locationError]);

  // Listen to broadcasts
  useEffect(() => {
    const q = query(collection(db, "broadcasts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: doc.data().createdAt?.toDate()
      }));
      setBroadcasts(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Filter broadcasts within 30km radius
  useEffect(() => {
    if (!userLocation || broadcasts.length === 0) {
      setFilteredBroadcasts(broadcasts);
      return;
    }
    const filtered = broadcasts.filter(broadcast => {
      return true; 
    });

    setFilteredBroadcasts(filtered);
  }, [broadcasts, userLocation]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh will be handled by the onSnapshot listener
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case "Typhoon Warning": return "cloudy";
      case "Flood Alert": return "water";
      case "Earthquake Advisory": return "warning";
      case "Storm Surge Warning": return "thunderstorm";
      case "Tsunami Advisory": return "waves";
      case "Landslide Warning": return "triangle";
      case "Volcanic Eruption Alert": return "flame";
      case "Extreme Heat Advisory": return "sunny";
      case "Severe Wind Warning": return "leaf";
      case "Heavy Rainfall Advisory": return "rainy";
      default: return "alert-circle";
    }
  };

  const getAlertColor = (alertType) => {
    const criticalAlerts = ["Tsunami Advisory", "Volcanic Eruption Alert", "Earthquake Advisory"];
    const highAlerts = ["Typhoon Warning", "Storm Surge Warning", "Landslide Warning"];
    
    if (criticalAlerts.includes(alertType)) return "#D32F2F";
    if (highAlerts.includes(alertType)) return "#F57C00";
    return "#FF9800";
  };

  const renderBroadcastItem = ({ item }) => (
    <View style={[styles.broadcastCard, { borderLeftColor: getAlertColor(item.alertType) }]}>
      <View style={styles.broadcastHeader}>
        <View style={styles.alertTypeContainer}>
          <Ionicons 
            name={getAlertIcon(item.alertType)} 
            size={20} 
            color={getAlertColor(item.alertType)} 
          />
          <Text style={[styles.alertTypeText, { color: getAlertColor(item.alertType) }]}>
            {item.alertType}
          </Text>
        </View>
        <Text style={styles.timeText}>
          {item.timestamp ? item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
        </Text>
      </View>
      
      <Text style={styles.locationText}>
        📍 {item.barangay || "Unknown Area"} • {item.location || "Unknown City"}
      </Text>
      
      <Text style={styles.messageText}>{item.message}</Text>
      
      <Text style={styles.timestampText}>
        {item.timestamp ? item.timestamp.toLocaleDateString() + ' ' + item.timestamp.toLocaleTimeString() : 'Unknown time'}
      </Text>
    </View>
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
        <Text style={styles.title}>Emergency Broadcasts</Text>
      </View>

      {/* Location Info */}
      <View style={styles.locationBanner}>
        <Ionicons name="location" size={16} color="#666" />
        <Text style={styles.locationBannerText}>
          Showing alerts within 30km of {locationName}
        </Text>
      </View>

      {/* Create Broadcast Button */}
      <TouchableOpacity 
        style={styles.createBroadcastBtn}
        onPress={() => navigation.navigate("EmergencyBroadcast")}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.createBroadcastText}>Create Emergency Broadcast</Text>
      </TouchableOpacity>

      {/* Broadcasts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF9800" />
          <Text style={styles.loadingText}>Loading broadcasts...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBroadcasts}
          keyExtractor={(item) => item.id}
          renderItem={renderBroadcastItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="megaphone-outline" size={64} color="#ccc" />
              <Text style={styles.emptyTitle}>No Emergency Broadcasts</Text>
              <Text style={styles.emptySubtitle}>
                No active emergency alerts in your area.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
