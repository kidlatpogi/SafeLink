# SafeLink - Development Guide

## Running the App

### Two Ways to Run SafeLink:

#### 1. **Development Build** (Recommended for full features)
```bash
npm start
# or
expo start --dev-client
```

**Features Available:**
- ✅ Push Notifications (full support)
- ✅ Background Location Tracking
- ✅ Evacuation Centers with Maps
- ✅ All Firebase Features
- ✅ Emergency Location Sharing

**Requirements:**
- Physical device or emulator with development build installed
- Run `npx expo run:android` or `npx expo run:ios` first to install dev build

---

#### 2. **Expo Go** (Quick testing)
```bash
npx expo start
```

**Features Available:**
- ✅ Evacuation Centers with Maps
- ✅ All Firebase Features  
- ✅ Emergency Location Sharing
- ⚠️  Push Notifications (limited - requires physical device setup)
- ⚠️  Background Location (limited)

**Requirements:**
- Expo Go app installed on your device
- Scan QR code to run

---

## Feature Compatibility Matrix

| Feature | Development Build | Expo Go |
|---------|------------------|---------|
| Emergency Broadcasts | ✅ Full | ✅ Full |
| Family Check-in | ✅ Full | ✅ Full |
| Evacuation Centers Map | ✅ Full | ✅ Full |
| OSM Data (Overpass API) | ✅ Full | ✅ Full |
| Push Notifications | ✅ Full | ⚠️ Limited |
| Background Location | ✅ Full | ⚠️ Limited |
| Offline Mode | ✅ Full | ✅ Full |

---

## Troubleshooting

### "View All" Button Not Working

**Solution:**
The app now uses **static data by default** for reliability. To fetch real evacuation centers from OpenStreetMap:

1. Go to Evacuation Centers screen
2. Tap the "Static" button in the header
3. It will change to "OSM" and fetch real data
4. Toggle back to "Static" for faster loading

### Notifications Not Working in Expo Go

**Reason:** Expo Go has limited push notification support.

**Solution:**
- Use Development Build for full notification features
- Or test on physical device with proper setup

### App Crashes on Navigation

**Fixed!** We've added:
- Error Boundary for graceful error handling
- Component unmount protection
- Better async operation cleanup

---

## Technical Details

### Evacuation Centers Data Sources:

1. **Static Data** (Default):
   - 5 pre-defined centers in Dasmariñas, Cavite
   - Instant loading
   - Always available
   - Reliable fallback

2. **OSM Data** (Optional):
   - Fetched from Overpass API
   - Real-world evacuation centers
   - Schools, community centers, sports centers, civic buildings
   - 5km radius search
   - Requires internet connection

### Error Handling:

- **Error Boundary**: Catches and displays errors gracefully
- **Component Cleanup**: Prevents memory leaks and crashes
- **API Fallback**: Auto-switches to static data if API fails
- **Loading States**: Clear feedback during data fetch

---

## Development Commands

```bash
# Start development server
npm start

# Clear cache and restart
npm start -- --clear

# Run on Android (development build)
npx expo run:android

# Run on iOS (development build)
npx expo run:ios

# Build development client
npx expo prebuild

# Check for issues
npx expo-doctor
```

---

## Best Practices

1. **For Development**: Use development build for full feature testing
2. **For Quick Tests**: Use Expo Go for UI/UX testing
3. **For Production**: Always test with development build before releasing
4. **For Notifications**: Test on physical devices with proper permissions

---

## Recent Fixes

### Console Log Cleanup ✅
- Removed excessive debugging logs
- Maintained essential system logs
- Restored disaster alert notifications

### Location Tracking ✅
- Fixed emergency location toggle
- Improved permission handling
- Added timeout protection

### Evacuation Centers ✅
- Fixed "View All" crashes
- Added Error Boundary
- Improved data fetching
- Made static data default
- Added OSM data toggle

### Notifications ✅
- Fixed removeNotificationSubscription API
- Improved compatibility
- Better error handling

---

## Need Help?

Check the logs for detailed error messages:
```bash
# The terminal running npm start shows all logs
# Look for:
# - LOG: General information
# - ERROR: Problems that need attention
# - Fetching...: API calls being made
```

Happy coding! 🚀
