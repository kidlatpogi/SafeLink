// Components/LocationService.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOCATION_TASK_NAME = 'background-location-task';
const LOCATION_UPDATE_INTERVAL = 30000; // 30 seconds (adjustable)
const HIGH_ACCURACY_DISTANCE = 10; // 10 meters (adjustable)

// Define the background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      try {
        await updateUserLocationInFirestore(location.coords);
        console.log('Location updated:', {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (updateError) {
        console.error('Failed to update location in Firestore:', updateError);
      }
    }
  }
});

// Update user location in Firestore
const updateUserLocationInFirestore = async (coords) => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const timestamp = new Date().toISOString();
    const locationData = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp: timestamp
    };

    // Update regular profile coordinates
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      'profile.coordinates': locationData,
      'profile.lastLocationUpdate': new Date().toLocaleString()
    });

    // Also update emergency location collection for family tracking
    try {
      const emergencyLocationRef = doc(db, 'users', user.uid, 'emergencyLocation', 'current');
      await setDoc(emergencyLocationRef, {
        ...locationData,
        lastUpdate: timestamp,
        isActive: true,
        updatedAt: timestamp
      }, { merge: true });
      
      console.log('Location updated in both profile and emergency location');
    } catch (emergencyError) {
      console.error('Error updating emergency location:', emergencyError);
      // Continue even if emergency location update fails
    }

    // Store in AsyncStorage for offline access
    await AsyncStorage.setItem('lastKnownLocation', JSON.stringify(locationData));

  } catch (error) {
    console.error('Error updating location in Firestore:', error);
  }
};

class LocationService {
  static isTracking = false;
  static watchPositionSubscription = null;

  // Request comprehensive location permissions
  static async requestLocationPermissions() {
    try {
      // Check if location services are enabled first
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      
      if (!servicesEnabled) {
        return { foreground: false, background: false, servicesEnabled: false };
      }

      // First check current permissions without requesting
      const currentForeground = await Location.getForegroundPermissionsAsync();
      let foregroundStatus = currentForeground.status;
      
      // Only request if not already granted
      if (foregroundStatus !== 'granted') {
        try {
          // Add timeout to prevent hanging
          const foregroundPromise = Location.requestForegroundPermissionsAsync();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Permission request timeout')), 10000)
          );
          
          const foregroundResult = await Promise.race([foregroundPromise, timeoutPromise]);
          foregroundStatus = foregroundResult.status;
        } catch (error) {
          console.log('Foreground permission request failed:', error.message);
          foregroundStatus = 'denied';
        }
      }
      
      if (foregroundStatus !== 'granted') {
        return { 
          foreground: false, 
          background: false, 
          servicesEnabled: true,
          error: 'Foreground location permission denied'
        };
      }

      // Check background permissions
      const currentBackground = await Location.getBackgroundPermissionsAsync();
      let backgroundStatus = currentBackground.status;
      
      // Only request background if foreground is granted and background isn't
      if (backgroundStatus !== 'granted') {
        try {
          const backgroundPromise = Location.requestBackgroundPermissionsAsync();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Background permission request timeout')), 10000)
          );
          
          const backgroundResult = await Promise.race([backgroundPromise, timeoutPromise]);
          backgroundStatus = backgroundResult.status;
        } catch (error) {
          console.log('Background permission request failed:', error.message);
          backgroundStatus = 'denied';
        }
      }
      
      const result = {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
        servicesEnabled: true
      };

      return result;
    } catch (error) {
      console.error('Permission request error:', error);
      return { 
        foreground: false, 
        background: false, 
        servicesEnabled: false,
        error: error.message 
      };
    }
  }

  // Start location tracking with user consent
  static async startLocationTracking(options = {}) {
    console.log('StartLocationTracking: Starting with options:', options);
    try {
      console.log('StartLocationTracking: Requesting permissions...');
      const permissions = await this.requestLocationPermissions();
      console.log('StartLocationTracking: Permissions received:', permissions);
      
      if (!permissions.foreground) {
        console.log('StartLocationTracking: No foreground permission, throwing error');
        throw new Error('Location permissions required for emergency services');
      }

      console.log('StartLocationTracking: Starting foreground tracking...');
      // Start foreground location watching (always works)
      await this.startForegroundTracking(options);
      console.log('StartLocationTracking: Foreground tracking started');

      // Start background tracking if permission granted
      if (permissions.background) {
        console.log('StartLocationTracking: Starting background tracking...');
        await this.startBackgroundTracking(options);
        console.log('StartLocationTracking: Background tracking started');
      } else {
        console.log('StartLocationTracking: No background permission, skipping background tracking');
      }

      this.isTracking = true;
      console.log('StartLocationTracking: Successfully completed, returning true');
      return true;
    } catch (error) {
      console.error('StartLocationTracking: Failed with error:', error);
      return false;
    }
  }

  // Foreground location tracking (works when app is active)
  static async startForegroundTracking(options = {}) {
    console.log('StartForegroundTracking: Starting with options:', options);
    try {
      const {
        accuracy = Location.Accuracy.High,
        timeInterval = LOCATION_UPDATE_INTERVAL,
        distanceInterval = HIGH_ACCURACY_DISTANCE
      } = options;

      console.log('StartForegroundTracking: Calling watchPositionAsync...');
      this.watchPositionSubscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval,
        },
        async (location) => {
          try {
            console.log('ForegroundTracking: Location received:', {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: new Date().toLocaleTimeString()
            });
            await updateUserLocationInFirestore(location.coords);
          } catch (error) {
            console.error('ForegroundTracking: Location update error:', error);
          }
        }
      );
      console.log('StartForegroundTracking: watchPositionAsync completed successfully');
    } catch (error) {
      console.error('StartForegroundTracking: Error:', error);
      throw error;
    }
  }

  // Background location tracking (works when app is backgrounded)
  static async startBackgroundTracking(options = {}) {
    const {
      accuracy = Location.Accuracy.High,
      timeInterval = LOCATION_UPDATE_INTERVAL,
      distanceInterval = HIGH_ACCURACY_DISTANCE,
      deferredUpdatesDistance = 50,
      deferredUpdatesTimeout = 5000
    } = options;

    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy,
      timeInterval,
      distanceInterval,
      deferredUpdatesDistance,
      deferredUpdatesTimeout,
      foregroundService: {
        notificationTitle: 'SafeLink Emergency Tracking',
        notificationBody: 'Location tracking active for emergency services',
        notificationColor: '#007AFF'
      }
    });
  }

  // Stop all location tracking
  static async stopLocationTracking() {
    console.log('StopLocationTracking: Starting...');
    try {
      // Stop foreground tracking
      if (this.watchPositionSubscription) {
        console.log('StopLocationTracking: Removing watch subscription...');
        this.watchPositionSubscription.remove();
        this.watchPositionSubscription = null;
        console.log('StopLocationTracking: Watch subscription removed');
      }

      // Stop background tracking (if it exists)
      try {
        const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
        if (isTaskDefined) {
          console.log('StopLocationTracking: Stopping background task...');
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          console.log('StopLocationTracking: Background task stopped');
        }
      } catch (bgError) {
        console.log('StopLocationTracking: Background stop error (not critical):', bgError.message);
      }

      this.isTracking = false;
      console.log('StopLocationTracking: Successfully stopped all tracking');
      return true;
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
      return false;
    }
  }

  // Get current location immediately
  static async getCurrentLocation() {
    try {
      const permissions = await this.requestLocationPermissions();
      if (!permissions.foreground) {
        throw new Error('Location permission required');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      });

      // Update in Firestore
      await updateUserLocationInFirestore(location.coords);
      
      return location.coords;
    } catch (error) {
      console.error('Get current location error:', error);
      throw error;
    }
  }

  // Check if location services are enabled
  static async isLocationEnabled() {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Location services check error:', error);
      return false;
    }
  }

  // Get last known location from AsyncStorage
  static async getLastKnownLocation() {
    try {
      const locationData = await AsyncStorage.getItem('lastKnownLocation');
      return locationData ? JSON.parse(locationData) : null;
    } catch (error) {
      console.error('Get last known location error:', error);
      return null;
    }
  }

  // Simple permission check without requesting
  static async checkLocationPermissions() {
    try {
      const foreground = await Location.getForegroundPermissionsAsync();
      const background = await Location.getBackgroundPermissionsAsync();
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      
      return {
        foreground: foreground.status === 'granted',
        background: background.status === 'granted',
        servicesEnabled
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { foreground: false, background: false, servicesEnabled: false };
    }
  }

  // Smart location update - balances accuracy with battery life
  static async startSmartTracking() {
    try {
      // Simplified approach - just do basic location tracking without complex background tasks
      
      let permissions;
      try {
        // Try normal permission request with timeout
        const permissionPromise = this.requestLocationPermissions();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Permission request timed out')), 15000)
        );
        permissions = await Promise.race([permissionPromise, timeoutPromise]);
      } catch (error) {
        console.log('Permission request failed, trying fallback...');
        // Fallback: just check existing permissions
        permissions = await this.checkLocationPermissions();
      }
      
      if (!permissions.foreground) {
        console.log('No foreground permission for emergency location');
        return false;
      }

      // Just start a simple foreground watch
      await this.startBasicTracking();
      console.log('Emergency location tracking started');
      
      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start emergency location tracking:', error);
      return false;
    }
  }

  // Simplified basic tracking without background tasks
  static async startBasicTracking() {
    try {
      if (this.watchPositionSubscription) {
        this.watchPositionSubscription.remove();
      }

      this.watchPositionSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 30000, // 30 seconds
          distanceInterval: 25, // 25 meters
        },
        async (location) => {
          try {
            await updateUserLocationInFirestore(location.coords);
          } catch (error) {
            console.error('Emergency location update failed:', error);
          }
        }
      );
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      throw error;
    }
  }
}

export default LocationService;