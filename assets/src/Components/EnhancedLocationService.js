// Components/EnhancedLocationService.js
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const LOCATION_TASK_NAME = 'background-location-task';
const PERIODIC_LOCATION_CHECK = 'periodic-location-check';

// Enhanced background task with better persistence
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('Background location task error:', error);
    
    // Try to restart the task if it fails
    try {
      await restartLocationTracking();
    } catch (restartError) {
      console.error('Failed to restart location tracking:', restartError);
    }
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];
    
    if (location) {
      try {
        await updateUserLocationInFirestore(location.coords);
        console.log('📍 Background location updated:', {
          lat: location.coords.latitude.toFixed(6),
          lng: location.coords.longitude.toFixed(6),
          accuracy: location.coords.accuracy?.toFixed(0) + 'm',
          time: new Date().toLocaleTimeString()
        });
        
        // Store last successful update
        await AsyncStorage.setItem('lastLocationUpdate', JSON.stringify({
          timestamp: new Date().toISOString(),
          method: 'background'
        }));
        
      } catch (updateError) {
        console.error('Failed to update location in Firestore:', updateError);
      }
    }
  }
});

// Restart location tracking helper
const restartLocationTracking = async () => {
  try {
    const isEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
    if (isEnabled === 'true') {
      console.log('🔄 Restarting location tracking...');
      await EnhancedLocationService.startSmartTracking();
    }
  } catch (error) {
    console.error('Restart tracking error:', error);
  }
};

// Update user location in Firestore
const updateUserLocationInFirestore = async (coords) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user for location update');
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      'profile.coordinates': {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        speed: coords.speed,
        heading: coords.heading,
        timestamp: new Date().toISOString()
      },
      'profile.lastLocationUpdate': new Date().toLocaleString(),
      'profile.locationStatus': 'active'
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

class EnhancedLocationService {
  static isTracking = false;
  static watchPositionSubscription = null;
  static appStateSubscription = null;

  // Initialize location service with app state monitoring
  static async initialize() {
    try {
      // Monitor app state changes
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
      
      // Check if tracking was previously enabled
      const trackingEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      if (trackingEnabled === 'true') {
        console.log('🚀 Auto-starting location tracking on app launch');
        await this.startSmartTracking();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize location service:', error);
      return false;
    }
  }

  // Handle app state changes
  static handleAppStateChange = async (nextAppState) => {
    console.log('📱 App state changed to:', nextAppState);
    
    if (nextAppState === 'active') {
      // App became active - restart tracking if needed
      const trackingEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      if (trackingEnabled === 'true' && !this.isTracking) {
        console.log('🔄 Restarting location tracking (app became active)');
        await this.startSmartTracking();
      }
    } else if (nextAppState === 'background') {
      // App went to background - ensure background tracking is active
      const trackingEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      if (trackingEnabled === 'true') {
        console.log('📍 App in background - maintaining location tracking');
        await this.ensureBackgroundTracking();
      }
    }
  };

  // Request comprehensive location permissions
  static async requestLocationPermissions() {
    try {
      // Request foreground permissions first
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        throw new Error('Foreground location permission not granted');
      }

      // Request background permissions for continuous tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      // Request notification permissions for status updates
      const { status: notificationStatus } = await Notifications.requestPermissionsAsync();
      
      return {
        foreground: foregroundStatus === 'granted',
        background: backgroundStatus === 'granted',
        notifications: notificationStatus === 'granted'
      };
    } catch (error) {
      console.error('Permission request error:', error);
      return { foreground: false, background: false, notifications: false };
    }
  }

  // Start enhanced location tracking
  static async startSmartTracking(options = {}) {
    try {
      const permissions = await this.requestLocationPermissions();
      
      if (!permissions.foreground) {
        throw new Error('Location permissions required for emergency services');
      }

      // Start foreground tracking (always works when app is active)
      await this.startForegroundTracking(options);

      // Start background tracking if permission granted
      if (permissions.background) {
        await this.startBackgroundTracking(options);
        console.log('✅ Background location tracking started');
        
        // Show status notification
        if (permissions.notifications) {
          await this.showTrackingNotification();
        }
      } else {
        console.log('⚠️ Background permission not granted, using foreground tracking only');
        await this.scheduleLocationChecks(); // Fallback method
      }

      this.isTracking = true;
      
      // Store successful start
      await AsyncStorage.setItem('locationTrackingStarted', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Failed to start location tracking:', error);
      return false;
    }
  }

  // Enhanced foreground tracking with retry logic
  static async startForegroundTracking(options = {}) {
    const {
      accuracy = Location.Accuracy.High,
      timeInterval = 30000, // 30 seconds
      distanceInterval = 25 // 25 meters
    } = options;

    try {
      this.watchPositionSubscription = await Location.watchPositionAsync(
        {
          accuracy,
          timeInterval,
          distanceInterval,
        },
        async (location) => {
          try {
            await updateUserLocationInFirestore(location.coords);
            console.log('🎯 Foreground location updated:', {
              lat: location.coords.latitude.toFixed(6),
              lng: location.coords.longitude.toFixed(6),
              accuracy: location.coords.accuracy?.toFixed(0) + 'm'
            });
          } catch (error) {
            console.error('Foreground location update error:', error);
          }
        }
      );
      
      console.log('✅ Foreground location tracking active');
    } catch (error) {
      console.error('Foreground tracking error:', error);
      throw error;
    }
  }

  // Enhanced background tracking with persistence
  static async startBackgroundTracking(options = {}) {
    const {
      accuracy = Location.Accuracy.High,
      timeInterval = 60000, // 1 minute for background
      distanceInterval = 50, // 50 meters for background
      deferredUpdatesDistance = 100,
      deferredUpdatesTimeout = 120000 // 2 minutes
    } = options;

    try {
      await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        accuracy,
        timeInterval,
        distanceInterval,
        deferredUpdatesDistance,
        deferredUpdatesTimeout,
        foregroundService: {
          notificationTitle: 'SafeLink Emergency Tracking Active',
          notificationBody: 'Your location is being monitored for emergency services',
          notificationColor: '#007AFF'
        }
      });
      
      console.log('✅ Background location tracking active');
    } catch (error) {
      console.error('Background tracking error:', error);
      throw error;
    }
  }

  // Ensure background tracking is maintained
  static async ensureBackgroundTracking() {
    try {
      const isTaskRegistered = await TaskManager.isTaskRegistered(LOCATION_TASK_NAME);
      if (!isTaskRegistered) {
        console.log('🔄 Background task not registered, restarting...');
        await this.startBackgroundTracking();
      }
    } catch (error) {
      console.error('Failed to ensure background tracking:', error);
    }
  }

  // Fallback: Schedule periodic location checks
  static async scheduleLocationChecks() {
    // This is a fallback for when full background tracking isn't available
    console.log('📅 Scheduling periodic location checks');
    
    // Check location when app becomes active
    const checkLocation = async () => {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
          timeout: 10000,
          maximumAge: 30000,
        });
        
        await updateUserLocationInFirestore(location.coords);
        console.log('⏰ Scheduled location check completed');
      } catch (error) {
        console.error('Scheduled location check failed:', error);
      }
    };

    // Store the check function for later use
    await AsyncStorage.setItem('scheduledLocationCheck', 'enabled');
  }

  // Show persistent notification for tracking status
  static async showTrackingNotification() {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'SafeLink Location Tracking',
          body: 'Emergency location tracking is active',
          data: { type: 'location_tracking' },
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to show tracking notification:', error);
    }
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

      // Stop app state monitoring
      if (this.appStateSubscription) {
        this.appStateSubscription.remove();
        this.appStateSubscription = null;
      }

      this.isTracking = false;
      
      // Update status in Firestore
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
            'profile.locationStatus': 'inactive',
            'profile.trackingStoppedAt': new Date().toLocaleString()
          });
        }
      } catch (firestoreError) {
        console.error('Failed to update tracking status:', firestoreError);
      }

      console.log('🛑 Location tracking stopped');
      return true;
    } catch (error) {
      console.error('Failed to stop location tracking:', error);
      return false;
    }
  }

  // Get current location immediately with retry
  static async getCurrentLocation(retries = 3) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🎯 Getting current location (attempt ${attempt}/${retries})`);
        
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
        console.error(`Location attempt ${attempt} failed:`, error);
        
        if (attempt === retries) {
          // On final attempt, try to get last known location
          const lastKnown = await this.getLastKnownLocation();
          if (lastKnown) {
            console.log('📍 Using last known location');
            return lastKnown;
          }
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
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

  // Check tracking status
  static async getTrackingStatus() {
    try {
      const isEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      const lastUpdate = await AsyncStorage.getItem('lastLocationUpdate');
      const isTaskRegistered = await TaskManager.isTaskRegistered(LOCATION_TASK_NAME);
      
      return {
        enabled: isEnabled === 'true',
        isTracking: this.isTracking,
        backgroundTaskActive: isTaskRegistered,
        lastUpdate: lastUpdate ? JSON.parse(lastUpdate) : null
      };
    } catch (error) {
      console.error('Get tracking status error:', error);
      return { enabled: false, isTracking: false, backgroundTaskActive: false };
    }
  }
}

export default EnhancedLocationService;