// Components/useLocation.js
import { useState, useEffect } from 'react';
import LocationService from './LocationService';

export const useLocation = (options = {}) => {
  const {
    enableTracking = false,
    forceRefresh = false,
    onLocationUpdate = null,
  } = options;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({ foreground: false, background: false });

  // Location update callback
  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation);
    setLoading(false);
    setError(null);
    
    if (onLocationUpdate) {
      onLocationUpdate(newLocation);
    }
  };

  // Initialize location and permissions
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Request permissions
        const perms = await LocationService.requestLocationPermissions();
        setPermissions(perms);

        // Get initial location if permissions are granted
        if (perms.foreground) {
          const currentLocation = await LocationService.getLastKnownLocation();
          if (currentLocation) {
            handleLocationUpdate(currentLocation);
          } else {
            // Try to get fresh location
            const freshLocation = await LocationService.getCurrentLocation();
            if (freshLocation) {
              handleLocationUpdate(freshLocation);
            }
          }
        } else {
          setError('Location permissions not granted');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error initializing location:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    initializeLocation();
  }, [forceRefresh]);

  // Refresh location manually
  const refreshLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const newLocation = await LocationService.getCurrentLocation();
      if (newLocation) {
        handleLocationUpdate(newLocation);
      }
    } catch (err) {
      console.error('Error refreshing location:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Check if location services are enabled
  const checkLocationEnabled = async () => {
    try {
      const enabled = await LocationService.isLocationEnabled();
      return enabled;
    } catch (err) {
      console.error('Error checking location enabled:', err);
      return false;
    }
  };

  return {
    location,
    loading,
    error,
    permissions,
    refreshLocation,
    checkLocationEnabled,
  };
};

export default useLocation;