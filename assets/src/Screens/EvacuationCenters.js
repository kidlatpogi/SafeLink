import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import useLocation from "../Components/useLocation";
import OverpassService from "../utils/OverpassService";
import styles from "../Styles/EvacuationCenters.styles";
import Logo from "../Images/SafeLink_LOGO.png";

const { width, height } = Dimensions.get('window');

const EvacuationCenters = ({ navigation, route }) => {
  const { location, loading: locationLoading, error: locationError } = useLocation();
  const mapRef = useRef(null);
  const [evacuationCenters, setEvacuationCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [mapType, setMapType] = useState('standard');
  const [loadingCenters, setLoadingCenters] = useState(false);
  const [useRealData, setUseRealData] = useState(false); // Toggle between real and static data (default: static)
  
  // Get auto-route parameter
  const { autoRoute } = route.params || {};

  // Memoize the static centers data to prevent unnecessary re-renders
  const staticCenters = useMemo(() => [
    {
      id: 1,
      name: "Dasmarinas National High School",
      address: "San Agustin III, Dasmariñas, Cavite",
      capacity: "500 people",
      type: "Flood and Typhoon Evacuation",
      coordinates: {
        latitude: 14.3294,
        longitude: 120.9367,
      },
      facilities: ["Restrooms", "Electricity", "Water Source", "Medical Station"]
    },
    {
      id: 2,
      name: "Paliparan Elementary School",
      address: "Paliparan I, Dasmariñas, Cavite",
      capacity: "300 people",
      type: "General Emergency Evacuation",
      coordinates: {
        latitude: 14.3156,
        longitude: 120.9489,
      },
      facilities: ["Restrooms", "Electricity", "Water Source"]
    },
    {
      id: 3,
      name: "San Agustin Parish Church",
      address: "San Agustin I, Dasmariñas, Cavite",
      capacity: "200 people",
      type: "Temporary Shelter",
      coordinates: {
        latitude: 14.3278,
        longitude: 120.9445,
      },
      facilities: ["Restrooms", "Water Source", "Food Preparation Area"]
    },
    {
      id: 4,
      name: "Barangay Salitran Hall",
      address: "Salitran IV, Dasmariñas, Cavite",
      capacity: "150 people",
      type: "Community Emergency Center",
      coordinates: {
        latitude: 14.3098,
        longitude: 120.9523,
      },
      facilities: ["Restrooms", "Electricity", "Communication Equipment"]
    },
    {
      id: 5,
      name: "De La Salle University - Dasmarinas",
      address: "Dasmariñas, Cavite",
      capacity: "1000 people",
      type: "Major Emergency Evacuation",
      coordinates: {
        latitude: 14.3237,
        longitude: 120.9367,
      },
      facilities: ["Restrooms", "Electricity", "Water Source", "Medical Station", "Cafeteria", "Gymnasium"]
    }
  ], []);

  // Fetch evacuation centers from Overpass API or use static data
  useEffect(() => {
    let isMounted = true; // Track if component is mounted

    const fetchCenters = async () => {
      if (!location?.latitude || !location?.longitude) {
        if (isMounted) {
          setEvacuationCenters(staticCenters);
        }
        return;
      }

      if (useRealData) {
        try {
          if (isMounted) {
            setLoadingCenters(true);
          }
          console.log('Fetching real evacuation centers from Overpass API...');
          
          const realCenters = await OverpassService.fetchEvacuationCenters(
            location.latitude,
            location.longitude,
            5000 // 5km radius
          );

          if (!isMounted) return; // Don't update state if unmounted

          if (realCenters.length > 0) {
            console.log(`Found ${realCenters.length} real evacuation centers`);
            setEvacuationCenters(realCenters);
          } else {
            console.log('No real centers found, using static data');
            // Fallback to static data with calculated distances
            const centersWithDistance = staticCenters.map(center => ({
              ...center,
              distance: calculateDistance(
                location.latitude,
                location.longitude,
                center.coordinates.latitude,
                center.coordinates.longitude
              )
            }));
            centersWithDistance.sort((a, b) => a.distance - b.distance);
            setEvacuationCenters(centersWithDistance);
          }
        } catch (error) {
          if (!isMounted) return; // Don't update state if unmounted
          
          console.error('Error fetching real centers, using static data:', error);
          // Fallback to static data
          const centersWithDistance = staticCenters.map(center => ({
            ...center,
            distance: calculateDistance(
              location.latitude,
              location.longitude,
              center.coordinates.latitude,
              center.coordinates.longitude
            )
          }));
          centersWithDistance.sort((a, b) => a.distance - b.distance);
          setEvacuationCenters(centersWithDistance);
        } finally {
          if (isMounted) {
            setLoadingCenters(false);
          }
        }
      } else {
        // Use static data with calculated distances
        if (isMounted) {
          const centersWithDistance = staticCenters.map(center => ({
            ...center,
            distance: calculateDistance(
              location.latitude,
              location.longitude,
              center.coordinates.latitude,
              center.coordinates.longitude
            )
          }));
          centersWithDistance.sort((a, b) => a.distance - b.distance);
          setEvacuationCenters(centersWithDistance);
        }
      }
    };

    fetchCenters();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [location?.latitude, location?.longitude, staticCenters, useRealData]);

  // Auto-route to nearest center if requested from home screen
  useEffect(() => {
    if (autoRoute && evacuationCenters.length > 0) {
      // Find the nearest center with distance or use first one
      const nearestCenter = evacuationCenters.find(center => center.distance) || evacuationCenters[0];
      
      if (nearestCenter) {
        // Small delay to ensure the screen is fully loaded
        const timer = setTimeout(() => {
          console.log('Auto-routing to nearest evacuation center:', nearestCenter.name);
          openDirections(nearestCenter);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [autoRoute, evacuationCenters]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openDirections = (center) => {
    console.log('Opening directions to:', center.name);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.coordinates.latitude},${center.coordinates.longitude}&travelmode=driving`;
    Linking.openURL(url).catch((error) => {
      console.error('Error opening maps:', error);
      Alert.alert(
        "Cannot Open Maps",
        "Please make sure you have Google Maps installed on your device.",
        [{ text: "OK" }]
      );
    });
  };

  const openNearestRoute = () => {
    if (evacuationCenters.length > 0) {
      const nearest = evacuationCenters[0];
      openDirections(nearest);
    }
  };

  const focusOnCenter = (center) => {
    setSelectedCenter(center);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: center.coordinates.latitude,
        longitude: center.coordinates.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'hybrid' : 'standard');
  };

  const getInitialRegion = () => {
    if (location?.latitude && location?.longitude) {
      return {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }
    
    // Default to Dasmarinas, Cavite if no location
    return {
      latitude: 14.3294,
      longitude: 120.9367,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    };
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Image source={Logo} style={styles.logo} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Evacuation Centers</Text>
          {loadingCenters && (
            <Text style={[styles.headerTitle, { fontSize: 10, color: '#FFA000' }]}>
              Loading real data...
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.dataToggleButton}
          onPress={() => setUseRealData(!useRealData)}
        >
          <Ionicons 
            name={useRealData ? "globe" : "list"} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.dataToggleText}>
            {useRealData ? "OSM" : "Static"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          mapType={mapType}
          initialRegion={getInitialRegion()}
          showsUserLocation={true}
          showsMyLocationButton={false}
          loadingEnabled={true}
        >
          {/* User location marker */}
          {location?.latitude && location?.longitude && (
            <Marker
              coordinate={{
                latitude: location.latitude,
                longitude: location.longitude,
              }}
              title="Your Location"
              description="You are here"
              pinColor="#4285F4"
            />
          )}

          {/* Evacuation center markers */}
          {evacuationCenters.map((center) => (
            <Marker
              key={center.id}
              coordinate={center.coordinates}
              title={center.name}
              description={center.address}
              pinColor="#FF6B6B"
              onPress={() => setSelectedCenter(center)}
            />
          ))}
        </MapView>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity 
            style={styles.mapControlButton}
            onPress={toggleMapType}
          >
            <Ionicons 
              name={mapType === 'standard' ? 'earth' : 'map-outline'} 
              size={24} 
              color="#FFFFFF" 
            />
          </TouchableOpacity>
        </View>

        {/* Quick Route Button */}
        <TouchableOpacity
          style={styles.quickRouteButton}
          onPress={openNearestRoute}
        >
          <Ionicons name="navigate" size={24} color="#FFFFFF" />
          <Text style={styles.quickRouteText}>NEAREST CENTER</Text>
        </TouchableOpacity>

        {/* Loading Overlay */}
        {loadingCenters && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Fetching real evacuation centers...</Text>
          </View>
        )}
      </View>

      {/* Selected Center Info */}
      {selectedCenter && (
        <View style={styles.selectedCenterCard}>
          <View style={styles.selectedCenterHeader}>
            <View style={styles.selectedCenterInfo}>
              <Text style={styles.selectedCenterName}>{selectedCenter.name}</Text>
              <Text style={styles.selectedCenterAddress}>{selectedCenter.address}</Text>
              {selectedCenter.distance && (
                <Text style={styles.selectedCenterDistance}>
                  📍 {selectedCenter.distance.toFixed(1)} km away
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.closeSelectedButton}
              onPress={() => setSelectedCenter(null)}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.selectedCenterDetails}>
            <Text style={styles.selectedCenterCapacity}>
              👥 Capacity: {selectedCenter.capacity}
            </Text>
            <Text style={styles.selectedCenterType}>
              🏠 Type: {selectedCenter.type}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.getDirectionsButton}
            onPress={() => openDirections(selectedCenter)}
          >
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
            <Text style={styles.getDirectionsText}>GET DIRECTIONS</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Center List */}
      <ScrollView style={styles.centersList} showsVerticalScrollIndicator={false}>
        <Text style={styles.centersListTitle}>All Evacuation Centers</Text>
        {evacuationCenters.map((center) => (
          <TouchableOpacity
            key={center.id}
            style={[
              styles.centerCard,
              selectedCenter?.id === center.id && styles.selectedCard
            ]}
            onPress={() => focusOnCenter(center)}
          >
            <View style={styles.centerCardHeader}>
              <Text style={styles.centerName}>{center.name}</Text>
              {center.distance && (
                <Text style={styles.centerDistance}>
                  {center.distance.toFixed(1)} km
                </Text>
              )}
            </View>
            
            <Text style={styles.centerAddress}>{center.address}</Text>
            
            <View style={styles.centerDetails}>
              <Text style={styles.centerCapacity}>👥 {center.capacity}</Text>
              <Text style={styles.centerType}>🏠 {center.type}</Text>
            </View>

            <View style={styles.centerActions}>
              <TouchableOpacity
                style={styles.viewOnMapButton}
                onPress={() => focusOnCenter(center)}
              >
                <Ionicons name="map" size={16} color="#4285F4" />
                <Text style={styles.viewOnMapText}>View on Map</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.routeButton}
                onPress={() => openDirections(center)}
              >
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
                <Text style={styles.routeButtonText}>Route</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default EvacuationCenters;