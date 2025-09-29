// utils/LocationUtils.js
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const LocationAccuracy = {
  LOW: Location.Accuracy.Low,
  BALANCED: Location.Accuracy.Balanced,
  HIGH: Location.Accuracy.High,
  HIGHEST: Location.Accuracy.Highest,
};

export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};

export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

export const getCurrentPosition = async (options = {}) => {
  const defaultOptions = {
    accuracy: LocationAccuracy.HIGH,
    timeout: 15000,
    maximumAge: 10000,
  };

  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) {
        throw new Error('Location permission denied');
      }
    }

    const location = await Location.getCurrentPositionAsync({
      ...defaultOptions,
      ...options,
    });

    return {
      success: true,
      location: location,
      coordinates: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const reverseGeocode = async (latitude, longitude) => {
  try {
    const geocoding = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (geocoding && geocoding.length > 0) {
      return {
        success: true,
        address: geocoding[0],
        formattedAddress: formatAddressComponents(geocoding[0]),
      };
    } else {
      return {
        success: false,
        error: 'No address found for coordinates',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const formatAddressComponents = (addressComponents) => {
  const {
    streetNumber,
    street,
    district,
    city,
    region,
    country,
    postalCode
  } = addressComponents;

  let addressParts = [];
  
  if (streetNumber) addressParts.push(streetNumber);
  if (street) addressParts.push(street);
  if (district) addressParts.push(district);
  if (city) addressParts.push(city);
  if (region) addressParts.push(region);
  if (postalCode) addressParts.push(postalCode);
  
  return addressParts.length > 0 ? addressParts.join(', ') : 'Address not found';
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const formatCoordinates = (latitude, longitude, precision = 6) => {
  return `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`;
};

export const isValidCoordinates = (coordinates) => {
  if (!coordinates || typeof coordinates !== 'object') return false;
  
  const { latitude, longitude } = coordinates;
  
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 && latitude <= 90 &&
    longitude >= -180 && longitude <= 180
  );
};

export const showLocationError = (errorMessage) => {
  let title = 'Location Error';
  let message = errorMessage;

  if (errorMessage.includes('permission')) {
    title = 'Permission Required';
    message = 'Location access is required to get your precise location. Please enable location permissions in your device settings.';
  } else if (errorMessage.includes('timeout')) {
    title = 'Location Timeout';
    message = 'Unable to get your location within the time limit. Please make sure you have a clear view of the sky and try again.';
  } else if (errorMessage.includes('unavailable')) {
    title = 'Location Unavailable';
    message = 'Location services are not available on this device or are currently disabled.';
  }

  Alert.alert(title, message, [{ text: 'OK' }]);
};