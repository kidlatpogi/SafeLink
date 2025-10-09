# SafeLink Notification System Testing Guide

## Overview
This guide explains how to test the comprehensive notification system implemented in SafeLink, including push notifications for family status updates, disaster alerts, and emergency broadcasts.

## System Components

### 1. NotificationService.js
- **Location**: `assets/src/Components/NotificationService.js`
- **Purpose**: Core service handling push notification registration, family monitoring, disaster detection, and broadcast notifications
- **Key Features**:
  - Push token registration with Expo
  - Real-time family status monitoring
  - Disaster proximity detection (50km radius)
  - Emergency broadcast targeting
  - Distance calculations using Haversine formula

### 2. NotificationContext.js
- **Location**: `assets/src/Components/NotificationContext.js`
- **Purpose**: React context provider for notification state management
- **Features**:
  - Centralized notification settings
  - Automatic initialization
  - Settings persistence
  - Cleanup on unmount

### 3. NotificationSettings.js
- **Location**: `assets/src/Screens/NotificationSettings.js`
- **Purpose**: User interface for configuring notification preferences
- **Features**:
  - Toggle switches for each notification type
  - Test notification functionality
  - Status indicators
  - Detailed descriptions

## Testing Instructions

### Prerequisites
1. Ensure you have the Expo Go app installed on your device
2. Make sure your device has notification permissions enabled
3. Have at least two test accounts for family notification testing

### 1. Initial Setup Testing

#### Access Notification Settings
1. Open the SafeLink app
2. Tap the hamburger menu (≡) in the top-left corner
3. Select "Notification Settings"
4. Verify the screen loads with toggle switches for:
   - Family Status Updates
   - Disaster Alerts
   - Emergency Broadcasts

#### Test Push Token Registration
1. In NotificationSettings, check the console logs for:
   ```
   NotificationService - Push token registered: [token]
   ```
2. If no token appears, check device notification permissions

### 2. Family Status Notification Testing

#### Setup Family Group
1. Create or join a family using the family management features
2. Ensure you have at least 2 family members for testing

#### Test Status Update Notifications
1. On Device A: Go to Family Check-In screen
2. Update status (e.g., "I'm Safe" → "Evacuated")
3. On Device B: Should receive notification:
   - Title: "Family Status Update"
   - Body: "[Name] updated their status to 'Evacuated'"
4. Check console logs for:
   ```
   FamilyCheckIn - Family notification sent for status update
   ```

### 3. Disaster Alert Testing

#### Simulate Disaster Creation
1. Add test disaster data to Firestore `disasters` collection:
   ```javascript
   {
     name: "Test Earthquake",
     type: "earthquake",
     severity: "high",
     location: {
       latitude: [your_lat],
       longitude: [your_lng]
     },
     radius: 30,
     description: "Test earthquake for notification testing",
     createdAt: new Date(),
     isActive: true
   }
   ```

#### Test Proximity Notifications
1. Ensure your location is within 50km of the test disaster
2. Should receive notification:
   - Title: "🚨 Disaster Alert"
   - Body: "Test Earthquake detected within 30km of your location"
3. Check console logs for:
   ```
   NotificationService - Disaster proximity notification sent
   ```

### 4. Emergency Broadcast Testing

#### Setup Official Account
1. Ensure you have an account with `isVerifiedOfficial: true`
2. Set appropriate `officialRole` and `barangayAssignment`

#### Test Broadcast Notifications
1. Go to Emergency Broadcast screen
2. Create a test broadcast with location
3. All users within 50km should receive:
   - Title: "🚨 Emergency Alert: [Alert Type]"
   - Body: "[Official Name]: [Message]"
4. Check console logs for:
   ```
   Emergency broadcast notifications sent to [X] users
   ```

### 5. Notification Settings Testing

#### Test Toggle Functionality
1. Open Notification Settings
2. Toggle each setting off/on
3. Verify settings persist after app restart
4. Test that notifications respect the toggle states

#### Test Notification Button
1. In Notification Settings, tap "Test Notification"
2. Should receive immediate test notification
3. Verify notification appears in device notification tray

## Troubleshooting

### Common Issues

#### No Notifications Received
1. **Check Permissions**: Ensure notification permissions are granted
   ```javascript
   console.log('Notification permissions:', await Notifications.getPermissionsAsync());
   ```

2. **Verify Push Token**: Check if push token is registered
   ```javascript
   console.log('Push token:', await Notifications.getExpoPushTokenAsync());
   ```

3. **Check Network**: Ensure device has internet connectivity

#### Notifications Not Targeting Correctly
1. **Verify Location Services**: Ensure location permissions are granted
2. **Check Distance Calculations**: Verify coordinates are correct in console logs
3. **Test Distance Formula**: Use the `calculateDistance` method manually

#### Family Notifications Not Working
1. **Check Family Membership**: Verify users are in the same family
2. **Verify Push Tokens**: Ensure all family members have valid push tokens
3. **Check Firestore Rules**: Ensure proper read/write permissions

### Console Log Monitoring

Enable detailed logging by checking these console messages:

```javascript
// NotificationService initialization
"NotificationService - Initializing notification service"
"NotificationService - Push token registered: [token]"

// Family status monitoring
"NotificationService - Setting up family status monitoring"
"NotificationService - Family member status changed"

// Disaster monitoring
"NotificationService - Setting up disaster monitoring"
"NotificationService - Disaster proximity detected"

// Broadcast notifications
"Emergency broadcast notifications sent to [X] users"
```

### Testing Checklist

- [ ] Push token registration successful
- [ ] Notification settings screen accessible
- [ ] Family status notifications working
- [ ] Disaster proximity alerts functioning
- [ ] Emergency broadcast notifications sending
- [ ] User preferences being respected
- [ ] Test notification button working
- [ ] Settings persisting after app restart
- [ ] Distance calculations accurate
- [ ] Console logs showing expected messages

## Production Considerations

1. **Rate Limiting**: Implement rate limiting to prevent notification spam
2. **Battery Optimization**: Monitor background processing impact
3. **Error Handling**: Ensure graceful degradation when services are unavailable
4. **User Privacy**: Respect user preferences and provide opt-out options
5. **Performance**: Monitor notification delivery times and success rates

## Next Steps

1. Test with real disaster data integration
2. Implement notification history/logs
3. Add notification sound customization
4. Consider implementing notification badges
5. Add notification analytics and metrics

---

For technical issues or questions, refer to:
- `NotificationService.js` - Core notification logic
- `NotificationContext.js` - State management
- `NotificationSettings.js` - User interface
- Console logs for debugging information