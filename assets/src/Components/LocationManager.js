// Components/LocationManager.js
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LocationManager = () => {
  useEffect(() => {
    initializeLocationService();
  }, []);

  const initializeLocationService = async () => {
    try {
      // Check if user has previously enabled location tracking
      const trackingEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      
      if (trackingEnabled === 'true') {
        console.log('📍 Location tracking was previously enabled');
        console.log('ℹ️ Location service will be available when needed');
      } else {
        console.log('📍 Location tracking not enabled by user');
      }
    } catch (error) {
      console.error('Location initialization error:', error);
    }
  };

  return null; // This is a service component, doesn't render anything
};

export default LocationManager;