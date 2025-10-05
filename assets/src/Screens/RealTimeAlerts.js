import React, { useState, useEffect } from 'react';
import {
  View,
  Alert,
  Platform,
  PermissionsAndroid
} from 'react-native';
import * as Location from 'expo-location';
import AppHeader from '../Components/AppHeader';
import DisasterAlerts from '../Components/DisasterAlerts';
import styles from '../Styles/DisasterAlerts.styles';

const RealTimeAlerts = ({ navigation }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(null);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'This app needs location access to provide accurate disaster alerts for your area.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Grant Permission', onPress: () => requestLocationPermission() }
          ]
        );
        setLocationPermission('denied');
        return;
      }

      setLocationPermission('granted');
      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission('denied');
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeout: 15000,
      });
      
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Fallback to last known location
      try {
        const lastLocation = await Location.getLastKnownPositionAsync();
        if (lastLocation) {
          setUserLocation(lastLocation);
        }
      } catch (fallbackError) {
        console.error('Error getting last known location:', fallbackError);
      }
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader 
        title="Real-Time Alerts" 
        icon="notifications"
        navigation={navigation}
        backgroundColor="#dc2626"
        showBack={true}
        showHamburger={false}
      />
      
      <DisasterAlerts 
        userLocation={userLocation}
        maxAlerts={20}
      />
    </View>
  );
};

export default RealTimeAlerts;
