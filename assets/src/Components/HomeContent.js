import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from './UserContext';
import { useFamily } from './FamilyContext';
import useLocation from './useLocation';
import CompactDisasterAlerts from './CompactDisasterAlerts';
import styles from "../Styles/Home.styles";
import EvacIcon from "../Images/map.png";

const HomeContent = ({ displayName, navigation }) => {
  const { userId } = useUser();
  const { family, userStatus } = useFamily();
  
  // Debug navigation and family data
  useEffect(() => {
    console.log('HomeContent - Navigation prop:', !!navigation);
    console.log('HomeContent - Family data:', { 
      familyCount: family?.length || 0, 
      userStatus, 
      family: family 
    });
  }, [family, userStatus, navigation]);
  
  // Use optimized location hook with automatic tracking
  const { location, loading: locationLoading, error: locationError } = useLocation();

  // Safe navigation function
  const safeNavigate = (screenName, params = {}) => {
    if (navigation && navigation.navigate) {
      navigation.navigate(screenName, params);
    } else {
      console.error('Navigation is not available');
    }
  };

  // Get status color for Family Check-In
  const getStatusColor = () => {
    switch (userStatus) {
      case "I'm Safe":
        return "#4CAF50";
      case "Not Yet Responded":
        return "#FF9800";
      case "Unknown":
        return "#9E9E9E";
      case "Evacuated":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  // Get status color for any member status
  const getMemberStatusColor = (status) => {
    switch (status) {
      case "I'm Safe":
      case "SAFE":
        return "#4CAF50";
      case "Not Yet Responded":
        return "#FF9800";
      case "Unknown":
        return "#9E9E9E";
      case "Evacuated":
      case "DANGER":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };



  return (
    <>
      {/* Greeting */}
      <Text style={styles.greeting}>Hi, {displayName}!</Text>

      {/* Compact Disaster Alerts */}
      <CompactDisasterAlerts 
        userLocation={location} 
        navigation={navigation} 
        maxAlerts={1} 
      />

      <View style={styles.sectionRow}>
        {/* Left Column - Top Row */}
        <View style={styles.column}>
          {/* Evacuation Centers - HIGH PRIORITY */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Evacuation Centers</Text>
            </View>
            
            <View style={styles.sectionContent}>
              <Ionicons name="shield-checkmark" size={38} color="#FF6F00" />
              
              <View style={styles.evacuationInfoRow}>
                <Ionicons name="location" size={14} color="#FF6F00" />
                <Text style={styles.evacuationInfoText}>
                  {location?.latitude && location?.longitude 
                    ? "Showing nearest centers" 
                    : "Loading locations..."}
                </Text>
              </View>
              
              <View style={styles.evacuationButtonsContainer}>
                <TouchableOpacity
                  style={styles.evacuationButtonSecondary}
                  onPress={() => safeNavigate("EvacuationCenters")}
                  activeOpacity={0.8}
                >
                  <Ionicons name="map" size={12} color="#FF6F00" />
                  <Text style={styles.evacuationButtonSecondaryText}>VIEW ALL</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.evacuationButtonPrimary}
                  onPress={() => {
                    console.log('ROUTE NEAREST button pressed - navigating with autoRoute: true');
                    // Navigate to EvacuationCenters and trigger nearest route
                    safeNavigate("EvacuationCenters", { autoRoute: true });
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="navigate" size={12} color="#FFFFFF" />
                  <Text style={styles.evacuationButtonPrimaryText}>NEAREST</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Go-Bag Checklist - Bottom left */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: '#FFF3E0' }]}
            onPress={() => safeNavigate("Go_Bag")}
          >
            <View style={styles.itemRow}>
              <Ionicons name="checkbox" size={30} color="#FF9800" />
              <Text style={[styles.itemText, { fontWeight: '600' }]}>Go-Bag Checklist</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {/* Emergency Broadcast - Top right */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Emergency Broadcast</Text>
            </View>
            
            <View style={styles.sectionContent}>
              <Ionicons name="megaphone" size={38} color="#FF5722" />
              
              <View style={styles.evacuationInfoRow}>
                <Ionicons name="radio" size={14} color="#FF5722" />
                <Text style={styles.evacuationInfoText}>
                  Stay updated with alerts
                </Text>
              </View>
              
              <TouchableOpacity
                style={[styles.evacuationButtonPrimary, { backgroundColor: '#FF5722' }]}
                onPress={() => safeNavigate("BroadcastFeed")}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-forward" size={12} color="#FFFFFF" />
                <Text style={styles.evacuationButtonPrimaryText}>VIEW UPDATES</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Family Check-In - Bottom right */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: '#E8F5E8' }]}
            onPress={() => safeNavigate("FamilyCheckIn", { displayName })}
          >
            <View style={styles.itemRow}>
              <Ionicons name="people" size={30} color={getStatusColor()} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemText, { fontWeight: 'bold' }]}>Family Check-In</Text>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  Status: {userStatus}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Family Status */}
      <View style={styles.familyCard}>
        <View style={styles.familyHeader}>
          <Text style={styles.familyStatusTitle}>Family Status</Text>
          <View style={styles.familyHeaderButtons}>
            <TouchableOpacity 
              style={styles.addFamilyButton}
              onPress={() => safeNavigate("AddFamily")}
            >
              <Ionicons name="person-add" size={16} color="#2196F3" />
              <Text style={styles.addFamilyButtonText}>Add Family</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.seeAllButton}
              onPress={() => safeNavigate('FamilyDetails')}
            >
              <Text style={styles.seeAllGreen}>See All</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.familyListContainer}>
          {!family || family.length === 0 ? (
            <View style={styles.emptyFamilyContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyFamilyText}>No family members added yet.</Text>
              <Text style={styles.emptyFamilySubtext}>Create or join a family to see member status here.</Text>
            </View>
          ) : (
            family.map((member) => (
              <View key={member.userId || member.email} style={[styles.familyMemberCard, { borderLeftColor: getMemberStatusColor(member.status) }]}>
                <View style={styles.familyMemberInfo}>
                  <Ionicons name="person-circle" size={40} color="#2196F3" />
                  <View style={styles.familyMemberDetails}>
                    <Text style={styles.familyMemberName}>{member.name || 'Unknown Member'}</Text>
                    <Text style={styles.familyMemberEmail}>{member.email || 'No email'}</Text>
                    {member.isAdmin && (
                      <View style={styles.familyAdminBadge}>
                        <Ionicons name="star" size={10} color="#FF9800" />
                        <Text style={styles.familyAdminText}>Family Creator</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.familyMemberStatus}>
                  <View style={[styles.familyStatusIndicator, { backgroundColor: getMemberStatusColor(member.status) }]} />
                  <Text style={[styles.familyStatusText, { color: getMemberStatusColor(member.status) }]}>
                    {member.status || "Unknown"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </>
  );
};

export default HomeContent;
