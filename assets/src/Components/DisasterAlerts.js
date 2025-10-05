import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Linking
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DisasterAlertsService from '../utils/DisasterAlertsService';
import styles from '../Styles/DisasterAlerts.styles';

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
  if (lat >= 7.5 && lat <= 9.5 && lon >= 123.5 && lon <= 126.0) return 'Northern Mindanao';
  
  // Region 11 - Davao Region
  if (lat >= 5.5 && lat <= 8.0 && lon >= 125.0 && lon <= 126.5) return 'Davao Region';
  
  // Region 12 - SOCCSKSARGEN
  if (lat >= 5.5 && lat <= 7.5 && lon >= 124.0 && lon <= 125.5) return 'SOCCSKSARGEN';
  
  // Region 13 - Caraga
  if (lat >= 8.0 && lat <= 10.0 && lon >= 125.5 && lon <= 127.0) return 'Caraga';
  
  // BARMM - Bangsamoro Autonomous Region
  if (lat >= 4.5 && lat <= 7.0 && lon >= 119.5 && lon <= 124.0) return 'BARMM';
  
  return 'Philippines'; // Default fallback
};

const extractRegionFromLocation = (locationString) => {
  const location = locationString.toLowerCase();
  
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
    'bateria': 'Ilocos Region', // Added this - Bateria is in Ilocos Norte
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
    
    // Region 4B - MIMAROPA
    'marinduque': 'MIMAROPA',
    'occidental mindoro': 'MIMAROPA',
    'oriental mindoro': 'MIMAROPA',
    'palawan': 'MIMAROPA',
    'romblon': 'MIMAROPA',
    
    // Region 5 - Bicol
    'albay': 'Bicol Region',
    'camarines norte': 'Bicol Region',
    'camarines sur': 'Bicol Region',
    'catanduanes': 'Bicol Region',
    'masbate': 'Bicol Region',
    'sorsogon': 'Bicol Region',
    
    // Region 6 - Western Visayas
    'iloilo': 'Western Visayas',
    'capiz': 'Western Visayas',
    'aklan': 'Western Visayas',
    'antique': 'Western Visayas',
    'guimaras': 'Western Visayas',
    'negros occidental': 'Western Visayas',
    
    // Region 7 - Central Visayas
    'cebu': 'Central Visayas',
    'bohol': 'Central Visayas',
    'negros oriental': 'Central Visayas',
    'siquijor': 'Central Visayas',
    
    // Region 8 - Eastern Visayas
    'leyte': 'Eastern Visayas',
    'southern leyte': 'Eastern Visayas',
    'northern samar': 'Eastern Visayas',
    'eastern samar': 'Eastern Visayas',
    'western samar': 'Eastern Visayas',
    'samar': 'Eastern Visayas',
    'biliran': 'Eastern Visayas',
    
    // Region 11 - Davao
    'davao': 'Davao Region',
    'compostela valley': 'Davao Region',
    'davao del norte': 'Davao Region',
    'davao del sur': 'Davao Region',
    'davao occidental': 'Davao Region',
    'davao oriental': 'Davao Region'
  };
  
  for (const [key, region] of Object.entries(regionMap)) {
    if (location.includes(key)) {
      return region;
    }
  }
  
  return 'Philippines'; // Default fallback
};

const DisasterAlerts = ({ userLocation, maxAlerts = 10 }) => {
  const [alerts, setAlerts] = useState({
    earthquakes: [],
    weather: [],
    naturalEvents: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [filter, setFilter] = useState('all'); // all, critical, high, moderate, low, area

  useEffect(() => {
    loadDisasterAlerts();
    
    // Set up periodic refresh every 15 minutes
    const interval = setInterval(loadDisasterAlerts, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [userLocation]);

  const loadDisasterAlerts = async () => {
    try {
      setLoading(true);
      const lat = userLocation?.coords?.latitude || 14.5995; // Default to Manila
      const lon = userLocation?.coords?.longitude || 120.9842;
      
      const disasterData = await DisasterAlertsService.getAllDisasterAlerts(lat, lon);
      setAlerts(disasterData);
      setLastUpdated(disasterData.lastUpdated);
    } catch (error) {
      console.error('Error loading disaster alerts:', error);
      Alert.alert(
        'Error Loading Alerts',
        'Failed to load disaster alerts. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDisasterAlerts();
    setRefreshing(false);
  };

  const getFilteredAlerts = () => {
    const allAlerts = [
      ...alerts.earthquakes,
      ...alerts.weather,
      ...alerts.naturalEvents
    ];

    let filtered = allAlerts;
    
    if (filter === 'area') {
      // Filter alerts that are in the user's region/province
      const userLat = userLocation?.coords?.latitude || 14.5995;
      const userLon = userLocation?.coords?.longitude || 120.9842;
      
      filtered = allAlerts.filter(alert => {
        // If alert has location string, check if it matches user's region
        if (alert.location) {
          // Get user's region from coordinates (simplified mapping for Philippines)
          const userRegion = getRegionFromCoordinates(userLat, userLon);
          const alertRegion = extractRegionFromLocation(alert.location);
          
          return alertRegion === userRegion; // Only exact region match, no substring checking
        }
        
        // If alert has coordinates, check if they're in the same region
        if (alert.latitude && alert.longitude) {
          const userRegion = getRegionFromCoordinates(userLat, userLon);
          const alertRegion = getRegionFromCoordinates(alert.latitude, alert.longitude);
          
          return userRegion === alertRegion;
        }
        
        return false; // Exclude if no location data
      });
    } else if (filter !== 'all') {
      filtered = allAlerts.filter(alert => alert.severity === filter);
    }

    // Sort by severity and time (most recent first)
    const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1, minimal: 0 };
    
    return filtered
      .sort((a, b) => {
        const severityDiff = (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        if (severityDiff !== 0) return severityDiff;
        
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
    const iconMap = {
      earthquake: 'pulse',
      weather: 'thunderstorm',
      natural_event: 'warning'
    };
    
    if (severity === 'critical') return 'alert';
    return iconMap[type] || 'information-circle';
  };

  const handleAlertPress = (alert) => {
    const formatTime = (timeString) => {
      return new Date(timeString).toLocaleString();
    };

    let message = alert.description || `${alert.type.replace('_', ' ')} alert in ${alert.location || 'your area'}`;
    
    if (alert.type === 'earthquake') {
      message = `Magnitude ${alert.magnitude} earthquake detected.\nLocation: ${alert.location}\nTime: ${formatTime(alert.time)}\nDepth: ${alert.depth}km`;
    } else if (alert.type === 'weather') {
      message = `${alert.description}\nStart: ${formatTime(alert.startTime)}\nEnd: ${formatTime(alert.endTime)}\nSource: ${alert.sender}`;
    }

    Alert.alert(
      alert.title,
      message,
      [
        { text: 'Dismiss', style: 'cancel' },
        ...(alert.url ? [{ 
          text: 'More Info', 
          onPress: () => Linking.openURL(alert.url) 
        }] : [])
      ]
    );
  };

  const renderAlert = (alert, index) => (
    <TouchableOpacity
      key={`${alert.type}_${alert.id}_${index}`}
      style={[styles.alertCard, { borderLeftColor: getSeverityColor(alert.severity) }]}
      onPress={() => handleAlertPress(alert)}
    >
      <View style={styles.alertHeader}>
        <View style={styles.alertIconContainer}>
          <Ionicons
            name={getSeverityIcon(alert.type, alert.severity)}
            size={24}
            color={getSeverityColor(alert.severity)}
          />
        </View>
        <View style={styles.alertContent}>
          <Text style={styles.alertTitle} numberOfLines={2}>
            {alert.title}
          </Text>
          <Text style={styles.alertType}>
            {alert.type.replace('_', ' ').toUpperCase()} • {alert.severity.toUpperCase()}
          </Text>
        </View>
        <View style={styles.alertTime}>
          <Text style={styles.timeText}>
            {new Date(alert.time || alert.startTime || alert.startDate).toLocaleDateString()}
          </Text>
          {alert.magnitude && (
            <Text style={styles.magnitudeText}>M{alert.magnitude}</Text>
          )}
        </View>
      </View>
      
      {alert.location && (
        <View style={styles.alertLocation}>
          <Ionicons name="location" size={14} color="#6b7280" />
          <Text style={styles.locationText}>{alert.location}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (filterValue, label, count) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === filterValue && styles.activeFilterButton
      ]}
      onPress={() => setFilter(filterValue)}
    >
      <Text style={[
        styles.filterButtonText,
        filter === filterValue && styles.activeFilterButtonText
      ]}>
        {label} {count > 0 && `(${count})`}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F00" />
        <Text style={styles.loadingText}>Loading disaster alerts...</Text>
      </View>
    );
  }

  const filteredAlerts = getFilteredAlerts();
  const allAlerts = [...alerts.earthquakes, ...alerts.weather, ...alerts.naturalEvents];
  
  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const highCount = allAlerts.filter(a => a.severity === 'high').length;
  const moderateCount = allAlerts.filter(a => a.severity === 'moderate').length;
  const lowCount = allAlerts.filter(a => a.severity === 'low' || a.severity === 'minimal').length;
  
  // Calculate area count (region-based)
  const userLat = userLocation?.coords?.latitude || 14.5995;
  const userLon = userLocation?.coords?.longitude || 120.9842;
  const userRegion = getRegionFromCoordinates(userLat, userLon);
  
  // Debug: Log user's detected region
  console.log(`User coordinates: ${userLat}, ${userLon}`);
  console.log(`User detected region: ${userRegion}`);
  
  const areaCount = allAlerts.filter(alert => {
    // Debug: Log each alert's region detection
    let alertRegion = 'Unknown';
    let matches = false;
    
    // Check by location string
    if (alert.location) {
      alertRegion = extractRegionFromLocation(alert.location);
      matches = alertRegion === userRegion; // Only exact region match
      console.log(`Alert "${alert.title}" - Location: "${alert.location}" - Detected Region: "${alertRegion}" - Matches: ${matches}`);
      if (matches) return true;
    }
    
    // Check by coordinates
    if (alert.latitude && alert.longitude) {
      alertRegion = getRegionFromCoordinates(alert.latitude, alert.longitude);
      matches = userRegion === alertRegion;
      console.log(`Alert "${alert.title}" - Coords: ${alert.latitude}, ${alert.longitude} - Detected Region: "${alertRegion}" - Matches: ${matches}`);
      return matches;
    }
    
    console.log(`Alert "${alert.title}" - No location data - Excluded`);
    return false;
  }).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="alert-circle" size={24} color="#FF6F00" />
          <Text style={styles.headerTitle}>Disaster Alerts</Text>
        </View>
        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Updated: {new Date(lastUpdated).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {renderFilterButton('all', 'All', allAlerts.length)}
        {renderFilterButton('area', 'In My Area', areaCount)}
        {renderFilterButton('critical', 'Critical', criticalCount)}
        {renderFilterButton('high', 'High', highCount)}
        {renderFilterButton('moderate', 'Moderate', moderateCount)}
        {renderFilterButton('low', 'Low', lowCount)}
      </ScrollView>

      {/* Alerts List */}
      <ScrollView
        style={styles.alertsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => renderAlert(alert, index))
        ) : (
          <View style={styles.noAlertsContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#059669" />
            <Text style={styles.noAlertsTitle}>No Alerts</Text>
            <Text style={styles.noAlertsText}>
              {filter === 'all' 
                ? 'No disaster alerts in your area at this time.'
                : `No ${filter} severity alerts found.`
              }
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Stats Footer */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{alerts.earthquakes.length}</Text>
          <Text style={styles.statLabel}>Earthquakes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{alerts.weather.length}</Text>
          <Text style={styles.statLabel}>Weather</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{alerts.naturalEvents.length}</Text>
          <Text style={styles.statLabel}>Natural Events</Text>
        </View>
      </View>
    </View>
  );
};

export default DisasterAlerts;
