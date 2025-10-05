import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DisasterAlertsService from '../utils/DisasterAlertsService';

// Helper functions for region detection
const getRegionFromCoordinates = (lat, lon) => {
  // More precise Philippine region mapping based on coordinates
  // Luzon regions (from north to south, west to east)
  
  // Region 1 - Ilocos Region
  if (lat >= 15.5 && lat <= 18.5 && lon >= 120.0 && lon <= 121.5) return 'Ilocos Region';
  
  // Region 2 - Cagayan Valley  
  if (lat >= 16.0 && lat <= 18.5 && lon >= 121.5 && lon <= 122.5) return 'Cagayan Valley';
  
  // Region 3 - Central Luzon
  if (lat >= 14.5 && lat <= 16.0 && lon >= 119.5 && lon <= 121.5) return 'Central Luzon';
  
  // NCR - National Capital Region
  if (lat >= 14.4 && lat <= 14.8 && lon >= 120.9 && lon <= 121.2) return 'National Capital Region';
  
  // Region 4A - CALABARZON
  if (lat >= 13.5 && lat <= 14.8 && lon >= 120.5 && lon <= 122.0) return 'CALABARZON';
  
  // Region 4B - MIMAROPA
  if (lat >= 12.0 && lat <= 14.0 && lon >= 119.5 && lon <= 121.5) return 'MIMAROPA';
  
  // Region 5 - Bicol Region
  if (lat >= 12.0 && lat <= 14.5 && lon >= 122.5 && lon <= 124.5) return 'Bicol Region';
  
  // Region 6 - Western Visayas
  if (lat >= 10.0 && lat <= 12.0 && lon >= 121.5 && lon <= 123.5) return 'Western Visayas';
  
  // Region 7 - Central Visayas
  if (lat >= 9.0 && lat <= 11.5 && lon >= 123.0 && lon <= 125.0) return 'Central Visayas';
  
  // Region 8 - Eastern Visayas
  if (lat >= 10.0 && lat <= 12.5 && lon >= 124.5 && lon <= 126.0) return 'Eastern Visayas';
  
  // Region 9 - Zamboanga Peninsula
  if (lat >= 6.5 && lat <= 8.5 && lon >= 121.5 && lon <= 123.5) return 'Zamboanga Peninsula';
  
  // Region 10 - Northern Mindanao
  if (lat >= 8.0 && lat <= 10.0 && lon >= 123.5 && lon <= 125.5) return 'Northern Mindanao';
  
  // Region 11 - Davao Region
  if (lat >= 5.5 && lat <= 8.0 && lon >= 125.0 && lon <= 126.5) return 'Davao Region';
  
  // Region 12 - SOCCSKSARGEN
  if (lat >= 5.0 && lat <= 7.0 && lon >= 124.0 && lon <= 125.5) return 'SOCCSKSARGEN';
  
  // Fallback for all Philippines
  if (lat >= 4.0 && lat <= 21.0 && lon >= 116.0 && lon <= 127.0) return 'Philippines';
  
  return 'Philippines'; // Default fallback
};

const extractRegionFromLocation = (location) => {
  if (!location) return 'Unknown';
  
  const locationLower = location.toLowerCase();
  
  // Map common location terms to regions
  const regionMap = {
    // NCR
    'metro manila': 'National Capital Region',
    'ncr': 'National Capital Region',
    'manila': 'National Capital Region',
    'quezon city': 'National Capital Region',
    'makati': 'National Capital Region',
    'taguig': 'National Capital Region',
    'pasig': 'National Capital Region',
    
    // Region 1 - Ilocos
    'ilocos norte': 'Ilocos Region',
    'ilocos sur': 'Ilocos Region',
    'la union': 'Ilocos Region',
    'pangasinan': 'Ilocos Region',
    'bateria': 'Ilocos Region',
    'vigan': 'Ilocos Region',
    'laoag': 'Ilocos Region',
    
    // Region 2 - Cagayan Valley
    'cagayan': 'Cagayan Valley',
    'isabela': 'Cagayan Valley',
    'nueva vizcaya': 'Cagayan Valley',
    'quirino': 'Cagayan Valley',
    
    // Region 3 - Central Luzon
    'pampanga': 'Central Luzon',
    'bulacan': 'Central Luzon',
    'nueva ecija': 'Central Luzon',
    'tarlac': 'Central Luzon',
    'zambales': 'Central Luzon',
    'bataan': 'Central Luzon',
    'aurora': 'Central Luzon',
    
    // Region 4A - CALABARZON
    'cavite': 'CALABARZON',
    'laguna': 'CALABARZON',
    'batangas': 'CALABARZON',
    'rizal': 'CALABARZON',
    'quezon': 'CALABARZON',
    
    // Add more regions as needed...
    'cebu': 'Central Visayas',
    'bohol': 'Central Visayas',
    'negros oriental': 'Central Visayas',
    'siquijor': 'Central Visayas',
    
    'iloilo': 'Western Visayas',
    'capiz': 'Western Visayas',
    'aklan': 'Western Visayas',
    'antique': 'Western Visayas',
    'guimaras': 'Western Visayas',
    'negros occidental': 'Western Visayas',
    
    'leyte': 'Eastern Visayas',
    'samar': 'Eastern Visayas',
    'biliran': 'Eastern Visayas',
    
    'davao': 'Davao Region',
    'compostela valley': 'Davao Region',
    
    // Special mappings for broad areas - these should match with any Philippine region
    'luzon': 'Philippines',
    'visayas': 'Philippines',
    'mindanao': 'Philippines',
    'philippines': 'Philippines',
  };
  
  for (const [key, region] of Object.entries(regionMap)) {
    if (locationLower.includes(key)) {
      return region;
    }
  }
  
  return 'Philippines'; // Default fallback
};

const CompactDisasterAlerts = ({ userLocation, navigation, maxAlerts = 1 }) => {
  const [alerts, setAlerts] = useState({
    earthquakes: [],
    weather: [],
    naturalEvents: []
  });
  const [loading, setLoading] = useState(true);

  // Safe navigation function
  const safeNavigate = (screenName, params = {}) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screenName, params);
    } else {
      console.error('CompactDisasterAlerts: Navigation is not available');
    }
  };

  // Load disaster alerts
  useEffect(() => {
    loadAlerts();
    // Set up periodic refresh every 30 seconds
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      
      const userLat = userLocation?.coords?.latitude || 14.5995; // Manila fallback
      const userLon = userLocation?.coords?.longitude || 120.9842; // Manila fallback
      
      const disasterData = await DisasterAlertsService.getAllDisasterAlerts(userLat, userLon);
      
      setAlerts({
        earthquakes: disasterData.earthquakes || [],
        weather: disasterData.weather || [],
        naturalEvents: disasterData.naturalEvents || []
      });
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAlertInUserArea = (alert, userLat, userLon) => {
    const userRegion = getRegionFromCoordinates(userLat, userLon);
    
    // Check by location string first
    if (alert.location) {
      const alertRegion = extractRegionFromLocation(alert.location);
      
      // Direct region match
      if (alertRegion === userRegion) {
        return true;
      }
      
      // If alert is for all Philippines and user is in Philippines, consider it local
      if (alertRegion === 'Philippines' && userRegion !== 'Unknown' && userRegion !== 'Philippines') {
        return true;
      }
    }
    
    // Check by coordinates
    if (alert.latitude && alert.longitude) {
      const alertRegion = getRegionFromCoordinates(alert.latitude, alert.longitude);
      return userRegion === alertRegion;
    }
    
    return false;
  };

  const getTopAlerts = () => {
    const allAlerts = [
      ...alerts.earthquakes,
      ...alerts.weather,
      ...alerts.naturalEvents
    ];

    // For testing purposes, if location is outside Philippines, use default Philippines location
    const userLat = userLocation?.coords?.latitude || 14.5995; // Manila fallback
    const userLon = userLocation?.coords?.longitude || 120.9842; // Manila fallback

    // Add area flag to each alert
    const alertsWithAreaFlag = allAlerts.map(alert => ({
      ...alert,
      isInUserArea: isAlertInUserArea(alert, userLat, userLon)
    }));

    // Sort by area priority first, then severity and time
    const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1, minimal: 0 };
    
    return alertsWithAreaFlag
      .sort((a, b) => {
        // First priority: alerts in user's area
        if (a.isInUserArea && !b.isInUserArea) return -1;
        if (!a.isInUserArea && b.isInUserArea) return 1;
        
        // Second priority: severity
        const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        if (severityDiff !== 0) return severityDiff;
        
        // Third priority: time (most recent first)
        const timeA = new Date(a.time || a.startTime || a.startDate).getTime();
        const timeB = new Date(b.time || b.startTime || b.startDate).getTime();
        return timeB - timeA;
      })
      .slice(0, maxAlerts);
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: '#dc2626',
      high: '#ea580c',
      moderate: '#d97706',
      low: '#65a30d',
      minimal: '#059669'
    };
    return colors[severity] || '#6b7280';
  };

  const getSeverityIcon = (type, severity) => {
    if (severity === 'critical') return 'warning';
    if (type === 'earthquake') return 'pulse';
    if (type === 'weather') return 'thunderstorm';
    return 'information-circle';
  };

  const getSimpleMessage = (alert) => {
    if (alert.type === 'earthquake') {
      return `Earthquake detected`;
    }
    if (alert.type === 'weather') {
      if (alert.title.toLowerCase().includes('typhoon')) {
        return 'Typhoon alert';
      }
      if (alert.title.toLowerCase().includes('rain')) {
        return 'Heavy rain alert';
      }
      return 'Weather alert';
    }
    return 'Emergency alert';
  };

  const getSeverityText = (severity) => {
    const severityMap = {
      critical: 'URGENT',
      high: 'Important',
      moderate: 'Alert',
      low: 'Notice',
      minimal: 'Info'
    };
    return severityMap[severity] || 'Alert';
  };

  const renderCompactAlert = (alert, index) => (
    <View
      key={`${alert.type}_${alert.id}_${index}`}
      style={[styles.compactAlertItem, { backgroundColor: getSeverityColor(alert.severity) + '15' }]}
    >
      <View style={styles.alertIconBig}>
        <Ionicons
          name={getSeverityIcon(alert.type, alert.severity)}
          size={28}
          color={getSeverityColor(alert.severity)}
        />
      </View>
      
      <View style={styles.compactAlertContent}>
        <View style={styles.alertTopRow}>
          <Text style={styles.simpleMessage}>{getSimpleMessage(alert)}</Text>
          {alert.isInUserArea && (
            <View style={styles.areaLabel}>
              <Text style={styles.areaLabelText}>NEAR YOU</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.severityText}>{getSeverityText(alert.severity)}</Text>
        
        {alert.location && (
          <Text style={styles.simpleLocation}>{alert.location}</Text>
        )}
      </View>
    </View>
  );

  const topAlerts = getTopAlerts();
  const totalAlerts = alerts.earthquakes.length + alerts.weather.length + alerts.naturalEvents.length;

  return (
    <View style={styles.compactContainer}>
      {/* Header */}
      <View style={styles.compactHeader}>
        <View style={styles.compactHeaderLeft}>
          <Ionicons name="shield-checkmark" size={22} color="#FF6F00" />
          <Text style={styles.compactHeaderTitle}>Safety Updates</Text>
        </View>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => safeNavigate('RealTimeAlerts')}
        >
          <Text style={styles.viewAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#FF6F00" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.compactLoadingContainer}>
          <ActivityIndicator size="small" color="#FF6F00" />
          <Text style={styles.compactLoadingText}>Loading alerts...</Text>
        </View>
      ) : topAlerts.length > 0 ? (
        <View style={styles.compactAlertsList}>
          {topAlerts.map((alert, index) => renderCompactAlert(alert, index))}
        </View>
      ) : (
        <View style={styles.compactNoAlerts}>
          <Ionicons name="checkmark-circle" size={32} color="#059669" />
          <Text style={styles.compactNoAlertsText}>All Clear!</Text>
          <Text style={styles.compactNoAlertsSubtext}>No emergency alerts right now</Text>
        </View>
      )}
    </View>
  );
};

const styles = {
  compactContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginLeft: 8,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6F00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
    marginRight: 4,
  },
  compactLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  compactLoadingText: {
    fontSize: 16,
    color: '#6b7280',
    marginLeft: 8,
  },
  compactAlertsList: {
    gap: 16,
  },
  compactAlertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  alertIconBig: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactAlertContent: {
    flex: 1,
  },
  alertTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  simpleMessage: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  severityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6F00',
    marginBottom: 4,
  },
  simpleLocation: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  areaLabel: {
    backgroundColor: '#FF6F00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  areaLabelText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  compactNoAlerts: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  compactNoAlertsText: {
    fontSize: 18,
    color: '#059669',
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  compactNoAlertsSubtext: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
};

export default CompactDisasterAlerts;