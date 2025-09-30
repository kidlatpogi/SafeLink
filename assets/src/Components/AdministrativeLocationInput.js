// Components/AdministrativeLocationInput.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import styles from '../Styles/Create_Account.styles';

const AdministrativeLocationInput = ({ 
  country = '',
  province = '',
  municipality = '',
  barangay = '',
  onLocationChange,
  coordinates = null 
}) => {
  const [locationData, setLocationData] = useState({
    country: country,
    province: province,
    municipality: municipality,
    barangay: barangay
  });
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  // Auto-fill from coordinates when available
  const autoFillFromCoordinates = async () => {
    if (!coordinates) {
      Alert.alert('Location Required', 'Please select your location first to auto-fill administrative details.');
      return;
    }

    try {
      setIsAutoFilling(true);
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (reverseGeocode && reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        
        const newLocationData = {
          country: location.country || locationData.country,
          province: location.region || location.subregion || locationData.province,
          municipality: location.city || location.district || locationData.municipality,
          barangay: location.street || location.name || locationData.barangay
        };

        setLocationData(newLocationData);
        onLocationChange(newLocationData);
        
        Alert.alert('Success', 'Administrative location details have been auto-filled from your coordinates!');
      } else {
        Alert.alert('No Data', 'Could not retrieve administrative details for this location.');
      }
    } catch (error) {
      console.error('Auto-fill error:', error);
      Alert.alert('Error', 'Failed to auto-fill location details. Please enter manually.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Update parent when local state changes
  useEffect(() => {
    onLocationChange(locationData);
  }, [locationData]);

  const updateField = (field, value) => {
    setLocationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <View style={enhancedInputStyles.container}>
      <Text style={enhancedInputStyles.sectionTitle}>Administrative Location</Text>
      
      {/* Auto-fill button */}
      <TouchableOpacity 
        style={enhancedInputStyles.autoFillButton}
        onPress={autoFillFromCoordinates}
        disabled={isAutoFilling || !coordinates}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          {isAutoFilling ? (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="location" size={18} color="white" style={{ marginRight: 8 }} />
          )}
          <Text style={enhancedInputStyles.autoFillText}>
            {isAutoFilling ? 'Auto-filling...' : 'Auto-fill from Location'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Country Input */}
      <View style={enhancedInputStyles.inputContainer}>
        <Text style={enhancedInputStyles.inputLabel}>Country</Text>
        <View style={enhancedInputStyles.inputWrapper}>
          <Ionicons name="globe-outline" size={20} color="#FF6F00" style={enhancedInputStyles.inputIcon} />
          <TextInput
            style={enhancedInputStyles.input}
            placeholder="Country (e.g., Philippines)"
            value={locationData.country}
            onChangeText={(text) => updateField('country', text)}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Province Input */}
      <View style={enhancedInputStyles.inputContainer}>
        <Text style={enhancedInputStyles.inputLabel}>Province/State</Text>
        <View style={enhancedInputStyles.inputWrapper}>
          <Ionicons name="map-outline" size={20} color="#FF6F00" style={enhancedInputStyles.inputIcon} />
          <TextInput
            style={enhancedInputStyles.input}
            placeholder="Province/State (e.g., Metro Manila)"
            value={locationData.province}
            onChangeText={(text) => updateField('province', text)}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Municipality Input */}
      <View style={enhancedInputStyles.inputContainer}>
        <Text style={enhancedInputStyles.inputLabel}>Municipality/City</Text>
        <View style={enhancedInputStyles.inputWrapper}>
          <Ionicons name="business-outline" size={20} color="#FF6F00" style={enhancedInputStyles.inputIcon} />
          <TextInput
            style={enhancedInputStyles.input}
            placeholder="Municipality/City (e.g., Quezon City)"
            value={locationData.municipality}
            onChangeText={(text) => updateField('municipality', text)}
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* Barangay Input */}
      <View style={enhancedInputStyles.inputContainer}>
        <Text style={enhancedInputStyles.inputLabel}>Barangay/District</Text>
        <View style={enhancedInputStyles.inputWrapper}>
          <Ionicons name="home-outline" size={20} color="#FF6F00" style={enhancedInputStyles.inputIcon} />
          <TextInput
            style={enhancedInputStyles.input}
            placeholder="Barangay/District (e.g., Commonwealth)"
            value={locationData.barangay}
            onChangeText={(text) => updateField('barangay', text)}
            autoCapitalize="words"
          />
        </View>
      </View>

      <Text style={enhancedInputStyles.helperText}>
        These details help provide precise emergency alerts for your area. 
        Use the auto-fill button to populate from your selected location.
      </Text>
    </View>
  );
};

// Enhanced styling for better appearance
const enhancedInputStyles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  autoFillText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
});

export default AdministrativeLocationInput;