// Components/useOptimizedLocation.js
import { useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import LocationService from './LocationService';

export const useOptimizedLocation = (options = {}) => {
  const {
    enableTracking = false,
    emergencyMode = false,
    forceRefresh = false,
    onLocationUpdate = null,
  } = options;

  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permissions, setPermissions] = useState({ foreground: false, background: false });
  const appState = useRef(AppState.currentState);

  // Location update callback
  const handleLocationUpdate = (newLocation) => {
    setLocation(newLocation);
    setLoading(false);
    setError(null);
    
    if (onLocationUpdate) {
      onLocationUpdate(newLocation);
    }
  };

  // Handle app state changes for power optimization
  const handleAppStateChange = (nextAppState) => {
    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App has come to the foreground
      OptimizedLocationService.handleAppStateChange('active');
    } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
      // App has gone to the background
      OptimizedLocationService.handleAppStateChange('background');
    }
    appState.current = nextAppState;
  };

  // Initialize location service
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setLoading(true);
        
        // Request permissions
        const perms = await OptimizedLocationService.requestLocationPermissions();
        setPermissions(perms);
        
        // Handle iOS configuration errors gracefully
        if (perms.isConfigurationError) {
          console.warn('📱 iOS location configuration issue - app will work without location features');
          setError('Location services disabled (iOS configuration required)');
          setLoading(false);
          return;
        }
        
        if (!perms.foreground) {
          console.warn('⚠️ Location permission denied - app will work with limited functionality');
          setError('Location permission denied');
          setLoading(false);
          return;
        }

        // Add location listener
        OptimizedLocationService.addLocationListener(handleLocationUpdate);
        
        // Get current location (uses cache if available)
        try {
          const currentLocation = await OptimizedLocationService.getCurrentLocation(forceRefresh);
          if (currentLocation) {
            setLocation(currentLocation);
          }
        } catch (locationError) {
          console.warn('⚠️ Could not get current location:', locationError.message);
          // Don't set error here, app can still function without location
        }
        
        setLoading(false);
      } catch (err) {
        console.warn('⚠️ Failed to initialize location:', err.message);
        setError(`Location initialization failed: ${err.message}`);
        setLoading(false);
      }
    };

    initializeLocation();

    // Set up app state listener for power optimization
    const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      OptimizedLocationService.removeLocationListener(handleLocationUpdate);
      appStateSubscription?.remove();
    };
  }, [forceRefresh]);

  // Handle emergency mode changes
  useEffect(() => {
    if (emergencyMode) {
      OptimizedLocationService.enableEmergencyMode();
    } else {
      OptimizedLocationService.disableEmergencyMode();
    }
  }, [emergencyMode]);

  // Handle tracking enable/disable
  useEffect(() => {
    const handleTracking = async () => {
      if (enableTracking && permissions.foreground) {
        const result = await OptimizedLocationService.startLocationTracking();
        if (!result.success && result.error) {
          console.warn('⚠️ Location tracking failed:', result.error);
          // App can still continue without tracking
        }
      } else if (!enableTracking) {
        OptimizedLocationService.stopLocationTracking();
      }
    };

    handleTracking();
  }, [enableTracking, permissions.foreground]);

  // Manual refresh function
  const refreshLocation = async () => {
    try {
      setLoading(true);
      const newLocation = await OptimizedLocationService.getCurrentLocation(true);
      setLocation(newLocation);
      setLoading(false);
    } catch (err) {
      console.warn('⚠️ Failed to refresh location:', err.message);
      setError(err.message);
      setLoading(false);
    }
  };

  // Get location statistics
  const getStats = () => OptimizedLocationService.getLocationStats();

  return {
    location,
    loading,
    error,
    permissions,
    refreshLocation,
    getStats,
    // Calculated values
    isLocationFresh: location ? (Date.now() - location.timestamp) < 300000 : false, // 5 minutes
    accuracy: location?.accuracy,
    lastUpdate: location?.timestamp,
  };
};

export default useOptimizedLocation;