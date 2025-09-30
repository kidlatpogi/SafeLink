// Components/EnhancedBroadcastSettings.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
  Alert,
} from 'react-native';
import AlertRadiusSlider from './AlertRadiusSlider';

const EnhancedBroadcastSettings = ({ 
  locationBasedAlerts = true,
  severityFiltering = true,
  notificationSound = true,
  alertRadius = 50,
  onSettingsChange 
}) => {
  const [settings, setSettings] = useState({
    locationBasedAlerts,
    severityFiltering,
    notificationSound,
    alertRadius,
  });

  useEffect(() => {
    onSettingsChange(settings);
  }, [settings]);

  const handleToggle = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleRadiusChange = (radius) => {
    setSettings(prev => ({
      ...prev,
      alertRadius: radius
    }));
  };

  const renderSettingItem = (label, key, description = null) => (
    <View style={settingsStyles.settingItem}>
      <View style={settingsStyles.settingContent}>
        <Text style={settingsStyles.settingLabel}>{label}</Text>
        {description && (
          <Text style={settingsStyles.settingDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => handleToggle(key, value)}
        trackColor={{ false: '#ddd', true: '#FF6F00' }}
        thumbColor={settings[key] ? '#fff' : '#f4f3f4'}
        ios_backgroundColor="#ddd"
      />
    </View>
  );

  return (
    <View style={settingsStyles.container}>
      <Text style={settingsStyles.sectionTitle}>Broadcast Settings</Text>
      
      {renderSettingItem(
        'Location-Based Alerts',
        'locationBasedAlerts',
        'Receive alerts relevant to your current location'
      )}
      
      {renderSettingItem(
        'Severity Filtering',
        'severityFiltering',
        'Filter alerts based on emergency severity levels'
      )}
      
      {renderSettingItem(
        'Notification Sound',
        'notificationSound',
        'Play sound when receiving emergency alerts'
      )}
      
      {settings.locationBasedAlerts && (
        <View style={settingsStyles.radiusSection}>
          <AlertRadiusSlider
            value={settings.alertRadius}
            onValueChange={handleRadiusChange}
            minimumValue={10}
            maximumValue={100}
            step={10}
          />
          <Text style={settingsStyles.radiusNote}>
            You will receive alerts within this radius from your current location
          </Text>
        </View>
      )}
    </View>
  );
};

const settingsStyles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-VariableFont_wght',
    lineHeight: 16,
  },
  radiusSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  radiusNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
});

export default EnhancedBroadcastSettings;