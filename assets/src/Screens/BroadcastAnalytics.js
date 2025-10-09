import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useUser } from '../Components/UserContext';
import Logo from '../Images/SafeLink_LOGO.png';
import styles from '../Styles/BroadcastAnalytics.styles';

export default function BroadcastAnalytics({ navigation, route }) {
  const { userId, isVerifiedOfficial } = useUser();
  const { broadcastId } = route.params || {};
  
  const [broadcast, setBroadcast] = useState(null);
  const [seenUsers, setSeenUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!broadcastId || !isVerifiedOfficial) {
      Alert.alert('Error', 'Invalid access to broadcast analytics.');
      navigation.goBack();
      return;
    }

    // Load broadcast details
    const loadBroadcastData = async () => {
      try {
        const broadcastDoc = await getDoc(doc(db, 'broadcasts', broadcastId));
        if (broadcastDoc.exists()) {
          const data = { id: broadcastDoc.id, ...broadcastDoc.data() };
          setBroadcast(data);

          // Load seen users details
          if (data.seenBy && data.seenBy.length > 0) {
            const userPromises = data.seenBy.map(async (userId) => {
              try {
                const userDoc = await getDoc(doc(db, 'users', userId));
                if (userDoc.exists()) {
                  const userData = userDoc.data();
                  return {
                    userId,
                    name: userData.displayName || `${userData.profile?.firstName || ''} ${userData.profile?.lastName || ''}`.trim() || 'Unknown User',
                    email: userData.email,
                    seenAt: data.seenDetails?.[userId] || null
                  };
                }
              } catch (error) {
                console.error('Error loading user:', error);
              }
              return {
                userId,
                name: 'Unknown User',
                email: '',
                seenAt: data.seenDetails?.[userId] || null
              };
            });

            const users = await Promise.all(userPromises);
            setSeenUsers(users.filter(user => user !== null));
          }
        } else {
          Alert.alert('Error', 'Broadcast not found.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Error loading broadcast data:', error);
        Alert.alert('Error', 'Failed to load broadcast data.');
      }
      setLoading(false);
    };

    loadBroadcastData();
  }, [broadcastId, isVerifiedOfficial]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  if (!broadcast) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#F44336" />
          <Text style={styles.errorTitle}>Broadcast Not Found</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={32} color="white" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Safe</Text>
              <Text style={{ color: "#E82222", fontWeight: "bold", fontSize: 18 }}>Link</Text>
            </Text>
          </View>
          <View style={styles.backBtn} />
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="analytics" size={24} color="#0891b2" />
        <Text style={styles.title}>Broadcast Analytics</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Broadcast Details */}
        <View style={styles.broadcastCard}>
          <View style={styles.broadcastHeader}>
            <Text style={styles.broadcastType}>{broadcast.alertType}</Text>
            <Text style={styles.broadcastDate}>{formatTimestamp(broadcast.createdAt)}</Text>
          </View>
          <Text style={styles.broadcastMessage}>{broadcast.message}</Text>
          <Text style={styles.broadcastLocation}>📍 {broadcast.location}, {broadcast.barangay}</Text>
        </View>

        {/* Analytics Summary */}
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsTitle}>📊 Engagement Analytics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{broadcast.seenCount || 0}</Text>
              <Text style={styles.statLabel}>Total Views</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{seenUsers.length}</Text>
              <Text style={styles.statLabel}>Unique Viewers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{broadcast.deliveredCount || 0}</Text>
              <Text style={styles.statLabel}>Delivered</Text>
            </View>
          </View>
        </View>

        {/* Seen By Users */}
        {seenUsers.length > 0 && (
          <View style={styles.seenUsersCard}>
            <Text style={styles.seenUsersTitle}>👥 Viewed By ({seenUsers.length} users)</Text>
            {seenUsers.map((user, index) => (
              <View key={index} style={styles.seenUserItem}>
                <View style={styles.userInfo}>
                  <Ionicons name="person-circle" size={32} color="#4CAF50" />
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
                <View style={styles.seenTime}>
                  <Ionicons name="time" size={16} color="#666" />
                  <Text style={styles.seenTimeText}>{formatDate(user.seenAt)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {seenUsers.length === 0 && (
          <View style={styles.noViewsCard}>
            <Ionicons name="eye-off" size={48} color="#999" />
            <Text style={styles.noViewsTitle}>No Views Yet</Text>
            <Text style={styles.noViewsText}>This broadcast hasn't been viewed by any users yet.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}