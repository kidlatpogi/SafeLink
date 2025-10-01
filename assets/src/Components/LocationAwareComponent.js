// Components/LocationAwareComponent.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import useLocation from './useLocation';

const LocationAwareComponent = ({ 
  children, 
  fallbackComponent = null,
  enableTracking = false,
  emergencyMode = false,
  showLocationInfo = false,
  onLocationUpdate = null
}) => {
  const { 
    location, 
    loading, 
    error, 
    permissions, 
    refreshLocation, 
    isLocationFresh 
  } = useLocation({
    enableTracking,
    emergencyMode,
    onLocationUpdate
  });

  // Show error state
  if (error) {
    return fallbackComponent || (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Ionicons name="location-off" size={48} color="#999" />
        <Text style={{ color: '#999', textAlign: 'center', marginTop: 10 }}>
          Location access required
        </Text>
        <TouchableOpacity 
          onPress={refreshLocation}
          style={{
            backgroundColor: '#2196F3',
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderRadius: 8,
            marginTop: 10
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading state
  if (loading) {
    return fallbackComponent || (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <Ionicons name="location" size={48} color="#999" />
        <Text style={{ color: '#999', textAlign: 'center', marginTop: 10 }}>
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View>
      {showLocationInfo && location && (
        <View style={{
          backgroundColor: isLocationFresh ? '#E8F5E8' : '#FFF3E0',
          padding: 12,
          marginBottom: 16,
          borderRadius: 8,
          borderLeftWidth: 4,
          borderLeftColor: isLocationFresh ? '#4CAF50' : '#FF9800'
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons 
              name={isLocationFresh ? "location" : "location-outline"} 
              size={16} 
              color={isLocationFresh ? '#4CAF50' : '#FF9800'} 
            />
            <Text style={{ 
              marginLeft: 8, 
              fontWeight: 'bold',
              color: isLocationFresh ? '#4CAF50' : '#FF9800'
            }}>
              {isLocationFresh ? 'Current Location' : 'Cached Location'}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#666' }}>
            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
          </Text>
          <Text style={{ fontSize: 12, color: '#666' }}>
            Accuracy: ±{Math.round(location.accuracy)}m
          </Text>
          {!isLocationFresh && (
            <TouchableOpacity 
              onPress={refreshLocation}
              style={{ marginTop: 8 }}
            >
              <Text style={{ color: '#2196F3', fontSize: 12, fontWeight: 'bold' }}>
                Refresh Location
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Pass location data to children */}
      {React.Children.map(children, child =>
        React.isValidElement(child)
          ? React.cloneElement(child, { 
              location, 
              locationLoading: loading,
              locationError: error,
              refreshLocation,
              isLocationFresh
            })
          : child
      )}
    </View>
  );
};

export default LocationAwareComponent;