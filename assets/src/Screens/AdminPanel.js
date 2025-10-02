import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Modal,
  TextInput,
  Image,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useUser } from '../Components/UserContext';
import HamburgerMenu from '../Components/HamburgerMenu';
import Logo from '../Images/SafeLink_LOGO.png';
import styles from '../Styles/AdminPanel.styles';

export default function AdminPanel({ navigation }) {
  const { userId, isVerifiedOfficial, officialRole } = useUser();
  
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'reject'
  
  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const showMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Check if user is super admin (barangay captain or higher)
  const isSuperAdmin = isVerifiedOfficial && ['barangay_captain', 'emergency_coordinator'].includes(officialRole);
  
  // Temporary bypass for testing - remove in production
  const isTestingMode = true; // Set to false in production
  const hasAdminAccess = isSuperAdmin || isTestingMode;

  useEffect(() => {
    if (!hasAdminAccess) {
      Alert.alert(
        'Access Denied',
        'You need admin privileges to access this panel. Use the "Activate Admin Access" button in Official Verification screen, or manually set your user as admin in Firebase Console.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    // Listen for pending verification requests
    const q = query(
      collection(db, 'officialVerificationRequests'),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVerificationRequests(requests);
      setLoading(false);
    });

    return unsubscribe;
  }, [hasAdminAccess]);

  const openReviewModal = (request, action) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setReviewModalVisible(true);
  };

  const processVerificationRequest = async () => {
    if (!selectedRequest || !reviewAction) return;

    setProcessing(true);

    try {
      const isApproved = reviewAction === 'approve';
      
      // Update verification request
      const requestRef = doc(db, 'officialVerificationRequests', selectedRequest.id);
      await updateDoc(requestRef, {
        status: isApproved ? 'approved' : 'rejected',
        reviewedBy: userId,
        reviewedAt: serverTimestamp(),
        reviewNotes
      });

      // Update user profile if approved
      if (isApproved) {
        const userRef = doc(db, 'users', selectedRequest.userId);
        await updateDoc(userRef, {
          'profile.isVerifiedOfficial': true,
          'profile.canBroadcast': true,
          'profile.verificationStatus': 'approved',
          'profile.verifiedAt': serverTimestamp(),
          'profile.verifiedBy': userId
        });
      } else {
        // If rejected, update status
        const userRef = doc(db, 'users', selectedRequest.userId);
        await updateDoc(userRef, {
          'profile.verificationStatus': 'rejected',
          'profile.rejectedAt': serverTimestamp(),
          'profile.rejectedBy': userId
        });
      }

      Alert.alert(
        'Request Processed',
        `Verification request has been ${isApproved ? 'approved' : 'rejected'}.`,
        [{ text: 'OK' }]
      );

      setReviewModalVisible(false);
      setSelectedRequest(null);
      setReviewNotes('');
      setReviewAction('');

    } catch (error) {
      console.error('Error processing verification request:', error);
      Alert.alert('Error', 'Failed to process request. Please try again.');
    }

    setProcessing(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isSuperAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="shield-outline" size={64} color="#666" />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            Only verified barangay captains can access the admin panel.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
          <TouchableOpacity onPress={showMenu} style={styles.hamburgerButton}>
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="people-outline" size={24} color="#0891b2" />
        <Text style={styles.title}>Verification Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Verification Requests</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{verificationRequests.length}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Pending Requests */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        ) : verificationRequests.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyTitle}>All Caught Up!</Text>
            <Text style={styles.emptyText}>No pending verification requests.</Text>
          </View>
        ) : (
          <View style={styles.requestsSection}>
            <Text style={styles.sectionTitle}>⏳ Pending Requests ({verificationRequests.length})</Text>
            {verificationRequests.map((request, index) => (
              <View key={index} style={styles.requestCard}>
                <View style={styles.requestHeader}>
                  <View style={styles.requestInfo}>
                    <Text style={styles.requestName}>{request.displayName}</Text>
                    <Text style={styles.requestEmail}>{request.email}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity 
                      style={styles.approveButton}
                      onPress={() => openReviewModal(request, 'approve')}
                      disabled={processing}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.rejectButton}
                      onPress={() => openReviewModal(request, 'reject')}
                      disabled={processing}
                    >
                      <Ionicons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.requestDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="briefcase" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.officialRoleLabel}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.barangayAssignment}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="call" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.contactNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="business" size={16} color="#666" />
                    <Text style={styles.detailText}>{request.officeName}</Text>
                  </View>
                  {request.additionalInfo && (
                    <View style={styles.detailRow}>
                      <Ionicons name="information-circle" size={16} color="#666" />
                      <Text style={styles.detailText}>{request.additionalInfo}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color="#666" />
                    <Text style={styles.detailText}>Requested: {formatDate(request.requestedAt)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal
        visible={reviewModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {reviewAction === 'approve' ? '✅ Approve Request' : '❌ Reject Request'}
              </Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setReviewModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedRequest && (
                <>
                  <Text style={styles.reviewRequestTitle}>
                    {selectedRequest.displayName} - {selectedRequest.officialRoleLabel}
                  </Text>
                  <Text style={styles.reviewRequestDetails}>
                    {selectedRequest.barangayAssignment}
                  </Text>
                  
                  <View style={styles.reviewNotesSection}>
                    <Text style={styles.reviewNotesLabel}>Review Notes:</Text>
                    <TextInput
                      style={styles.reviewNotesInput}
                      placeholder={`Enter notes for ${reviewAction === 'approve' ? 'approval' : 'rejection'}...`}
                      value={reviewNotes}
                      onChangeText={setReviewNotes}
                      multiline={true}
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholderTextColor="#999"
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={[
                      styles.processButton,
                      reviewAction === 'approve' ? styles.approveProcessButton : styles.rejectProcessButton,
                      processing && styles.disabledButton
                    ]}
                    onPress={processVerificationRequest}
                    disabled={processing}
                  >
                    {processing ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Ionicons 
                          name={reviewAction === 'approve' ? 'checkmark' : 'close'} 
                          size={20} 
                          color="white" 
                        />
                        <Text style={styles.processButtonText}>
                          {reviewAction === 'approve' ? 'Approve Request' : 'Reject Request'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Hamburger Menu */}
      <HamburgerMenu
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}