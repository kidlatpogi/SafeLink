import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { db } from '../firebaseConfig';
import { doc, setDoc, getDoc, onSnapshot, collection, query, where } from 'firebase/firestore';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
    this.familyStatusListeners = new Map();
    this.disasterListeners = new Map();
    this.broadcastListener = null;
  }

  // Initialize notification service
  async initialize(userId) {
    try {
      // Register for push notifications
      await this.registerForPushNotificationsAsync();
      
      // Save push token to user profile
      if (this.expoPushToken && userId) {
        await this.savePushTokenToUser(userId);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      console.log('NotificationService initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize NotificationService:', error);
      return false;
    }
  }

  // Register for push notifications
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      this.expoPushToken = token;
      console.log('Push token:', token);
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Save push token to user profile
  async savePushTokenToUser(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        expoPushToken: this.expoPushToken,
        notificationSettings: {
          familyStatus: true,
          disasters: true,
          broadcasts: true,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
      
      console.log('Push token saved to user profile');
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  // Set up notification listeners
  setupNotificationListeners() {
    // Listen for notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      this.handleNotificationResponse(response);
    });
  }

  // Handle notification tap/response
  handleNotificationResponse(response) {
    const { data } = response.notification.request.content;
    
    switch (data?.type) {
      case 'family_status':
        // Navigate to family details or specific member
        console.log('Navigate to family status');
        break;
      case 'disaster_alert':
        // Navigate to disaster alerts
        console.log('Navigate to disaster alerts');
        break;
      case 'broadcast':
        // Navigate to broadcast feed
        console.log('Navigate to broadcast feed');
        break;
      default:
        console.log('Unknown notification type');
    }
  }

  // Set up family status monitoring
  async setupFamilyStatusMonitoring(userId, familyCode) {
    if (!familyCode) return;

    try {
      // Remove existing listener if any
      if (this.familyStatusListeners.has(familyCode)) {
        this.familyStatusListeners.get(familyCode)();
      }

      // Set up real-time listener for family status changes
      const familyRef = doc(db, 'families', familyCode);
      const unsubscribe = onSnapshot(familyRef, (doc) => {
        if (doc.exists()) {
          const familyData = doc.data();
          this.handleFamilyStatusChanges(userId, familyData);
        }
      });

      this.familyStatusListeners.set(familyCode, unsubscribe);
      console.log('Family status monitoring set up for:', familyCode);
    } catch (error) {
      console.error('Error setting up family status monitoring:', error);
    }
  }

  // Handle family status changes and send notifications
  handleFamilyStatusChanges(userId, familyData) {
    const members = familyData.members || [];
    const currentUser = members.find(member => member.userId === userId);
    
    members.forEach(member => {
      // Don't notify about own status changes
      if (member.userId === userId) return;
      
      // Check if this is a recent status change (within last 5 minutes)
      const lastUpdate = new Date(member.lastUpdate);
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      if (lastUpdate > fiveMinutesAgo) {
        this.sendFamilyStatusNotification(member);
      }
    });
  }

  // Send family status notification
  async sendFamilyStatusNotification(member) {
    const statusEmoji = this.getStatusEmoji(member.status);
    const statusColor = this.getStatusColor(member.status);
    
    let title = '';
    let body = '';
    
    switch (member.status?.toLowerCase()) {
      case "i'm safe":
        title = `${statusEmoji} Family Member Safe`;
        body = `${member.name} has reported they are safe`;
        break;
      case 'evacuated':
        title = `${statusEmoji} Family Member Evacuated`;
        body = `${member.name} has been evacuated - please check on them`;
        break;
      case 'unknown':
        title = `${statusEmoji} Family Member Status Unknown`;
        body = `${member.name}'s safety status is unknown - consider reaching out`;
        break;
      case 'not yet responded':
        title = `${statusEmoji} Family Member Hasn't Responded`;
        body = `${member.name} hasn't updated their status yet`;
        break;
      default:
        title = `Family Status Update`;
        body = `${member.name} updated their status to: ${member.status}`;
    }

    await this.scheduleLocalNotification({
      title,
      body,
      data: {
        type: 'family_status',
        memberId: member.userId,
        memberName: member.name,
        status: member.status
      },
      priority: member.status?.toLowerCase() === 'evacuated' ? 'high' : 'normal'
    });
  }

  // Set up disaster alerts monitoring
  async setupDisasterAlertsMonitoring(userId, userLocation) {
    if (!userLocation?.latitude || !userLocation?.longitude) return;

    try {
      // Monitor for new disaster alerts near user location
      const alertsRef = collection(db, 'disasterAlerts');
      const unsubscribe = onSnapshot(alertsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const alertData = change.doc.data();
            this.checkDisasterProximity(alertData, userLocation);
          }
        });
      });

      this.disasterListeners.set(userId, unsubscribe);
      console.log('Disaster alerts monitoring set up');
    } catch (error) {
      console.error('Error setting up disaster monitoring:', error);
    }
  }

  // Check if disaster is near user and send notification
  checkDisasterProximity(alertData, userLocation) {
    if (!alertData.coordinates) return;

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      alertData.coordinates.latitude,
      alertData.coordinates.longitude
    );

    // Notify if disaster is within 50km
    if (distance <= 50) {
      this.sendDisasterNotification(alertData, distance);
    }
  }

  // Send disaster alert notification
  async sendDisasterNotification(alertData, distance) {
    const severityEmoji = this.getSeverityEmoji(alertData.severity);
    const urgencyLevel = alertData.severity?.toLowerCase() === 'extreme' ? 'high' : 'normal';
    
    await this.scheduleLocalNotification({
      title: `${severityEmoji} ${alertData.type} Alert`,
      body: `${alertData.description}\nDistance: ${distance.toFixed(1)}km away`,
      data: {
        type: 'disaster_alert',
        alertId: alertData.id,
        severity: alertData.severity,
        distance: distance
      },
      priority: urgencyLevel
    });
  }

  // Set up emergency broadcast monitoring
  async setupBroadcastMonitoring(userId, userLocation) {
    try {
      const broadcastsRef = collection(db, 'emergencyBroadcasts');
      const unsubscribe = onSnapshot(broadcastsRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const broadcastData = change.doc.data();
            this.checkBroadcastRelevance(broadcastData, userLocation);
          }
        });
      });

      this.broadcastListener = unsubscribe;
      console.log('Broadcast monitoring set up');
    } catch (error) {
      console.error('Error setting up broadcast monitoring:', error);
    }
  }

  // Check if broadcast is relevant to user
  checkBroadcastRelevance(broadcastData, userLocation) {
    // Check if broadcast targets user's location or is emergency priority
    if (broadcastData.priority === 'emergency' || broadcastData.targetAll) {
      this.sendBroadcastNotification(broadcastData);
    } else if (broadcastData.targetLocation && userLocation) {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        broadcastData.targetLocation.latitude,
        broadcastData.targetLocation.longitude
      );

      // Notify if within broadcast radius (default 25km)
      if (distance <= (broadcastData.radius || 25)) {
        this.sendBroadcastNotification(broadcastData);
      }
    }
  }

  // Send broadcast notification
  async sendBroadcastNotification(broadcastData) {
    const priorityEmoji = broadcastData.priority === 'emergency' ? '🚨' : '📢';
    
    await this.scheduleLocalNotification({
      title: `${priorityEmoji} Emergency Broadcast`,
      body: broadcastData.message || broadcastData.title,
      data: {
        type: 'broadcast',
        broadcastId: broadcastData.id,
        priority: broadcastData.priority
      },
      priority: broadcastData.priority === 'emergency' ? 'high' : 'normal'
    });
  }

  // Schedule local notification
  async scheduleLocalNotification({ title, body, data, priority = 'normal' }) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: priority === 'high' ? 'default' : true,
          priority: priority === 'high' ? 
            Notifications.AndroidNotificationPriority.HIGH : 
            Notifications.AndroidNotificationPriority.DEFAULT,
        },
        trigger: null, // Show immediately
      });
      
      console.log('Local notification scheduled:', title);
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  // Helper functions
  getStatusEmoji(status) {
    switch (status?.toLowerCase()) {
      case "i'm safe": return '✅';
      case 'evacuated': return '🚨';
      case 'unknown': return '❓';
      case 'not yet responded': return '⏱️';
      default: return '📱';
    }
  }

  getStatusColor(status) {
    switch (status?.toLowerCase()) {
      case "i'm safe": return '#4CAF50';
      case 'evacuated': return '#F44336';
      case 'unknown': return '#9E9E9E';
      case 'not yet responded': return '#FF9800';
      default: return '#2196F3';
    }
  }

  getSeverityEmoji(severity) {
    switch (severity?.toLowerCase()) {
      case 'extreme': return '🔴';
      case 'severe': return '🟠';
      case 'moderate': return '🟡';
      case 'minor': return '🟢';
      default: return '⚠️';
    }
  }

  // Calculate distance between two coordinates (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Cleanup listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }

    // Clean up family status listeners
    this.familyStatusListeners.forEach(unsubscribe => unsubscribe());
    this.familyStatusListeners.clear();

    // Clean up disaster listeners
    this.disasterListeners.forEach(unsubscribe => unsubscribe());
    this.disasterListeners.clear();

    // Clean up broadcast listener
    if (this.broadcastListener) {
      this.broadcastListener();
    }

    console.log('NotificationService cleaned up');
  }
}

// Export singleton instance
export default new NotificationService();