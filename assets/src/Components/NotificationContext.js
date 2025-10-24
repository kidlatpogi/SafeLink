import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { useFamily } from './FamilyContext';
import useLocation from './useLocation';
import NotificationService from './NotificationService';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { userId, displayName } = useUser();
  const { familyCode } = useFamily();
  const { location } = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    familyStatus: true,
    disasters: true,
    broadcasts: true,
  });

  // Initialize notification service when user logs in
  useEffect(() => {
    const initializeNotifications = async () => {
      if (userId && !isInitialized) {
        console.log('Initializing notifications for user:', userId);
        
        try {
          const success = await NotificationService.initialize(userId);
          if (success) {
            setIsInitialized(true);
            console.log('Notifications initialized successfully');
          }
        } catch (error) {
          console.error('Failed to initialize notifications:', error);
        }
      }
    };

    initializeNotifications();
  }, [userId, isInitialized]);

  // Set up family status monitoring when family data is available
  useEffect(() => {
    if (isInitialized && userId && familyCode) {
      console.log('Setting up family status monitoring for:', familyCode);
      NotificationService.setupFamilyStatusMonitoring(userId, familyCode);
    }
  }, [isInitialized, userId, familyCode]);

  // Set up disaster alerts monitoring when location is available
  useEffect(() => {
    if (isInitialized && userId && location && notificationSettings.disasters) {
      console.log('Setting up disaster alerts monitoring');
      NotificationService.setupDisasterAlertsMonitoring(userId, location);
    }
  }, [isInitialized, userId, location, notificationSettings.disasters]);

  // Set up broadcast monitoring
  useEffect(() => {
    if (isInitialized && userId && location && notificationSettings.broadcasts) {
      console.log('Setting up broadcast monitoring');
      NotificationService.setupBroadcastMonitoring(userId, location);
    }
  }, [isInitialized, userId, location, notificationSettings.broadcasts]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('Cleaning up notification service');
      NotificationService.cleanup();
    };
  }, []);

  // Update notification settings
  const updateNotificationSettings = async (newSettings) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
    
    // Save settings to user profile
    if (userId) {
      try {
        await NotificationService.savePushTokenToUser(userId);
        console.log('Notification settings updated');
      } catch (error) {
        console.error('Failed to update notification settings:', error);
      }
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    console.log('🧪 Sending test notification...');
    const notificationId = await NotificationService.scheduleLocalNotification({
      title: '🧪 SafeLink Test Notification',
      body: 'Your notifications are working correctly! This confirms Android notifications are functioning properly.',
      data: { type: 'test', timestamp: new Date().toISOString() },
      priority: 'high'
    });

    if (notificationId) {
      console.log('✅ Test notification sent successfully');
    } else {
      console.log('❌ Test notification failed');
    }

    return notificationId;
  };

  // Get notification status
  const getNotificationStatus = async () => {
    return await NotificationService.getNotificationStatus();
  };

  const value = {
    isInitialized,
    notificationSettings,
    updateNotificationSettings,
    sendTestNotification,
    getNotificationStatus,
    // Direct access to service methods if needed
    scheduleNotification: NotificationService.scheduleLocalNotification.bind(NotificationService)
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;