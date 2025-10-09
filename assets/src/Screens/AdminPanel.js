import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useUser } from '../Components/UserContext';
import AppHeader from '../Components/AppHeader';
import Logo from '../Images/SafeLink_LOGO.png';
import styles from '../Styles/AdminPanel.styles';

export default function AdminPanel({ navigation }) {
  const { userId, isVerifiedOfficial, officialRole, userData } = useUser();
  
  const [verificationRequests, setVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewAction, setReviewAction] = useState(''); // 'approve' or 'reject'
  
  // Separate permission states
  const [grantVerification, setGrantVerification] = useState(true); // Can be verified official
  const [grantBroadcast, setGrantBroadcast] = useState(true); // Can broadcast
  const [grantAdminAccess, setGrantAdminAccess] = useState(false); // Can access admin panel

  // Check if user has admin access permission
  const hasAdminPermission = userData?.profile?.canAccessAdmin || userData?.profile?.permissions?.admin || false;
  
  // Check if user is super admin (barangay captain or higher) - legacy fallback
  const isSuperAdmin = isVerifiedOfficial && ['barangay_captain', 'emergency_coordinator'].includes(officialRole);
  
  // Temporary bypass for testing - remove in production
  const isTestingMode = true; // Set to false in production
  const hasAdminAccess = hasAdminPermission || isSuperAdmin || isTestingMode;

  // Get current user's administrative location for filtering
  const currentUserLocation = userData?.profile?.administrativeLocation || null;

  // Function to check if request location matches current user's location
  const isLocationMatch = (requestLocation, currentLocation) => {
    if (!requestLocation || !currentLocation) {
      console.log('AdminPanel - Missing location data:', { requestLocation, currentLocation });
      return false; // If either location is missing, don't show the request
    }

    // Check if region, municipality (city), and barangay match
    const regionMatch = requestLocation.region === currentLocation.region;
    const municipalityMatch = requestLocation.municipality === currentLocation.municipality;
    const barangayMatch = requestLocation.barangay === currentLocation.barangay;

    const isMatch = regionMatch && municipalityMatch && barangayMatch;
    
    console.log('AdminPanel - Location comparison:', {
      requestLocation,
      currentLocation,
      regionMatch,
      municipalityMatch,
      barangayMatch,
      finalMatch: isMatch
    });

    return isMatch;
  };

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

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const allRequests = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // If current user has no location data, show all requests (fallback)
        if (!currentUserLocation) {
          console.log('AdminPanel - No current user location, showing all requests');
          setVerificationRequests(allRequests);
          setLoading(false);
          return;
        }

        // Filter requests based on location
        const filteredRequests = [];
        
        for (const request of allRequests) {
          try {
            // Get the user's profile data to check their location
            const userRef = doc(db, 'users', request.userId);
            const userDoc = await getDoc(userRef);
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const requestUserLocation = userData.profile?.administrativeLocation;
              
              // Check if locations match
              if (isLocationMatch(requestUserLocation, currentUserLocation)) {
                filteredRequests.push({
                  ...request,
                  userLocation: requestUserLocation // Store for display
                });
              } else {
                console.log('AdminPanel - Request filtered out due to location mismatch:', {
                  requestId: request.id,
                  requestUserLocation,
                  currentUserLocation
                });
              }
            }
          } catch (error) {
            console.error('AdminPanel - Error fetching user data for request:', request.id, error);
            // In case of error, include the request to be safe
            filteredRequests.push(request);
          }
        }

        console.log(`AdminPanel - Filtered ${allRequests.length} requests to ${filteredRequests.length} based on location`);
        setVerificationRequests(filteredRequests);
        setLoading(false);
        
      } catch (error) {
        console.error('AdminPanel - Error processing verification requests:', error);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [hasAdminAccess, currentUserLocation]);

  const openReviewModal = (request, action) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    
    // Reset permission states - default permissions based on action
    if (action === 'approve') {
      setGrantVerification(true); // By default, grant verification
      setGrantBroadcast(true); // By default, grant broadcast
      setGrantAdminAccess(false); // By default, don't grant admin access
    } else {
      setGrantVerification(false);
      setGrantBroadcast(false);
      setGrantAdminAccess(false);
    }
    
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
        
        // Build update object based on granted permissions
        const updateData = {
          'profile.verificationStatus': 'approved',
          'profile.verifiedAt': serverTimestamp(),
          'profile.verifiedBy': userId,
          'profile.isVerifiedOfficial': grantVerification,
          'profile.canBroadcast': grantBroadcast,
          'profile.canAccessAdmin': grantAdminAccess,
          'profile.permissions': {
            verified: grantVerification,
            broadcast: grantBroadcast,
            admin: grantAdminAccess,
            grantedBy: userId,
            grantedAt: serverTimestamp()
          }
        };

        await updateDoc(userRef, updateData);
        
        // Create a summary of granted permissions
        const permissions = [];
        if (grantVerification) permissions.push('Official Verification');
        if (grantBroadcast) permissions.push('Emergency Broadcast');
        if (grantAdminAccess) permissions.push('Admin Panel Access');
        
        const permissionSummary = permissions.length > 0 
          ? permissions.join(', ') 
          : 'Basic verification only';
          
        Alert.alert(
          'Request Approved',
          `Verification request approved with permissions: ${permissionSummary}`,
          [{ text: 'OK' }]
        );
      } else {
        // If rejected, update status
        const userRef = doc(db, 'users', selectedRequest.userId);
        await updateDoc(userRef, {
          'profile.verificationStatus': 'rejected',
          'profile.rejectedAt': serverTimestamp(),
          'profile.rejectedBy': userId
        });
        
        Alert.alert(
          'Request Rejected',
          'Verification request has been rejected.',
          [{ text: 'OK' }]
        );
      }

      setReviewModalVisible(false);
      setSelectedRequest(null);
      setReviewNotes('');
      setReviewAction('');
      
      // Reset permission states
      setGrantVerification(true);
      setGrantBroadcast(true);
      setGrantAdminAccess(false);

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

  if (!hasAdminAccess) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDenied}>
          <Ionicons name="shield-outline" size={64} color="#666" />
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedText}>
            You need admin panel access permission to use verification management. 
            Contact your barangay captain or emergency coordinator for access.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* App Header */}
      <AppHeader 
        title="Verification Management"
        icon="people-outline"
        navigation={navigation}
        backgroundColor="#0891b2"
      />

      <ScrollView style={styles.content}>
        {/* Location Filter Info */}
        <View style={styles.locationFilterCard}>
          <Text style={styles.locationFilterTitle}>📍 Location-Based Filtering</Text>
          {currentUserLocation ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationText}>
                Showing requests from: {currentUserLocation.barangay}, {currentUserLocation.municipality}, {currentUserLocation.region}
              </Text>
              <Text style={styles.locationSubtext}>
                Only verification requests from your area are displayed for security and jurisdictional purposes.
              </Text>
            </View>
          ) : (
            <View style={styles.locationInfo}>
              <Text style={styles.locationWarning}>
                ⚠️ No location set - showing all requests
              </Text>
              <Text style={styles.locationSubtext}>
                Complete your profile with your administrative location to enable location-based filtering.
              </Text>
            </View>
          )}
        </View>

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
                    <Text style={styles.detailText}>
                      {typeof request.barangayAssignment === 'object' 
                        ? `${request.barangayAssignment.barangay}, ${request.barangayAssignment.municipality}, ${request.barangayAssignment.province}` 
                        : request.barangayAssignment}
                    </Text>
                  </View>
                  {request.userLocation && (
                    <View style={styles.detailRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={[styles.detailText, { color: '#4CAF50' }]}>
                        ✓ Same location as you: {request.userLocation.barangay}, {request.userLocation.municipality}
                      </Text>
                    </View>
                  )}
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
                    {typeof selectedRequest.barangayAssignment === 'object' 
                      ? `${selectedRequest.barangayAssignment.barangay}, ${selectedRequest.barangayAssignment.municipality}, ${selectedRequest.barangayAssignment.province}` 
                      : selectedRequest.barangayAssignment}
                  </Text>
                  
                  {/* Permission Controls - Only show for approval */}
                  {reviewAction === 'approve' && (
                    <View style={styles.permissionsSection}>
                      <Text style={styles.permissionsTitle}>🔐 Grant Permissions</Text>
                      <Text style={styles.permissionsSubtitle}>
                        Select which permissions to grant to this official:
                      </Text>
                      
                      <View style={styles.permissionItem}>
                        <View style={styles.permissionInfo}>
                          <Text style={styles.permissionLabel}>Official Verification</Text>
                          <Text style={styles.permissionDescription}>
                            Marks user as verified official, enables official features
                          </Text>
                        </View>
                        <Switch
                          value={grantVerification}
                          onValueChange={setGrantVerification}
                          trackColor={{ false: '#767577', true: '#4CAF50' }}
                          thumbColor={grantVerification ? '#ffffff' : '#f4f3f4'}
                        />
                      </View>
                      
                      <View style={styles.permissionItem}>
                        <View style={styles.permissionInfo}>
                          <Text style={styles.permissionLabel}>Emergency Broadcast</Text>
                          <Text style={styles.permissionDescription}>
                            Can send emergency broadcasts to the community
                          </Text>
                        </View>
                        <Switch
                          value={grantBroadcast}
                          onValueChange={setGrantBroadcast}
                          trackColor={{ false: '#767577', true: '#FF9800' }}
                          thumbColor={grantBroadcast ? '#ffffff' : '#f4f3f4'}
                        />
                      </View>
                      
                      <View style={styles.permissionItem}>
                        <View style={styles.permissionInfo}>
                          <Text style={styles.permissionLabel}>Admin Panel Access</Text>
                          <Text style={styles.permissionDescription}>
                            Can access verification management and approve others
                          </Text>
                        </View>
                        <Switch
                          value={grantAdminAccess}
                          onValueChange={setGrantAdminAccess}
                          trackColor={{ false: '#767577', true: '#2196F3' }}
                          thumbColor={grantAdminAccess ? '#ffffff' : '#f4f3f4'}
                        />
                      </View>
                    </View>
                  )}
                  
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

    </View>
  );
}