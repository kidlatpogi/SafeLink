import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Alert, 
  StyleSheet,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import LocationService from '../Components/LocationService';

const LocationTest = ({ navigation }) => {
  const [testResults, setTestResults] = useState({});
  const [testing, setTesting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const runLocationTest = async () => {
    setTesting(true);
    const results = {};

    try {
      // Test 1: Check if location services are enabled
      console.log('🧪 Testing location services availability...');
      const serviceEnabled = await Location.hasServicesEnabledAsync();
      results.servicesEnabled = serviceEnabled;
      console.log(`✅ Location services enabled: ${serviceEnabled}`);

      // Test 2: Check foreground permissions
      console.log('🧪 Testing foreground permissions...');
      const foregroundStatus = await Location.getForegroundPermissionsAsync();
      results.foregroundPermission = foregroundStatus.granted;
      console.log(`✅ Foreground permission: ${foregroundStatus.status} (granted: ${foregroundStatus.granted})`);

      // Test 3: Check background permissions
      console.log('🧪 Testing background permissions...');
      const backgroundStatus = await Location.getBackgroundPermissionsAsync();
      results.backgroundPermission = backgroundStatus.granted;
      console.log(`✅ Background permission: ${backgroundStatus.status} (granted: ${backgroundStatus.granted})`);

      // Test 4: Request permissions if needed
      if (!foregroundStatus.granted) {
        console.log('🧪 Requesting foreground permissions...');
        const requestResult = await Location.requestForegroundPermissionsAsync();
        results.foregroundPermissionRequested = requestResult.granted;
        console.log(`✅ Foreground permission requested: ${requestResult.status}`);
      }

      if (!backgroundStatus.granted && foregroundStatus.granted) {
        console.log('🧪 Requesting background permissions...');
        const requestResult = await Location.requestBackgroundPermissionsAsync();
        results.backgroundPermissionRequested = requestResult.granted;
        console.log(`✅ Background permission requested: ${requestResult.status}`);
      }

      // Test 5: Get current location using expo-location directly
      if (foregroundStatus.granted || results.foregroundPermissionRequested) {
        console.log('🧪 Testing direct location fetch...');
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
            timeout: 15000,
            maximumAge: 10000,
          });
          results.directLocationFetch = true;
          results.locationData = location.coords;
          setCurrentLocation(location.coords);
          console.log(`✅ Direct location fetch successful:`, location.coords);
        } catch (locationError) {
          results.directLocationFetch = false;
          results.locationError = locationError.message;
          console.log(`❌ Direct location fetch failed:`, locationError.message);
        }
      }

      // Test 6: Test LocationService wrapper
      console.log('🧪 Testing LocationService wrapper...');
      try {
        const serviceLocation = await LocationService.getCurrentLocation();
        results.serviceLocationFetch = true;
        results.serviceLocationData = serviceLocation;
        console.log(`✅ LocationService fetch successful:`, serviceLocation);
      } catch (serviceError) {
        results.serviceLocationFetch = false;
        results.serviceError = serviceError.message;
        console.log(`❌ LocationService fetch failed:`, serviceError.message);
      }

      // Test 7: Test background task registration
      console.log('🧪 Testing background task registration...');
      try {
        await LocationService.startLocationTracking();
        results.backgroundTaskRegistration = true;
        console.log(`✅ Background task registration successful`);
      } catch (taskError) {
        results.backgroundTaskRegistration = false;
        results.taskError = taskError.message;
        console.log(`❌ Background task registration failed:`, taskError.message);
      }

    } catch (error) {
      console.error('❌ Location test failed:', error);
      results.generalError = error.message;
    }

    setTestResults(results);
    setTesting(false);
  };

  const getStatusIcon = (status) => {
    if (status === true) return 'checkmark-circle';
    if (status === false) return 'close-circle';
    return 'help-circle';
  };

  const getStatusColor = (status) => {
    if (status === true) return '#28a745';
    if (status === false) return '#dc3545';
    return '#ffc107';
  };

  const TestResult = ({ title, status, details }) => (
    <View style={styles.testResult}>
      <View style={styles.testHeader}>
        <Ionicons 
          name={getStatusIcon(status)} 
          size={20} 
          color={getStatusColor(status)} 
        />
        <Text style={styles.testTitle}>{title}</Text>
      </View>
      {details && (
        <Text style={styles.testDetails}>{details}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Location Test</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            This test verifies all location functionality for iOS and Android devices.
            Run this test after updating app.json or installing on a new device.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={runLocationTest}
          disabled={testing}
        >
          {testing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="play-circle" size={20} color="#fff" />
          )}
          <Text style={styles.testButtonText}>
            {testing ? 'Running Tests...' : 'Run Location Tests'}
          </Text>
        </TouchableOpacity>

        {Object.keys(testResults).length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Test Results</Text>
            
            <TestResult
              title="Location Services Enabled"
              status={testResults.servicesEnabled}
              details={testResults.servicesEnabled ? 'Device location services are active' : 'Enable location services in device settings'}
            />

            <TestResult
              title="Foreground Permission"
              status={testResults.foregroundPermission || testResults.foregroundPermissionRequested}
              details={testResults.foregroundPermission ? 'Permission already granted' : testResults.foregroundPermissionRequested ? 'Permission requested successfully' : 'Permission denied or not requested'}
            />

            <TestResult
              title="Background Permission"
              status={testResults.backgroundPermission || testResults.backgroundPermissionRequested}
              details={testResults.backgroundPermission ? 'Permission already granted' : testResults.backgroundPermissionRequested ? 'Permission requested successfully' : 'Permission denied or requires manual setup'}
            />

            <TestResult
              title="Direct Location Fetch"
              status={testResults.directLocationFetch}
              details={testResults.directLocationFetch ? 
                `Lat: ${testResults.locationData?.latitude.toFixed(6)}, Lng: ${testResults.locationData?.longitude.toFixed(6)}` : 
                testResults.locationError || 'Failed to get location'
              }
            />

            <TestResult
              title="LocationService Wrapper"
              status={testResults.serviceLocationFetch}
              details={testResults.serviceLocationFetch ? 
                `Service working correctly` : 
                testResults.serviceError || 'Service failed'
              }
            />

            <TestResult
              title="Background Task Registration"
              status={testResults.backgroundTaskRegistration}
              details={testResults.backgroundTaskRegistration ? 
                'Background tracking initialized' : 
                testResults.taskError || 'Failed to register background task'
              }
            />

            {testResults.generalError && (
              <TestResult
                title="General Error"
                status={false}
                details={testResults.generalError}
              />
            )}
          </View>
        )}

        {currentLocation && (
          <View style={styles.locationCard}>
            <Text style={styles.locationTitle}>Current Location</Text>
            <Text style={styles.locationText}>
              📍 Latitude: {currentLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              📍 Longitude: {currentLocation.longitude.toFixed(6)}
            </Text>
            <Text style={styles.locationText}>
              🎯 Accuracy: {currentLocation.accuracy?.toFixed(0)}m
            </Text>
            <Text style={styles.locationText}>
              ⏰ Timestamp: {new Date().toLocaleString()}
            </Text>
          </View>
        )}

        <View style={styles.troubleshootCard}>
          <Text style={styles.troubleshootTitle}>Troubleshooting Tips</Text>
          <Text style={styles.troubleshootText}>
            🔴 <Text style={styles.bold}>iOS Permission Error:</Text> If you get NSLocation*UsageDescription error, you need a development build. Expo Go has limitations with location permissions.{'\n\n'}
            🟡 <Text style={styles.bold}>Background Permission Denied:</Text> Go to Settings {'>'}  Privacy &amp; Security {'>'}  Location Services {'>'}  SafeLink {'>'}  Allow "Always"{'\n\n'}
            🟢 <Text style={styles.bold}>Location Timeout:</Text> Try going outdoors or near a window for better GPS signal.{'\n\n'}
            🔵 <Text style={styles.bold}>Service Registration Failed:</Text> Background location requires proper app.json configuration and may need a development build.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    color: '#1976d2',
    fontSize: 14,
    lineHeight: 20,
  },
  testButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    opacity: 0.5,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  testResult: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 10,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    color: '#333',
  },
  testDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    marginLeft: 30,
  },
  locationCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },
  locationText: {
    fontSize: 14,
    color: '#2e7d32',
    marginBottom: 5,
  },
  troubleshootCard: {
    backgroundColor: '#fff3e0',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  troubleshootTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f57c00',
    marginBottom: 10,
  },
  troubleshootText: {
    fontSize: 14,
    color: '#ef6c00',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default LocationTest;