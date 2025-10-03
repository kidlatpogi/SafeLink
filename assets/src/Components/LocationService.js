// Components/LocationService.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { doc, updateDoc } from 'firebase/firestore';
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
        console.log('📍 Location updated:', {
          latitude: location.coords.latitude.toFixed(6),
          longitude: location.coords.longitude.toFixed(6),
          accuracy: location.coords.accuracy
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

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      'profile.coordinates': {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        timestamp: new Date().toISOString()
      },
      'profile.lastLocationUpdate': new Date().toLocaleString()
    });

    // Store in AsyncStorage for offline access
    await AsyncStorage.setItem('lastKnownLocation', JSON.stringify({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      timestamp: new Date().toISOString()
    }));

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
        console.error('❌ Location services are disabled on device');
        return { foreground: false, background: false, servicesEnabled: false };
      }

      // Request foreground permissions first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.error('❌ Foreground location permission denied');
        return { 
          foreground: false, 
          background: false, 
          servicesEnabled: true,
          error: 'Foreground location permission denied'
        };
      }

      // Request background permissions for emergency tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      const result = {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
        servicesEnabled: true
      };

      return result;
    } catch (error) {
      console.error('❌ Permission request error:', error);
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
    try {
      const permissions = await this.requestLocationPermissions();
      
      if (!permissions.foreground) {
        throw new Error('Location permissions required for emergency services');
      }

      // Start foreground location watching (always works)
      await this.startForegroundTracking(options);

      // Start background tracking if permission granted
      if (permissions.background) {
        await this.startBackgroundTracking(options);
        console.log('Background location tracking started');
      } else {
        console.log('Background permission not granted, using foreground tracking only');
      }

      this.isTracking = true;
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  // Foreground location tracking (works when app is active)
  static async startForegroundTracking(options = {}) {
    const {
      accuracy = Location.Accuracy.High,
      timeInterval = LOCATION_UPDATE_INTERVAL,
      distanceInterval = HIGH_ACCURACY_DISTANCE
    } = options;

    this.watchPositionSubscription = await Location.watchPositionAsync(
      {
        accuracy,
        timeInterval,
        distanceInterval,
      },
      async (location) => {
        try {
          await updateUserLocationInFirestore(location.coords);
          console.log('Foreground location updated:', {
            lat: location.coords.latitude.toFixed(6),
            lng: location.coords.longitude.toFixed(6),
            accuracy: location.coords.accuracy
          });
        } catch (error) {
          console.error('Foreground location update error:', error);
        }
      }
    );
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
    try {
      // Stop foreground tracking
      if (this.watchPositionSubscription) {
        this.watchPositionSubscription.remove();
        this.watchPositionSubscription = null;
      }

      // Stop background tracking
      const isTaskDefined = await TaskManager.isTaskDefined(LOCATION_TASK_NAME);
      if (isTaskDefined) {
        await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      }

      this.isTracking = false;
      console.log('Location tracking stopped');
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

  // Smart location update - balances accuracy with battery life
  static async startSmartTracking() {
    const smartOptions = {
      // High accuracy for first few updates, then reduce
      accuracy: Location.Accuracy.High,
      timeInterval: 30000, // 30 seconds
      distanceInterval: 25, // 25 meters
      deferredUpdatesDistance: 100, // Background: 100 meters
      deferredUpdatesTimeout: 60000 // Background: 1 minute
    };

    return await this.startLocationTracking(smartOptions);
  }
}

export default LocationService;