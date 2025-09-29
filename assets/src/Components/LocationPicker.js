// Components/LocationPicker.js
import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location';

const LocationPicker = ({ 
  address, 
  setAddress,
  coordinates,
  setCoordinates,
  styles 
}) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = async () => {
    try {
      setIsGettingLocation(true);
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location access is required to get your precise location. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 15000,
        maximumAge: 10000,
      });

      const { latitude, longitude } = location.coords;
      
      // Store coordinates
      setCoordinates({ latitude, longitude });
      
      console.log('🎯 GPS Location captured:', {
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6),
        accuracy: location.coords.accuracy?.toFixed(0) + 'm',
        timestamp: new Date().toLocaleString()
      });
      
      // Try to reverse geocode to get readable address
      try {
        const geocoding = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        
        if (geocoding && geocoding.length > 0) {
          const addressComponents = geocoding[0];
          const formattedAddress = formatAddress(addressComponents);
          setAddress(formattedAddress);
          
          Alert.alert(
            'Location Found',
            `Your precise location has been set to: ${formattedAddress}`,
            [{ text: 'OK' }]
          );
        } else {
          // If no address found, use coordinates
          const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setAddress(coordsAddress);
          
          Alert.alert(
            'Location Set',
            `Your precise coordinates have been set: ${coordsAddress}`,
            [{ text: 'OK' }]
          );
        }
      } catch (geocodingError) {
        console.log('Geocoding error:', geocodingError);
        // Fallback to coordinates if reverse geocoding fails
        const coordsAddress = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setAddress(coordsAddress);
        
        Alert.alert(
          'Location Set',
          `Your precise coordinates have been set: ${coordsAddress}`,
          [{ text: 'OK' }]
        );
      }
      
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert(
        'Location Error',
        'Unable to get your current location. Please make sure location services are enabled and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsGettingLocation(false);
    }
  };

  const formatAddress = (addressComponents) => {
    const {
      streetNumber,
      street,
      district,
      city,
      region,
      country,
      postalCode
    } = addressComponents;

    let addressParts = [];
    
    if (streetNumber) addressParts.push(streetNumber);
    if (street) addressParts.push(street);
    if (district) addressParts.push(district);
    if (city) addressParts.push(city);
    if (region) addressParts.push(region);
    if (postalCode) addressParts.push(postalCode);
    
    return addressParts.join(', ');
  };

  return (
    <View style={{ marginBottom: 20 }}>
      {/* Address Input Field */}
      <View style={styles.inputWrapper}>
        <Ionicons
          name="location-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { flex: 1 }]}
          placeholder="Address (optional)"
          placeholderTextColor="#666"
          value={address}
          onChangeText={setAddress}
          autoCapitalize="words"
          multiline={true}
          numberOfLines={2}
        />
      </View>
      
      {/* GPS Button - Separate from input field */}
      <TouchableOpacity
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#007AFF',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginTop: 8,
          shadowColor: '#007AFF',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        onPress={getCurrentLocation}
        disabled={isGettingLocation}
        activeOpacity={0.8}
      >
        {isGettingLocation ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ 
              color: '#fff', 
              fontSize: 14, 
              fontWeight: '600',
              fontFamily: 'Montserrat-Regular'
            }}>
              Getting Location...
            </Text>
          </>
        ) : (
          <>
            <Ionicons name="navigate" size={18} color="#fff" style={{ marginRight: 8 }} />
            <Text style={{ 
              color: '#fff', 
              fontSize: 14, 
              fontWeight: '600',
              fontFamily: 'Montserrat-Regular'
            }}>
              Use My Current Location
            </Text>
          </>
        )}
      </TouchableOpacity>
      
      {/* Coordinates Display */}
      {coordinates && (
        <View style={{
          backgroundColor: '#f0f9ff',
          borderRadius: 12,
          padding: 16,
          marginTop: 12,
          borderWidth: 1,
          borderColor: '#007AFF',
          shadowColor: '#007AFF',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{
              backgroundColor: '#007AFF',
              borderRadius: 20,
              width: 32,
              height: 32,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12
            }}>
              <Ionicons name="location" size={18} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ 
                fontSize: 14, 
                fontWeight: '600', 
                color: '#1a1a1a',
                fontFamily: 'Montserrat-Regular'
              }}>
                Location Captured Successfully
              </Text>
              <Text style={{ 
                fontSize: 12, 
                color: '#666',
                marginTop: 2
              }}>
                Precise GPS coordinates saved
              </Text>
            </View>
          </View>
          
          <View style={{
            backgroundColor: '#e6f3ff',
            borderRadius: 8,
            padding: 12,
            marginTop: 8
          }}>
            <Text style={{ 
              fontSize: 12, 
              color: '#0066cc',
              fontFamily: 'Montserrat-Regular',
              textAlign: 'center'
            }}>
              📍 {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
            </Text>
            <Text style={{ 
              fontSize: 10, 
              color: '#666', 
              marginTop: 6,
              textAlign: 'center',
              fontStyle: 'italic'
            }}>
              This precise location will help emergency services find you quickly
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default LocationPicker;