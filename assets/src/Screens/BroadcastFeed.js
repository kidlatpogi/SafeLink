import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Animated
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { collection, query, orderBy, onSnapshot, where, doc, getDoc, updateDoc, arrayUnion, increment } from "firebase/firestore";
import * as Location from "expo-location";
import { db, auth } from "../firebaseConfig";
import useLocation from "../Components/useLocation";
import { useUser } from "../Components/UserContext";
import { getBroadcastSettings } from "../Components/BroadcastSettings";
import styles from "../Styles/BroadcastFeed.styles";
import Logo from "../Images/SafeLink_LOGO.png";
import HamburgerMenu from "../Components/HamburgerMenu";

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

// Check if administrative areas match
const matchesAdministrativeArea = (broadcastLocation, userAdminLocation) => {
  if (!broadcastLocation || !userAdminLocation) return false;
  
  // Check barangay match (most specific)
  if (broadcastLocation.barangay && userAdminLocation.barangay) {
    return broadcastLocation.barangay.toLowerCase().includes(userAdminLocation.barangay.toLowerCase()) ||
           userAdminLocation.barangay.toLowerCase().includes(broadcastLocation.barangay.toLowerCase());
  }
  
  // Check municipality match
  if (broadcastLocation.municipality && userAdminLocation.municipality) {
    return broadcastLocation.municipality.toLowerCase().includes(userAdminLocation.municipality.toLowerCase()) ||
           userAdminLocation.municipality.toLowerCase().includes(broadcastLocation.municipality.toLowerCase());
  }
  
  // Check province match
  if (broadcastLocation.province && userAdminLocation.province) {
    return broadcastLocation.province.toLowerCase().includes(userAdminLocation.province.toLowerCase()) ||
           userAdminLocation.province.toLowerCase().includes(broadcastLocation.province.toLowerCase());
  }
  
  return false;
};

export default function BroadcastFeed({ navigation }) {
  const { userId, isVerifiedOfficial } = useUser();
  
  // Use optimized location for broadcast filtering
  const { 
    location: userLocation, 
    loading: locationLoading, 
    error: locationError,
    refreshLocation 
  } = useLocation({
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
  const [locationName, setLocationName] = useState("your location");
  const [userProfile, setUserProfile] = useState(null);
  const [broadcastSettings, setBroadcastSettings] = useState({
    radiusEnabled: true,
    radius: 20,
    adminEnabled: true,
  });

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Load user profile and broadcast settings on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Load user profile
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile(userData);
            
            // Load broadcast settings from profile or AsyncStorage
            if (userData.profile?.broadcastSettings) {
              setBroadcastSettings(userData.profile.broadcastSettings);
            } else {
              const savedSettings = await getBroadcastSettings();
              setBroadcastSettings(savedSettings);
            }
          }
        }
      } catch (error) {
        console.warn('Failed to load user data:', error);
      }
    };

    loadUserData();
  }, []);

  // Reload settings when screen comes into focus (after returning from settings)
  useFocusEffect(
    useCallback(() => {
      const loadUserData = async () => {
        try {
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              
              // Update broadcast settings if they changed
              if (userData.broadcastSettings) {
                setBroadcastSettings(userData.broadcastSettings);
              } else {
                const savedSettings = await getBroadcastSettings();
                setBroadcastSettings(savedSettings);
              }
            }
          }
        } catch (error) {
          console.warn('Failed to reload user data:', error);
        }
      };

      loadUserData();
    }, [])
  );

  // Reverse geocode location for display
  const reverseGeocodeLocation = async (location) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const place = reverseGeocode[0];
        const name = place.city || place.district || place.subregion || "your area";
        setLocationName(name);
      }
    } catch (error) {
      console.warn('Failed to reverse geocode location:', error);
    }
  };

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

  // Smart broadcast filtering based on user settings
  useEffect(() => {
    if (broadcasts.length === 0) {
      setFilteredBroadcasts([]);
      return;
    }

    let filtered = broadcasts;

    // Apply location-based filtering if enabled
    if (broadcastSettings.radiusEnabled && userLocation) {
      const radiusFiltered = broadcasts.filter(broadcast => {
        if (!broadcast.coordinates) return true; // Include broadcasts without coordinates
        
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          broadcast.coordinates.latitude,
          broadcast.coordinates.longitude
        );
        
        return distance <= broadcastSettings.radius;
      });
      
      filtered = radiusFiltered;
    }

    // Apply administrative area filtering if enabled
    if (broadcastSettings.adminEnabled && userProfile?.profile?.administrativeLocation) {
      const adminFiltered = filtered.filter(broadcast => {
        // Include if it matches location radius (already filtered above)
        if (broadcastSettings.radiusEnabled && userLocation && broadcast.coordinates) {
          return true; // Already included by radius filter
        }
        
        // Check administrative area match
        return matchesAdministrativeArea(
          broadcast.administrativeLocation, 
          userProfile.profile.administrativeLocation
        );
      });
      
      // Combine location and admin filtered results, removing duplicates
      if (broadcastSettings.radiusEnabled && userLocation) {
        const radiusFiltered = broadcasts.filter(broadcast => {
          if (!broadcast.coordinates) return false;
          
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            broadcast.coordinates.latitude,
            broadcast.coordinates.longitude
          );
          
          return distance <= broadcastSettings.radius;
        });
        
        const adminFiltered = broadcasts.filter(broadcast => 
          matchesAdministrativeArea(
            broadcast.administrativeLocation, 
            userProfile.profile.administrativeLocation
          )
        );
        
        // Merge and deduplicate
        const combined = [...radiusFiltered, ...adminFiltered];
        const uniqueIds = new Set();
        filtered = combined.filter(broadcast => {
          if (uniqueIds.has(broadcast.id)) return false;
          uniqueIds.add(broadcast.id);
          return true;
        });
      } else {
        filtered = adminFiltered;
      }
    }

    setFilteredBroadcasts(filtered);
  }, [broadcasts, userLocation, broadcastSettings, userProfile]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshLocation();
    } catch (error) {
      console.warn('Failed to refresh location:', error);
    }
    setRefreshing(false);
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

  const getFilterDescription = () => {
    const parts = [];
    
    if (broadcastSettings.radiusEnabled && userLocation) {
      parts.push(`${broadcastSettings.radius}km radius`);
    }
    
    if (broadcastSettings.adminEnabled && userProfile?.profile?.administrativeLocation) {
      const admin = userProfile.profile.administrativeLocation;
      if (admin.barangay) parts.push(`Barangay ${admin.barangay}`);
      else if (admin.municipality) parts.push(`${admin.municipality}`);
      else if (admin.province) parts.push(`${admin.province}`);
    }
    
    if (parts.length === 0) return "all alerts";
    return parts.join(" and ");
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Recently";
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getEmergencyIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire': return 'flame';
      case 'flood': return 'water';
      case 'earthquake': return 'pulse';
      case 'medical': return 'medical';
      case 'crime': return 'shield';
      case 'typhoon':
      case 'weather': return 'thunderstorm';
      default: return 'warning';
    }
  };

  const getEmergencyColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'fire': return '#FF6B35';
      case 'flood': return '#4A90E2';
      case 'earthquake': return '#8B4513';
      case 'medical': return '#FF1744';
      case 'crime': return '#6A1B9A';
      case 'typhoon':
      case 'weather': return '#607D8B';
      default: return '#FF8F00';
    }
  };

  // Mark broadcast as seen by current user
  const markAsSeen = async (broadcastId) => {
    if (!userId || !broadcastId) return;
    
    try {
      const broadcastRef = doc(db, 'broadcasts', broadcastId);
      await updateDoc(broadcastRef, {
        seenBy: arrayUnion(userId),
        seenCount: increment(1),
        [`seenDetails.${userId}`]: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking broadcast as seen:', error);
    }
  };

  const renderBroadcastItem = ({ item }) => {
    const hasUserSeen = item.seenBy?.includes(userId);
    const isOfficialBroadcast = item.isOfficialBroadcast;
    const isUsersBroadcast = isVerifiedOfficial && item.broadcasterId === userId;
    
    return (
      <TouchableOpacity 
        style={[
          styles.broadcastItem,
          isOfficialBroadcast && styles.officialBroadcastItem,
          !hasUserSeen && styles.unseenBroadcastItem
        ]}
        onPress={() => {
          if (!hasUserSeen) {
            markAsSeen(item.id);
          }
        }}
      >
        <View style={styles.broadcastHeader}>
          <View style={styles.emergencyTypeContainer}>
            <Ionicons 
              name={getEmergencyIcon(item.emergencyType)} 
              size={24} 
              color={getEmergencyColor(item.emergencyType)} 
            />
            <Text style={[styles.emergencyType, { color: getEmergencyColor(item.emergencyType) }]}>
              {item.emergencyType?.toUpperCase() || 'EMERGENCY'}
            </Text>
            {/* Official Badge */}
            {isOfficialBroadcast && (
              <View style={styles.officialBadge}>
                <Ionicons name="shield-checkmark" size={14} color="#4CAF50" />
                <Text style={styles.officialBadgeText}>OFFICIAL</Text>
              </View>
            )}
            {/* Unread indicator */}
            {!hasUserSeen && (
              <View style={styles.unreadIndicator}>
                <Ionicons name="ellipse" size={8} color="#FF4444" />
              </View>
            )}
          </View>
          <View style={styles.headerActions}>
            <Text style={styles.timeAgo}>{formatTimeAgo(item.timestamp)}</Text>
            {/* Analytics button for official's own broadcasts */}
            {isUsersBroadcast && (
              <TouchableOpacity 
                style={styles.analyticsButton}
                onPress={() => navigation.navigate('BroadcastAnalytics', { broadcastId: item.id })}
              >
                <Ionicons name="analytics" size={16} color="#2196F3" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <Text style={styles.broadcastMessage}>{item.message}</Text>
        
        {item.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        )}
        
        <View style={styles.broadcastFooter}>
          <View style={styles.broadcasterInfo}>
            <Text style={styles.broadcasterName}>
              {isOfficialBroadcast && item.officialRole 
                ? `${item.broadcasterName} - ${item.officialRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`
                : item.broadcasterName || 'Anonymous'
              }
            </Text>
            {item.barangayAssignment && (
              <Text style={styles.barangayText}>
                {typeof item.barangayAssignment === 'object' 
                  ? `${item.barangayAssignment.barangay}, ${item.barangayAssignment.municipality}, ${item.barangayAssignment.province}` 
                  : item.barangayAssignment}
              </Text>
            )}
          </View>
          
          <View style={styles.broadcastStats}>
            {/* Seen counter */}
            <View style={styles.seenCounter}>
              <Ionicons name="eye" size={14} color="#666" />
              <Text style={styles.seenCountText}>{item.seenCount || 0}</Text>
            </View>
            
            {/* Distance */}
            {item.coordinates && userLocation && (
              <Text style={styles.distanceText}>
                {calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  item.coordinates.latitude,
                  item.coordinates.longitude
                ).toFixed(1)} km away
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#FF6F00" barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={32} color="white" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logo} />
            <Text style={styles.headerTitle}>SafeLink</Text>
          </View>
          <TouchableOpacity 
            style={styles.hamburgerButton}
            onPress={showMenu}
          >
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6F00" />
          <Text style={styles.loadingText}>Loading emergency broadcasts...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FF6F00" barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={32} color="white" />
        </TouchableOpacity>
        <View style={styles.logoWrapper}>
          <Image source={Logo} style={styles.logo} />
          <Text style={styles.headerTitle}>SafeLink</Text>
        </View>
        <TouchableOpacity 
          style={styles.hamburgerButton}
          onPress={showMenu}
        >
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
      </View>

      {locationError && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={20} color="#E82222" />
          <Text style={styles.errorText}>
            Location unavailable - showing all broadcasts
          </Text>
        </View>
      )}

      <View style={styles.filterInfo}>
        <Ionicons name="filter" size={16} color="#666" />
        <Text style={styles.filterText}>
          Showing {getFilterDescription()}
        </Text>
        <TouchableOpacity 
          onPress={() => navigation.navigate('BroadcastSettings')}
          style={styles.settingsButton}
        >
          <Ionicons name="settings" size={16} color="#007BFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredBroadcasts}
        renderItem={renderBroadcastItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="radio" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Emergency Broadcasts</Text>
            <Text style={styles.emptyText}>
              {filteredBroadcasts.length === 0 && broadcasts.length > 0 
                ? `No broadcasts found for ${getFilterDescription()}`
                : "No active emergency broadcasts in your area"
              }
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

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