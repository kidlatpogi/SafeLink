// Components/LocationStatus.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const LocationStatus = ({ styles }) => {
  const [locationData, setLocationData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    checkLocationStatus();
    // Check every 30 seconds
    const interval = setInterval(checkLocationStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkLocationStatus = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Get location data from Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const coordinates = userData.profile?.coordinates;
        const lastLocationUpdate = userData.profile?.lastLocationUpdate;
        
        if (coordinates) {
          setLocationData({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude,
            accuracy: coordinates.accuracy,
            timestamp: coordinates.timestamp
          });
          setLastUpdate(lastLocationUpdate);
        }
      }

      // Also check AsyncStorage for last known location
      const lastKnown = await AsyncStorage.getItem('lastKnownLocation');
      if (lastKnown && !locationData) {
        const parsed = JSON.parse(lastKnown);
        setLocationData(parsed);
      }
    } catch (error) {
      console.error('Error checking location status:', error);
    }
  };

  const refreshLocationStatus = async () => {
    setIsRefreshing(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No user logged in");
        setIsRefreshing(false);
        return;
      }

      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission Denied", 
          "Location permission is required to get your current location."
        );
        setIsRefreshing(false);
        return;
      }

      // Get fresh live location from device GPS
      const freshLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 1000, // Don't use cached location older than 1 second
      });

      const { latitude, longitude, accuracy } = freshLocation.coords;
      const timestamp = new Date().toISOString();

      // Create new location data object
      const newLocationData = {
        latitude,
        longitude,
        accuracy,
        timestamp
      };

      // Update local state immediately
      setLocationData(newLocationData);
      setLastUpdate(new Date().toLocaleString());

      // Save to AsyncStorage
      await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(newLocationData));

      // Update Firestore with fresh location
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'profile.coordinates': {
          latitude,
          longitude,
          accuracy,
          timestamp
        },
        'profile.lastLocationUpdate': new Date().toLocaleString()
      });

      Alert.alert(
        "Location Updated", 
        `Fresh location obtained!\n ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n Accuracy: ${accuracy.toFixed(0)}m`
      );

    } catch (error) {
      console.error('Error getting fresh location:', error);
      
      let errorMessage = "Failed to get current location.";
      if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = "Location request timed out. Please try again.";
      } else if (error.code === 'E_LOCATION_UNAVAILABLE') {
        errorMessage = "Location services unavailable. Check your GPS settings.";
      }
      
      Alert.alert("Error", errorMessage);
      
      // Fallback to checking stored location data
      await checkLocationStatus();
    }
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const showDetailedInfo = () => {
    if (!locationData) {
      Alert.alert(
        "No Location Data",
        "No location data found. Location tracking might not be enabled or working."
      );
      return;
    }

    const timeDiff = locationData.timestamp ? 
      Math.floor((new Date() - new Date(locationData.timestamp)) / 1000 / 60) : 'Unknown';

    Alert.alert(
      "Location Details",
      `📍 Coordinates: ${locationData.latitude.toFixed(6)}, ${locationData.longitude.toFixed(6)}\n\n` +
      `🎯 Accuracy: ${locationData.accuracy ? locationData.accuracy.toFixed(0) + 'm' : 'Unknown'}\n\n` +
      `⏰ Last Updated: ${timeDiff !== 'Unknown' ? timeDiff + ' minutes ago' : 'Unknown'}\n\n` +
      `🕐 Timestamp: ${locationData.timestamp ? new Date(locationData.timestamp).toLocaleString() : 'Unknown'}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusColor = () => {
    if (!locationData) return '#dc3545'; // Red - No data
    
    const timeDiff = locationData.timestamp ? 
      Math.floor((new Date() - new Date(locationData.timestamp)) / 1000 / 60) : 999;
    
    if (timeDiff <= 2) return '#28a745'; // Green - Very recent
    if (timeDiff <= 10) return '#ffc107'; // Yellow - Recent
    return '#fd7e14'; // Orange - Old data
  };

  const getStatusText = () => {
    if (!locationData) return 'No Location Data';
    
    const timeDiff = locationData.timestamp ? 
      Math.floor((new Date() - new Date(locationData.timestamp)) / 1000 / 60) : 999;
    
    if (timeDiff <= 2) return 'Location Active (Live)';
    if (timeDiff <= 10) return 'Location Recent';
    return 'Location Outdated';
  };

  return (
    <View style={{
      backgroundColor: '#fff',
      borderRadius: 15,
      padding: 16,
      marginHorizontal: 20,
      marginVertical: 12,
      borderWidth: 1,
      borderColor: getStatusColor(),
      borderLeftWidth: 5,
      borderLeftColor: getStatusColor(),
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <View style={{
            backgroundColor: getStatusColor(),
            borderRadius: 20,
            width: 32,
            height: 32,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12
          }}>
            <Ionicons 
              name={locationData ? "location" : "location-outline"} 
              size={18} 
              color="#fff" 
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '700',
              color: '#1a1a1a',
              fontFamily: 'Montserrat-Regular'
            }}>
              🛡️ Emergency Location
            </Text>
            <Text style={{
              fontSize: 13,
              color: getStatusColor(),
              marginTop: 2,
              fontWeight: '600'
            }}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={refreshLocationStatus}
          style={{
            backgroundColor: '#007AFF',
            borderRadius: 8,
            padding: 8,
            marginLeft: 8
          }}
          disabled={isRefreshing}
        >
          <Ionicons 
            name={isRefreshing ? "hourglass" : "refresh"} 
            size={16} 
            color="#fff" 
          />
        </TouchableOpacity>
      </View>

      {locationData && (
        <TouchableOpacity
          onPress={showDetailedInfo}
          style={{
            backgroundColor: '#e9ecef',
            borderRadius: 8,
            padding: 12,
            marginTop: 12
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ fontSize: 12, color: '#495057', fontWeight: '500' }}>
                📍 {locationData.latitude.toFixed(4)}, {locationData.longitude.toFixed(4)}
              </Text>
              <Text style={{ fontSize: 11, color: '#6c757d', marginTop: 2 }}>
                {lastUpdate ? `Updated: ${lastUpdate}` : 'Tap for details'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#6c757d" />
          </View>
        </TouchableOpacity>
      )}

      {!locationData && (
        <View style={{
          backgroundColor: '#fff3cd',
          borderRadius: 8,
          padding: 12,
          marginTop: 12
        }}>
          <Text style={{
            fontSize: 11,
            color: '#856404',
            textAlign: 'center'
          }}>
            ⚠️ No location data found. Make sure location tracking is enabled.
          </Text>
        </View>
      )}
    </View>
  );
};

export default LocationStatus;