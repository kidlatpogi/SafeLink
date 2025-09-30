// Components/OptimizedLocationService.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'optimized-location-task';

// Smart interval configuration
const LOCATION_CONFIG = {
  // Normal mode: App in foreground, user active
  NORMAL: {
    interval: 60000, // 1 minute
    accuracy: Location.Accuracy.Balanced,
    distanceFilter: 50, // 50 meters
  },
  // Power save mode: App backgrounded, less frequent updates
  POWER_SAVE: {
    interval: 300000, // 5 minutes
    accuracy: Location.Accuracy.Low,
    distanceFilter: 200, // 200 meters
  },
  // Emergency mode: High accuracy for emergency situations
  EMERGENCY: {
    interval: 10000, // 10 seconds
    accuracy: Location.Accuracy.Highest,
    distanceFilter: 5, // 5 meters
  },
  // Stationary mode: When user hasn't moved significantly
  STATIONARY: {
    interval: 900000, // 15 minutes
    accuracy: Location.Accuracy.Low,
    distanceFilter: 500, // 500 meters
  }
};

// Cache configuration
const CACHE_CONFIG = {
  LOCATION_CACHE_KEY: 'cachedLocation',
  MAX_CACHE_AGE: 300000, // 5 minutes
  MIN_LOCATION_CHANGE: 10, // 10 meters minimum change to update
};

class OptimizedLocationService {
  static instance = null;
  static isTracking = false;
  static currentMode = 'NORMAL';
  static watchSubscription = null;
  static locationCache = null;
  static lastLocationTime = 0;
  static listeners = new Set();
  static emergencyMode = false;
  static stationaryTimeout = null;
  static lastKnownPosition = null;

  // Singleton pattern
  static getInstance() {
    if (!this.instance) {
      this.instance = new OptimizedLocationService();
    }
    return this.instance;
  }

  // Add listener for location updates
  static addLocationListener(callback) {
    this.listeners.add(callback);
    
    // Immediately return cached location if available and fresh
    if (this.locationCache && this.isCacheFresh()) {
      callback(this.locationCache);
    }
  }

  // Remove listener
  static removeLocationListener(callback) {
    this.listeners.delete(callback);
  }

  // Check if cached location is still fresh
  static isCacheFresh() {
    const now = Date.now();
    return (now - this.lastLocationTime) < CACHE_CONFIG.MAX_CACHE_AGE;
  }

  // Get cached location or fetch new one if needed
  static async getCurrentLocation(forceRefresh = false) {
    try {
      // Return cached location if fresh and not forcing refresh
      if (!forceRefresh && this.locationCache && this.isCacheFresh()) {
        console.log('📍 Using cached location');
        return this.locationCache;
      }

      console.log('📍 Fetching fresh location...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: LOCATION_CONFIG[this.currentMode].accuracy,
        maximumAge: 30000, // Use location up to 30 seconds old
      });

      await this.updateLocationCache(location);
      return this.locationCache;
    } catch (error) {
      console.error('❌ Failed to get current location:', error);
      
      // Fallback to cached location if available
      if (this.locationCache) {
        console.log('📍 Using fallback cached location');
        return this.locationCache;
      }
      
      throw error;
    }
  }

  // Update location cache and notify listeners
  static async updateLocationCache(location) {
    const newLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: Date.now(),
      altitude: location.coords.altitude,
      heading: location.coords.heading,
      speed: location.coords.speed,
    };

    // Check if location has changed significantly
    if (this.shouldUpdateLocation(newLocation)) {
      this.locationCache = newLocation;
      this.lastLocationTime = Date.now();
      
      // Save to AsyncStorage for offline access
      await AsyncStorage.setItem(CACHE_CONFIG.LOCATION_CACHE_KEY, JSON.stringify(newLocation));
      
      // Update Firebase if user is authenticated
      await this.updateFirebaseLocation(newLocation);
      
      // Notify all listeners
      this.notifyListeners(newLocation);
      
      // Check if user is stationary
      this.checkStationaryState(newLocation);
      
      console.log('📍 Location updated:', {
        lat: newLocation.latitude.toFixed(6),
        lng: newLocation.longitude.toFixed(6),
        accuracy: Math.round(newLocation.accuracy),
        mode: this.currentMode
      });
    } else {
      console.log('📍 Location change too small, skipping update');
    }
  }

  // Check if location change is significant enough to warrant update
  static shouldUpdateLocation(newLocation) {
    if (!this.lastKnownPosition) {
      this.lastKnownPosition = newLocation;
      return true;
    }

    const distance = this.calculateDistance(
      this.lastKnownPosition.latitude,
      this.lastKnownPosition.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    return distance >= CACHE_CONFIG.MIN_LOCATION_CHANGE;
  }

  // Calculate distance between two coordinates (Haversine formula)
  static calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  // Check if user is stationary and switch to stationary mode
  static checkStationaryState(newLocation) {
    if (this.stationaryTimeout) {
      clearTimeout(this.stationaryTimeout);
    }

    this.stationaryTimeout = setTimeout(() => {
      if (!this.emergencyMode && this.currentMode !== 'STATIONARY') {
        console.log('📍 User appears stationary, switching to power save mode');
        this.setTrackingMode('STATIONARY');
      }
    }, 300000); // 5 minutes of no significant movement
  }

  // Update Firebase with location data
  static async updateFirebaseLocation(location) {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'profile.coordinates': {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString(),
          lastUpdate: Date.now()
        },
        'profile.lastLocationUpdate': new Date().toLocaleString()
      });
    } catch (error) {
      console.error('❌ Failed to update Firebase location:', error);
    }
  }

  // Notify all listeners of location update
  static notifyListeners(location) {
    this.listeners.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('❌ Error in location listener:', error);
      }
    });
  }

  // Set tracking mode (NORMAL, POWER_SAVE, EMERGENCY, STATIONARY)
  static async setTrackingMode(mode) {
    if (!LOCATION_CONFIG[mode]) {
      console.error('❌ Invalid tracking mode:', mode);
      return;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;
    
    console.log(`📍 Switching location mode: ${previousMode} → ${mode}`);
    
    // Restart tracking with new configuration if currently tracking
    if (this.isTracking) {
      await this.stopLocationTracking();
      await this.startLocationTracking();
    }
  }

  // Enable emergency mode for high-accuracy tracking
  static async enableEmergencyMode() {
    this.emergencyMode = true;
    await this.setTrackingMode('EMERGENCY');
    console.log('🚨 Emergency location tracking enabled');
  }

  // Disable emergency mode
  static async disableEmergencyMode() {
    this.emergencyMode = false;
    await this.setTrackingMode('NORMAL');
    console.log('✅ Emergency location tracking disabled');
  }

  // Request location permissions
  static async requestLocationPermissions() {
    try {
      // Check if location services are available
      const hasLocationServices = await Location.hasServicesEnabledAsync();
      if (!hasLocationServices) {
        console.warn('⚠️ Location services are disabled');
        return { foreground: false, background: false, error: 'Location services disabled' };
      }

      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.warn('⚠️ Foreground location permission denied');
        return { foreground: false, background: false, error: 'Permission denied' };
      }

      // Only request background permissions on Android or if iOS has proper entitlements
      let backgroundStatus = 'denied';
      try {
        const backgroundResult = await Location.requestBackgroundPermissionsAsync();
        backgroundStatus = backgroundResult.status;
      } catch (backgroundError) {
        console.warn('⚠️ Background location not available (iOS without entitlements):', backgroundError.message);
        // Continue with foreground-only permissions
      }

      return {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
        error: null
      };
    } catch (error) {
      console.warn('⚠️ Location permission request failed:', error.message);
      
      // Handle iOS configuration errors gracefully
      if (error.message.includes('NSLocation') || error.message.includes('Info.plist')) {
        console.warn('📱 iOS location configuration issue - running in location-disabled mode');
        return { 
          foreground: false, 
          background: false, 
          error: 'iOS configuration required',
          isConfigurationError: true 
        };
      }
      
      return { 
        foreground: false, 
        background: false, 
        error: error.message 
      };
    }
  }

  // Start optimized location tracking
  static async startLocationTracking() {
    try {
      if (this.isTracking) {
        console.log('📍 Location tracking already active');
        return { success: true, mode: 'already_active' };
      }

      const permissions = await this.requestLocationPermissions();
      
      // Handle iOS configuration errors gracefully
      if (permissions.isConfigurationError) {
        console.warn('📱 Running in location-disabled mode due to iOS configuration');
        return { 
          success: false, 
          error: 'iOS location configuration required',
          mode: 'disabled',
          canContinue: true 
        };
      }
      
      if (!permissions.foreground) {
        console.warn('⚠️ Location permission denied - running in offline mode');
        return { 
          success: false, 
          error: 'Location permission denied',
          mode: 'offline',
          canContinue: true 
        };
      }

      // Load cached location on startup
      await this.loadCachedLocation();

      const config = LOCATION_CONFIG[this.currentMode];
      
      this.watchSubscription = await Location.watchPositionAsync(
        {
          accuracy: config.accuracy,
          timeInterval: config.interval,
          distanceInterval: config.distanceFilter,
        },
        async (location) => {
          await this.updateLocationCache(location);
        }
      );

      this.isTracking = true;
      console.log(`📍 Started optimized location tracking in ${this.currentMode} mode`);
      return { success: true, mode: this.currentMode };
    } catch (error) {
      console.warn('⚠️ Failed to start location tracking:', error.message);
      return { 
        success: false, 
        error: error.message,
        mode: 'error',
        canContinue: true 
      };
    }
  }

  // Stop location tracking
  static async stopLocationTracking() {
    try {
      if (this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }

      if (this.stationaryTimeout) {
        clearTimeout(this.stationaryTimeout);
        this.stationaryTimeout = null;
      }

      this.isTracking = false;
      console.log('📍 Location tracking stopped');
    } catch (error) {
      console.error('❌ Error stopping location tracking:', error);
    }
  }

  // Load cached location from storage
  static async loadCachedLocation() {
    try {
      const cached = await AsyncStorage.getItem(CACHE_CONFIG.LOCATION_CACHE_KEY);
      if (cached) {
        this.locationCache = JSON.parse(cached);
        this.lastLocationTime = this.locationCache.timestamp || 0;
        console.log('📍 Loaded cached location');
      }
    } catch (error) {
      console.error('❌ Failed to load cached location:', error);
    }
  }

  // Handle app state changes for power optimization
  static handleAppStateChange(nextAppState) {
    if (nextAppState === 'background' && !this.emergencyMode) {
      this.setTrackingMode('POWER_SAVE');
    } else if (nextAppState === 'active' && !this.emergencyMode) {
      this.setTrackingMode('NORMAL');
    }
  }

  // Get location statistics
  static getLocationStats() {
    return {
      isTracking: this.isTracking,
      currentMode: this.currentMode,
      emergencyMode: this.emergencyMode,
      lastUpdate: this.lastLocationTime,
      cacheAge: this.lastLocationTime ? Date.now() - this.lastLocationTime : null,
      listenersCount: this.listeners.size,
      hasCache: !!this.locationCache
    };
  }
}

export default OptimizedLocationService;