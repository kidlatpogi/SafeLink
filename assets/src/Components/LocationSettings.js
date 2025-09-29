// Components/LocationSettings.js
import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationService from './LocationService';

const LocationSettings = ({ styles }) => {
  const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] = useState(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);

  useEffect(() => {
    loadLocationSettings();
  }, []);

  const loadLocationSettings = async () => {
    try {
      // Check if location tracking is enabled
      const trackingEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      setIsLocationTrackingEnabled(trackingEnabled === 'true');

      // Check background permission status
      const permissions = await LocationService.requestLocationPermissions();
      setHasBackgroundPermission(permissions.background);

      // Get last location update
      const lastLocation = await LocationService.getLastKnownLocation();
      if (lastLocation) {
        setLastLocationUpdate(new Date(lastLocation.timestamp));
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };

  const toggleLocationTracking = async (enabled) => {
    if (enabled) {
      // Show consent dialog before enabling
      Alert.alert(
        "Enable Emergency Location Tracking?",
        "This will automatically update your location in the background for emergency services. Your location data is encrypted and only used for emergency purposes.\n\n• Updates every 30 seconds when app is active\n• Updates every minute when app is in background\n• Can be disabled anytime\n• Complies with privacy regulations",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Enable Tracking",
            onPress: async () => {
              const success = await LocationService.startSmartTracking();
              if (success) {
                setIsLocationTrackingEnabled(true);
                await AsyncStorage.setItem('locationTrackingEnabled', 'true');
                Alert.alert(
                  "Location Tracking Enabled",
                  "Your location will now be automatically updated for emergency services."
                );
              } else {
                Alert.alert(
                  "Permission Required",
                  "Location permission is required for emergency services. Please enable it in your device settings."
                );
              }
            }
          }
        ]
      );
    } else {
      // Disable tracking
      const success = await LocationService.stopLocationTracking();
      if (success) {
        setIsLocationTrackingEnabled(false);
        await AsyncStorage.setItem('locationTrackingEnabled', 'false');
        Alert.alert(
          "Location Tracking Disabled",
          "Automatic location updates have been turned off. You can still manually update your location when needed."
        );
      }
    }
  };

  const manualLocationUpdate = async () => {
    try {
      Alert.alert("Updating Location...", "Getting your current precise location...");
      
      const location = await LocationService.getCurrentLocation();
      setLastLocationUpdate(new Date());
      
      Alert.alert(
        "Location Updated",
        `Your location has been updated successfully.\n\nLatitude: ${location.latitude.toFixed(6)}\nLongitude: ${location.longitude.toFixed(6)}\nAccuracy: ${location.accuracy?.toFixed(0)}m`
      );
    } catch (error) {
      Alert.alert(
        "Location Update Failed",
        "Unable to get your current location. Please check your location settings and try again."
      );
    }
  };

  return (
    <View style={{
      backgroundColor: '#f8f9fa',
      borderRadius: 12,
      padding: 16,
      marginVertical: 16,
      borderWidth: 1,
      borderColor: '#e9ecef'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          backgroundColor: '#007AFF',
          borderRadius: 20,
          width: 32,
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 12
        }}>
          <Ionicons name="location" size={18} color="#fff" />
        </View>
        <Text style={{
          fontSize: 16,
          fontWeight: '600',
          color: '#1a1a1a',
          fontFamily: 'Montserrat-Regular'
        }}>
          Emergency Location Services
        </Text>
      </View>

      {/* Auto-tracking toggle */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef'
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '500',
            color: '#333',
            fontFamily: 'Montserrat-Regular'
          }}>
            Automatic Location Updates
          </Text>
          <Text style={{
            fontSize: 12,
            color: '#666',
            marginTop: 2
          }}>
            {hasBackgroundPermission 
              ? 'Updates location every 30-60 seconds' 
              : 'Updates only when app is active'}
          </Text>
        </View>
        <Switch
          value={isLocationTrackingEnabled}
          onValueChange={toggleLocationTracking}
          trackColor={{ false: '#d1d5db', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      {/* Manual update button */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#007AFF',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginTop: 12
        }}
        onPress={manualLocationUpdate}
        activeOpacity={0.8}
      >
        <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 8 }} />
        <Text style={{
          color: '#fff',
          fontSize: 14,
          fontWeight: '600',
          fontFamily: 'Montserrat-Regular'
        }}>
          Update Location Now
        </Text>
      </TouchableOpacity>

      {/* Last update info */}
      {lastLocationUpdate && (
        <View style={{
          backgroundColor: '#e8f5e8',
          borderRadius: 6,
          padding: 8,
          marginTop: 8
        }}>
          <Text style={{
            fontSize: 11,
            color: '#155724',
            textAlign: 'center'
          }}>
            Last updated: {lastLocationUpdate.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Privacy notice */}
      <View style={{
        backgroundColor: '#fff3cd',
        borderRadius: 6,
        padding: 8,
        marginTop: 8
      }}>
        <Text style={{
          fontSize: 10,
          color: '#856404',
          textAlign: 'center',
          fontStyle: 'italic'
        }}>
          🔒 Your location is encrypted and only used for emergency services
        </Text>
      </View>
    </View>
  );
};

export default LocationSettings;