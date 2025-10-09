import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../Components/UserContext';
import { useFamily } from '../Components/FamilyContext';
import styles from '../Styles/FamilyDetails.styles';

export default function FamilyDetails({ navigation }) {
  const { user } = useUser();
  const { family, familyCode, familyName, loading } = useFamily();
  
  const [refreshing, setRefreshing] = useState(false);

  // Get member status color
  const getMemberStatusColor = (status) => {
    switch (status) {
      case 'I\'m Safe':
      case 'Safe':
        return '#4CAF50'; // Green
      case 'Needs Help':
        return '#F44336'; // Red for Needs Help
      case 'Not Yet Responded':
        return '#FF9800'; // Orange
      case 'Evacuated':
      case 'Danger':
        return '#F44336'; // Red
      default:
        return '#9E9E9E'; // Gray for unknown
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // The real-time listener will automatically update the data
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This family member hasn\'t provided a phone number.');
      return;
    }
    
    const phoneUrl = Platform.OS === 'ios' ? `tel:${phoneNumber}` : `tel:${phoneNumber}`;
    
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calls are not supported on this device.');
        }
      })
      .catch((err) => console.error('Error opening phone:', err));
  };

  const handleSMS = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'This family member hasn\'t provided a phone number.');
      return;
    }
    
    const smsUrl = Platform.OS === 'ios' ? `sms:${phoneNumber}` : `sms:${phoneNumber}`;
    
    Linking.canOpenURL(smsUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(smsUrl);
        } else {
          Alert.alert('Error', 'SMS is not supported on this device.');
        }
      })
      .catch((err) => console.error('Error opening SMS:', err));
  };

  const openInGoogleMaps = (latitude, longitude, address) => {
    if (!latitude || !longitude) {
      Alert.alert('No Location', 'Location coordinates are not available.');
      return;
    }

    // Google Maps URL for coordinates
    const coords = `${latitude},${longitude}`;
    let url;

    if (Platform.OS === 'ios') {
      // iOS - Try Google Maps app first, fallback to Apple Maps
      url = `comgooglemaps://?q=${coords}&center=${coords}&zoom=16`;
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Fallback to Apple Maps
            const appleUrl = `http://maps.apple.com/?q=${coords}&ll=${coords}&z=16`;
            Linking.openURL(appleUrl);
          }
        })
        .catch(() => {
          // Last fallback to web Google Maps
          const webUrl = `https://www.google.com/maps?q=${coords}`;
          Linking.openURL(webUrl);
        });
    } else {
      // Android - Try Google Maps app first, fallback to web
      url = `geo:${coords}?q=${coords}(${address || 'Location'})`;
      
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            // Fallback to web Google Maps
            const webUrl = `https://www.google.com/maps?q=${coords}`;
            Linking.openURL(webUrl);
          }
        })
        .catch(() => {
          // Last fallback to web Google Maps
          const webUrl = `https://www.google.com/maps?q=${coords}`;
          Linking.openURL(webUrl);
        });
    }
  };

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const lastSeen = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - lastSeen;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return lastSeen.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Family Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading family details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Family Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Family Info */}
        {familyName && (
          <View style={styles.familyInfoCard}>
            <Text style={styles.familyNameTitle}>{familyName}</Text>
            <View style={styles.familyCodeContainer}>
              <Text style={styles.familyCodeLabel}>Family Code:</Text>
              <Text style={styles.familyCodeText}>{familyCode}</Text>
            </View>
            <Text style={styles.familyMemberCount}>
              {family.length} member{family.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Family Members */}
        {family.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyTitle}>No Family Members</Text>
            <Text style={styles.emptySubtitle}>Invite family members using your family code</Text>
          </View>
        ) : (
          family.map((member, index) => (
            <View key={member.userId}>
              {/* Add "Family Members" header after the first card (current user) */}
              {index === 1 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionHeaderText}>Family Members</Text>
                </View>
              )}
              
              <View style={[styles.memberCard, { borderLeftColor: getMemberStatusColor(member.status) }]}>
                {/* Member Header */}
                <View style={styles.memberHeader}>
                  <View style={styles.memberBasicInfo}>
                    <Ionicons name="person-circle" size={50} color="#2196F3" />
                    <View style={styles.memberNameSection}>
                      <View style={styles.memberNameRow}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        {member.isAdmin && (
                          <View style={styles.adminBadge}>
                            <Ionicons name="star" size={12} color="#FF9800" />
                            <Text style={styles.adminText}>Admin</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.statusRow}>
                        <View style={[styles.statusDot, { backgroundColor: getMemberStatusColor(member.status) }]} />
                        <Text style={[styles.statusText, { color: getMemberStatusColor(member.status) }]}>
                          {member.status || 'Safe'}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Contact Information */}
                <View style={styles.contactSection}>
                  <View style={styles.contactRow}>
                    <Ionicons name="mail" size={16} color="#666" />
                    <Text style={styles.contactText}>{member.email}</Text>
                  </View>
                  
                  {member.phoneNumber && (
                    <View style={styles.contactRow}>
                      <Ionicons name="call" size={16} color="#666" />
                      <Text style={styles.contactText}>{member.phoneNumber}</Text>
                      <View style={styles.contactActions}>
                        <TouchableOpacity
                          style={styles.contactButton}
                          onPress={() => handleCall(member.phoneNumber)}
                        >
                          <Ionicons name="call" size={16} color="#4CAF50" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.contactButton}
                          onPress={() => handleSMS(member.phoneNumber)}
                        >
                          <Ionicons name="chatbubble" size={16} color="#2196F3" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                </View>

                {/* Location Information */}
                <View style={styles.locationSection}>
                  <View style={styles.locationHeader}>
                    <View style={styles.locationTitleRow}>
                      <Ionicons name="location" size={16} color="#666" />
                      <Text style={styles.locationTitle}>Last Known Location</Text>
                    </View>
                    {(member.emergencyLocation || member.locationData || member.lastLocation) && (
                      <TouchableOpacity
                        style={styles.mapsButton}
                        onPress={() => {
                          const location = member.emergencyLocation || member.locationData || member.lastLocation;
                          openInGoogleMaps(location.latitude, location.longitude, location.address);
                        }}
                      >
                        <Ionicons name="map" size={16} color="#2196F3" />
                        <Text style={styles.mapsButtonText}>View on Maps</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  {(member.emergencyLocation || member.locationData || member.lastLocation) ? (
                    <View style={styles.locationDetails}>
                      {member.emergencyLocation ? (
                        <>
                          <Text style={styles.locationAddress}>
                            {member.emergencyLocation.address || 'Address not available'}
                          </Text>
                          <Text style={styles.locationCoords}>
                            {member.emergencyLocation.latitude?.toFixed(6)}, {member.emergencyLocation.longitude?.toFixed(6)}
                          </Text>
                          <Text style={styles.locationTime}>
                            Updated: {formatLastSeen(member.emergencyLocation.timestamp)}
                          </Text>
                          <Text style={[styles.locationSource, { color: '#4CAF50' }]}>Source: Emergency Location</Text>
                        </>
                      ) : member.locationData ? (
                        <>
                          <Text style={styles.locationAddress}>
                            Address not available
                          </Text>
                          <Text style={styles.locationCoords}>
                            {member.locationData.latitude?.toFixed(6)}, {member.locationData.longitude?.toFixed(6)}
                          </Text>
                          <Text style={styles.locationTime}>
                            Updated: {formatLastSeen(member.locationData.timestamp)}
                          </Text>
                          <Text style={[styles.locationSource, { color: '#2196F3' }]}>Source: Location Tracking</Text>
                        </>
                      ) : (
                        <>
                          <Text style={styles.locationAddress}>
                            {member.lastLocation.address || 'Address not available'}
                          </Text>
                          <Text style={styles.locationCoords}>
                            {member.lastLocation.latitude?.toFixed(6)}, {member.lastLocation.longitude?.toFixed(6)}
                          </Text>
                          <Text style={styles.locationTime}>
                            Updated: {formatLastSeen(member.lastLocation.timestamp)}
                          </Text>
                          <Text style={[styles.locationSource, { color: '#FF9800' }]}>Source: Legacy Data</Text>
                        </>
                      )}
                    </View>
                  ) : (
                    <View style={styles.noLocationContainer}>
                      <Text style={styles.noLocationText}>Location not shared</Text>
                      {user && member.userId === user.uid && (
                        <TouchableOpacity 
                          style={styles.enableLocationButton}
                          onPress={() => navigation.navigate('LocationSettings')}
                        >
                          <Ionicons name="location" size={16} color="#2196F3" />
                          <Text style={styles.enableLocationText}>Enable Location Sharing</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>

                {/* Additional Info */}
                {member.lastSeen && (
                  <View style={styles.lastSeenSection}>
                    <Text style={styles.lastSeenText}>
                      Last active: {formatLastSeen(member.lastSeen)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}