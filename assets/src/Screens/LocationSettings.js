// Screens/LocationSettings.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  Switch, 
  Alert, 
  TouchableOpacity, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LocationService from '../Components/LocationService';
import HamburgerMenu from '../Components/HamburgerMenu';
import styles from '../Styles/Create_Account.styles'; // Reusing existing styles

export default function LocationSettings({ navigation }) {
  const [isLocationTrackingEnabled, setIsLocationTrackingEnabled] = useState(false);
  const [hasBackgroundPermission, setHasBackgroundPermission] = useState(false);
  const [hasForegroundPermission, setHasForegroundPermission] = useState(false);
  const [lastLocationUpdate, setLastLocationUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  
  // Animation values for hamburger menu
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadLocationSettings();
  }, []);

  const showMenu = () => {
    setIsMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const loadLocationSettings = async () => {
    try {
      // Check if location tracking is enabled
      const trackingEnabled = await AsyncStorage.getItem('locationTrackingEnabled');
      setIsLocationTrackingEnabled(trackingEnabled === 'true');

      // Check permission status
      const permissions = await LocationService.requestLocationPermissions();
      setHasForegroundPermission(permissions.foreground);
      setHasBackgroundPermission(permissions.background);

      // Get last location update
      const lastLocation = await LocationService.getLastKnownLocation();
      if (lastLocation) {
        setLastLocationUpdate(new Date(lastLocation.timestamp));
      }
    } catch (error) {
      console.error('Error loading location settings:', error);
    }
  };

  const toggleLocationTracking = async (enabled) => {
    if (enabled) {
      // Show detailed consent dialog
      Alert.alert(
        "Enable Emergency Location Tracking?",
        "🛡️ SafeLink Emergency Location Service\n\n" +
        "• Updates your location every 30-60 seconds\n" +
        "• Works in background for emergency response\n" +
        "• Data is encrypted and secure\n" +
        "• Only used for family safety and emergencies\n" +
        "• Can be disabled anytime\n\n" +
        "⚡ Update Frequency:\n" +
        "• Active use: Every 30 seconds\n" +
        "• Background: Every 60 seconds\n" +
        "• Distance-based: 25-50 meters\n\n" +
        "🔒 Your privacy is protected and complies with all regulations.",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Enable Tracking",
            style: "default",
            onPress: async () => {
              setIsLoading(true);
              try {
                const success = await LocationService.startSmartTracking();
                if (success) {
                  setIsLocationTrackingEnabled(true);
                  await AsyncStorage.setItem('locationTrackingEnabled', 'true');
                  
                  // Refresh permissions and status
                  await loadLocationSettings();
                  
                  Alert.alert(
                    "✅ Location Tracking Enabled",
                    "Your location will now be automatically updated for emergency services.\n\n" +
                    "🔄 Updates every 30-60 seconds\n" +
                    "📍 High accuracy GPS tracking\n" +
                    "🛡️ Emergency response ready"
                  );
                } else {
                  Alert.alert(
                    "⚠️ Setup Required",
                    "Location permissions are required for emergency services.\n\n" +
                    "Please:\n" +
                    "1. Enable location permissions in device settings\n" +
                    "2. Set to 'Allow all the time' for background tracking\n" +
                    "3. Try again"
                  );
                }
              } catch (error) {
                console.error('Failed to enable location tracking:', error);
                Alert.alert("Error", "Failed to enable location tracking. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    } else {
      // Disable tracking with confirmation
      Alert.alert(
        "Disable Location Tracking?",
        "⚠️ This will stop automatic location updates for emergency services.\n\n" +
        "You can still manually update your location when needed, but emergency responders may not have your current location in case of an emergency.\n\n" +
        "Are you sure you want to disable this safety feature?",
        [
          {
            text: "Keep Enabled",
            style: "cancel"
          },
          {
            text: "Disable",
            style: "destructive",
            onPress: async () => {
              setIsLoading(true);
              try {
                const success = await LocationService.stopLocationTracking();
                if (success) {
                  setIsLocationTrackingEnabled(false);
                  await AsyncStorage.setItem('locationTrackingEnabled', 'false');
                  
                  Alert.alert(
                    "❌ Location Tracking Disabled",
                    "Automatic location updates have been turned off.\n\n" +
                    "⚠️ Emergency services may not have your current location\n" +
                    "📍 You can still manually update location when needed\n" +
                    "🔄 You can re-enable this anytime"
                  );
                }
              } catch (error) {
                console.error('Failed to disable location tracking:', error);
                Alert.alert("Error", "Failed to disable location tracking. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }
          }
        ]
      );
    }
  };

  const manualLocationUpdate = async () => {
    setIsLoading(true);
    try {
      Alert.alert("📍 Getting Location...", "Acquiring your precise GPS coordinates...");
      
      const location = await LocationService.getCurrentLocation();
      await loadLocationSettings(); // Refresh status
      
      Alert.alert(
        "Location Updated Successfully",
        `Your precise location has been saved:\n\n` +
        `Coordinates: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}\n` +
        `Accuracy: ${location.accuracy?.toFixed(0)}m\n` +
        `Updated: ${new Date().toLocaleTimeString()}\n\n` +
        `This location is now available for emergency services.`
      );
    } catch (error) {
      console.error('Manual location update failed:', error);
      Alert.alert(
        "❌ Location Update Failed",
        "Unable to get your current location.\n\n" +
        "Please check:\n" +
        "• Location services are enabled\n" +
        "• App has location permissions\n" +
        "• You have GPS signal (try going outdoors)\n" +
        "• Internet connection is working"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionStatusIcon = (hasPermission) => {
    return hasPermission ? "checkmark-circle" : "close-circle";
  };

  const getPermissionStatusColor = (hasPermission) => {
    return hasPermission ? "#28a745" : "#dc3545";
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <View style={{
        backgroundColor: '#FF6F00',
        paddingTop: Platform.OS === 'ios' ? 50 : 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="arrow-back" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={{
            color: '#fff',
            fontSize: 20,
            fontWeight: 'bold',
            flex: 1,
            textAlign: 'center',
            fontFamily: 'Montserrat-Regular'
          }}>
            Location Settings
          </Text>
          <TouchableOpacity 
            onPress={showMenu}
            style={{
              width: 40,
              height: 40,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="menu" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Toggle */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <View style={{
                backgroundColor: isLocationTrackingEnabled ? '#28a745' : '#6c757d',
                borderRadius: 25,
                width: 40,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 15
              }}>
                <Ionicons name="shield-checkmark" size={22} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{
                  fontSize: 18,
                  fontWeight: '700',
                  color: '#1a1a1a',
                  fontFamily: 'Montserrat-Regular'
                }}>
                  Emergency Location Tracking
                </Text>
                <Text style={{
                  fontSize: 13,
                  color: '#666',
                  marginTop: 2
                }}>
                  Automatic updates every 30-60 seconds
                </Text>
              </View>
              <Switch
                value={isLocationTrackingEnabled}
                onValueChange={toggleLocationTracking}
                trackColor={{ false: '#d1d5db', true: '#28a745' }}
                thumbColor="#fff"
                disabled={isLoading}
              />
            </View>

            {isLocationTrackingEnabled && (
              <View style={{
                backgroundColor: '#e8f5e8',
                borderRadius: 10,
                padding: 12,
                borderLeftWidth: 4,
                borderLeftColor: '#28a745'
              }}>
                <Text style={{
                  fontSize: 12,
                  color: '#155724',
                  fontWeight: '600'
                }}>
                  ✅ Active - Your location is being monitored for emergency services
                </Text>
              </View>
            )}
          </View>

          {/* Permission Status */}
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: 15,
              fontFamily: 'Montserrat-Regular'
            }}>
              Permission Status
            </Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, color: '#333' }}>Location Access</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={getPermissionStatusIcon(hasForegroundPermission)} 
                  size={16} 
                  color={getPermissionStatusColor(hasForegroundPermission)} 
                />
                <Text style={{ 
                  fontSize: 12, 
                  color: getPermissionStatusColor(hasForegroundPermission),
                  marginLeft: 5,
                  fontWeight: '500'
                }}>
                  {hasForegroundPermission ? 'Granted' : 'Required'}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, color: '#333' }}>Background Access</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons 
                  name={getPermissionStatusIcon(hasBackgroundPermission)} 
                  size={16} 
                  color={getPermissionStatusColor(hasBackgroundPermission)} 
                />
                <Text style={{ 
                  fontSize: 12, 
                  color: getPermissionStatusColor(hasBackgroundPermission),
                  marginLeft: 5,
                  fontWeight: '500'
                }}>
                  {hasBackgroundPermission ? 'Granted' : 'Optional'}
                </Text>
              </View>
            </View>

            {!hasBackgroundPermission && (
              <View style={{
                backgroundColor: '#fff3cd',
                borderRadius: 8,
                padding: 10,
                marginTop: 10
              }}>
                <Text style={{
                  fontSize: 11,
                  color: '#856404',
                  textAlign: 'center'
                }}>
                  ⚠️ Background permission recommended for continuous emergency tracking
                </Text>
              </View>
            )}
          </View>

          {/* Manual Update */}
          <TouchableOpacity
            style={{
              backgroundColor: '#007AFF',
              borderRadius: 15,
              padding: 18,
              marginBottom: 20,
              shadowColor: '#007AFF',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5,
              opacity: isLoading ? 0.7 : 1
            }}
            onPress={manualLocationUpdate}
            disabled={isLoading}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons 
                name={isLoading ? "hourglass" : "refresh"} 
                size={18} 
                color="#fff" 
                style={{ marginRight: 10 }} 
              />
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
                fontFamily: 'Montserrat-Regular'
              }}>
                {isLoading ? 'Updating Location...' : 'Update Location Now'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Location Test Button */}
          <TouchableOpacity
            style={{
              backgroundColor: '#6c757d',
              borderRadius: 15,
              padding: 18,
              marginBottom: 20,
              shadowColor: '#6c757d',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}
            onPress={() => navigation.navigate('LocationTest')}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons 
                name="bug" 
                size={18} 
                color="#fff" 
                style={{ marginRight: 10 }} 
              />
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
                fontFamily: 'Montserrat-Regular'
              }}>
                Run Location Tests
              </Text>
            </View>
          </TouchableOpacity>

          {/* Last Update Info */}
          {lastLocationUpdate && (
            <View style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 12,
              padding: 15,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: '#e9ecef'
            }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#495057',
                marginBottom: 5
              }}>
                📍 Last Location Update
              </Text>
              <Text style={{
                fontSize: 12,
                color: '#6c757d'
              }}>
                {lastLocationUpdate.toLocaleString()}
              </Text>
            </View>
          )}

          {/* Information */}
          <View style={{
            backgroundColor: '#e7f3ff',
            borderRadius: 12,
            padding: 15,
            marginBottom: 20,
            borderLeftWidth: 4,
            borderLeftColor: '#007AFF'
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              color: '#0066cc',
              marginBottom: 8
            }}>
              📍 How Location Tracking Works
            </Text>
            <Text style={{
              fontSize: 12,
              color: '#0066cc',
              lineHeight: 18
            }}>
              • Updates automatically every 30 seconds when app is active{'\n'}
              • Updates every 60 seconds when app is in background{'\n'}
              • Triggers when you move 25+ meters{'\n'}
              • High accuracy GPS for emergency precision{'\n'}
              • Data encrypted and stored securely{'\n'}
              • Only used for family safety and emergencies
            </Text>
          </View>

          {/* Privacy Notice */}
          <View style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 12,
            padding: 15,
            borderWidth: 1,
            borderColor: '#e9ecef'
          }}>
            <Text style={{
              fontSize: 12,
              color: '#6c757d',
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              🔒 Your location data is encrypted and only used for emergency services and family safety. We comply with all privacy regulations and never share your data with third parties.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <HamburgerMenu 
        menuVisible={isMenuVisible}
        setMenuVisible={setIsMenuVisible}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        navigation={navigation}
      />
    </View>
  );
}