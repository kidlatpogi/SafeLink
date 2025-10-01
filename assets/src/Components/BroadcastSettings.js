// Components/BroadcastSettings.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  Modal,
  Pressable,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../Styles/Create_Account.styles';

const RADIUS_OPTIONS = [
  { value: 10, label: '10 km - Immediate Area' },
  { value: 15, label: '15 km - Nearby Areas' },
  { value: 20, label: '20 km - Extended Area' },
  { value: 25, label: '25 km - Regional' },
  { value: 30, label: '30 km - Wide Area' },
  { value: 40, label: '40 km - Metropolitan' },
  { value: 50, label: '50 km - Provincial' },
];

const BROADCAST_SETTINGS_KEY = 'broadcastSettings';

const BroadcastSettings = ({ 
  onSettingsChange,
  initialRadius = 20,
  initialLocationBased = true,
  initialAdminBased = true 
}) => {
  const [settings, setSettings] = useState({
    radiusEnabled: initialLocationBased,
    radius: initialRadius,
    adminEnabled: initialAdminBased,
  });
  const [showRadiusModal, setShowRadiusModal] = useState(false);

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings();
    onSettingsChange(settings);
  }, [settings]);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem(BROADCAST_SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({
          radiusEnabled: parsed.radiusEnabled ?? true,
          radius: parsed.radius ?? 20,
          adminEnabled: parsed.adminEnabled ?? true,
        });
      }
    } catch (error) {
      console.warn('Failed to load broadcast settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await AsyncStorage.setItem(BROADCAST_SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn('Failed to save broadcast settings:', error);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const selectRadius = (radius) => {
    updateSetting('radius', radius);
    setShowRadiusModal(false);
  };

  const getBatteryImpactText = (radius) => {
    if (radius <= 15) return '🟢 Low battery impact';
    if (radius <= 25) return '🟡 Medium battery impact';
    return '🔴 High battery impact';
  };

  return (
    <View style={enhancedStyles.container}>
      {/* Location-Based Section */}
      <View style={enhancedStyles.section}>
        <Text style={enhancedStyles.subsectionTitle}>🗺️ Location-Based Alerts</Text>
        
        <View style={enhancedStyles.settingRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="location" size={20} color="#FF6F00" style={{ marginRight: 10 }} />
              <Text style={enhancedStyles.settingText}>Enable Location Alerts</Text>
            </View>
            <Text style={enhancedStyles.settingDescription}>
              Receive alerts within a radius of your current location
            </Text>
          </View>
          <Switch
            value={settings.radiusEnabled}
            onValueChange={(value) => updateSetting('radiusEnabled', value)}
            trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
            thumbColor={settings.radiusEnabled ? '#FF6F00' : '#9ca3af'}
          />
        </View>

        {/* Radius selection (only show if location-based is enabled) */}
        {settings.radiusEnabled && (
          <TouchableOpacity 
            style={enhancedStyles.radiusSelector}
            onPress={() => setShowRadiusModal(true)}
          >
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="radio-outline" size={20} color="#FF6F00" style={{ marginRight: 10 }} />
                <Text style={enhancedStyles.settingText}>Alert Radius: {settings.radius} km</Text>
              </View>
              <Text style={enhancedStyles.settingDescription}>
                {getBatteryImpactText(settings.radius)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Administrative Area Section */}
      <View style={enhancedStyles.section}>
        <Text style={enhancedStyles.subsectionTitle}>🏛️ Administrative Area Alerts</Text>
        
        <View style={enhancedStyles.settingRow}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="business" size={20} color="#FF6F00" style={{ marginRight: 10 }} />
              <Text style={enhancedStyles.settingText}>Administrative Alerts</Text>
            </View>
            <Text style={enhancedStyles.settingDescription}>
              Receive alerts for your barangay, municipality, and province
            </Text>
          </View>
          <Switch
            value={settings.adminEnabled}
            onValueChange={(value) => updateSetting('adminEnabled', value)}
            trackColor={{ false: '#d1d5db', true: '#fed7aa' }}
            thumbColor={settings.adminEnabled ? '#FF6F00' : '#9ca3af'}
          />
        </View>
      </View>

      {/* Battery Information Section */}
      <View style={enhancedStyles.infoSection}>
        <View style={enhancedStyles.infoHeader}>
          <Ionicons name="battery-charging" size={20} color="#4CAF50" />
          <Text style={enhancedStyles.infoTitle}>💡 Battery Optimization Tips</Text>
        </View>
        <Text style={enhancedStyles.infoText}>
          • Smaller radius = longer battery life{'\n'}
          • Administrative alerts use minimal battery{'\n'}
          • Location alerts require GPS tracking
        </Text>
      </View>

      {/* Radius Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showRadiusModal}
        onRequestClose={() => setShowRadiusModal(false)}
      >
        <View style={enhancedStyles.modalOverlay}>
          <View style={enhancedStyles.modalContainer}>
            <Text style={enhancedStyles.modalTitle}>Select Alert Radius</Text>
            
            {RADIUS_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  enhancedStyles.radiusOption,
                  settings.radius === option.value && enhancedStyles.selectedOption
                ]}
                onPress={() => selectRadius(option.value)}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[
                    enhancedStyles.radiusOptionText,
                    settings.radius === option.value && enhancedStyles.selectedOptionText
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={enhancedStyles.batteryText}>
                    {getBatteryImpactText(option.value)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={enhancedStyles.modalButton}
              onPress={() => setShowRadiusModal(false)}
            >
              <Text style={enhancedStyles.modalButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Enhanced styles for better appearance and spacing
const enhancedStyles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    fontFamily: 'Montserrat-VariableFont_wght',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  radiusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 4,
    marginLeft: 30,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  infoSection: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginLeft: 8,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  radiusOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    borderBottomColor: '#f59e0b',
  },
  radiusOptionText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  selectedOptionText: {
    fontWeight: '600',
    color: '#92400e',
  },
  batteryText: {
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  modalButton: {
    backgroundColor: '#FF6F00',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
});

// Export function to get current settings
export const getBroadcastSettings = async () => {
  try {
    const savedSettings = await AsyncStorage.getItem(BROADCAST_SETTINGS_KEY);
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      radiusEnabled: true,
      radius: 20,
      adminEnabled: true,
    };
  } catch (error) {
    console.warn('Failed to get broadcast settings:', error);
    return {
      radiusEnabled: true,
      radius: 20,
      adminEnabled: true,
    };
  }
};

export default BroadcastSettings;