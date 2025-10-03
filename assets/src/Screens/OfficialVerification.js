import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebaseConfig';
import { doc, updateDoc, addDoc, collection, serverTimestamp, getDocs, getDoc } from 'firebase/firestore';
import { useUser } from '../Components/UserContext';
import HamburgerMenu from '../Components/HamburgerMenu';
import Logo from '../Images/SafeLink_LOGO.png';
import styles from '../Styles/OfficialVerification.styles';

const OFFICIAL_ROLES = [
  { value: 'barangay_captain', label: 'Barangay Captain', icon: 'shield' },
  { value: 'barangay_councilor', label: 'Barangay Councilor', icon: 'people' },
  { value: 'sk_chairman', label: 'SK Chairman', icon: 'star' },
  { value: 'barangay_secretary', label: 'Barangay Secretary', icon: 'document-text' },
  { value: 'barangay_treasurer', label: 'Barangay Treasurer', icon: 'wallet' },
  { value: 'emergency_coordinator', label: 'Emergency Coordinator', icon: 'warning' }
];

export default function OfficialVerification({ navigation }) {
  const { userId, displayName, email, isVerifiedOfficial, verificationStatus } = useUser();
  
  const [selectedRole, setSelectedRole] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [officeName, setOfficeName] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [verificationCodes, setVerificationCodes] = useState({});
  const [fetchingCodes, setFetchingCodes] = useState(true);
  
  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Fetch verification codes from Firebase
  useEffect(() => {
    const fetchVerificationCodes = async () => {
      try {
        setFetchingCodes(true);
        const barangayCollection = collection(db, 'barangay');
        const snapshot = await getDocs(barangayCollection);
        
        const codes = {};
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.verificationCode && data.isActive !== false) {
            codes[data.verificationCode] = {
              barangay: data.barangay,
              municipality: data.municipality,
              province: data.province,
              isActive: data.isActive !== false
            };
          }
        });
        
        // Add fallback test codes if no codes found in Firebase
        if (Object.keys(codes).length === 0) {
          codes['TEST_ADMIN_001'] = {
            barangay: 'Test Barangay',
            municipality: 'Test Municipality',
            province: 'Test Province',
            isActive: true
          };
          codes['DEMO_CODE_123'] = {
            barangay: 'Demo Barangay',
            municipality: 'Demo City',
            province: 'Demo Province',
            isActive: true
          };
        }
        
        setVerificationCodes(codes);
      } catch (error) {
        console.error('Error fetching verification codes:', error);
        
        // Use fallback codes on error
        const fallbackCodes = {
          'TEST_ADMIN_001': {
            barangay: 'Test Barangay',
            municipality: 'Test Municipality',
            province: 'Test Province',
            isActive: true
          },
          'DEMO_CODE_123': {
            barangay: 'Demo Barangay',
            municipality: 'Demo City',
            province: 'Demo Province',
            isActive: true
          }
        };
        setVerificationCodes(fallbackCodes);
        
        Alert.alert(
          'Notice', 
          'Using test verification codes. Please ensure Firebase barangay collection is properly set up.',
          [{ text: 'OK' }]
        );
      } finally {
        setFetchingCodes(false);
      }
    };

    fetchVerificationCodes();
  }, []);

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

  const validateVerificationCode = (code) => {
    const upperCode = code.toUpperCase();
    return verificationCodes[upperCode] || null;
  };

  // Developer function to grant admin access for testing
  const activateDevAdminAccess = async () => {
    Alert.alert(
      'Developer Mode',
      'Grant admin access using TEST_ADMIN_001 verification code?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Grant Access',
          onPress: async () => {
            try {
              setLoading(true);
              
              if (!userId) {
                Alert.alert('Error', 'No user ID found. Please make sure you are logged in.');
                setLoading(false);
                return;
              }

              console.log('Granting admin access for user:', userId);
              
              // Use the actual TEST_ADMIN_001 verification code data
              const testBarangayData = {
                verificationCode: "TEST_ADMIN_001",
                barangay: "Test Barangay",
                municipality: "Test Municipality",
                province: "Test Province",
                isActive: true
              };
              
              // Update user document with admin verification using real verification code
              const userDocRef = doc(db, 'users', userId);
              const updateData = {
                isVerifiedOfficial: true,
                officialRole: 'barangay_captain',
                verificationStatus: 'approved',
                canBroadcast: true,
                // Store barangayAssignment as string for compatibility
                barangayAssignment: `${testBarangayData.barangay}, ${testBarangayData.municipality}, ${testBarangayData.province}`,
                // Also store as object in verificationData for detailed info
                verificationData: {
                  verificationCode: testBarangayData.verificationCode,
                  barangay: testBarangayData.barangay,
                  municipality: testBarangayData.municipality,
                  province: testBarangayData.province,
                  barangayAssignment: {
                    region: 'Region X (Northern Mindanao)',
                    province: testBarangayData.province,
                    municipality: testBarangayData.municipality,
                    barangay: testBarangayData.barangay
                  },
                  submittedRole: 'barangay_captain',
                  submittedAt: new Date().toISOString(),
                  verifiedAt: serverTimestamp(),
                  verifiedBy: 'developer_mode_auto_approval',
                  status: 'approved',
                  adminNotes: 'Automatically approved via developer mode using TEST_ADMIN_001 verification code'
                }
              };

              console.log('Updating user document with:', updateData);
              await updateDoc(userDocRef, updateData);
              console.log('Admin access granted successfully using TEST_ADMIN_001!');

              // Force a small delay to ensure Firestore has time to propagate
              await new Promise(resolve => setTimeout(resolve, 1000));

              Alert.alert(
                'Admin Access Granted! ✅',
                `You are now verified as Barangay Captain of ${testBarangayData.barangay}!\n\n• Access Admin Panel\n• Send Emergency Broadcasts\n• Manage Family Settings\n• Review Verification Requests\n\nNote: UI may take a moment to update.`,
                [
                  { 
                    text: 'Go to Admin Panel', 
                    onPress: () => {
                      setLoading(false);
                      navigation.navigate('AdminPanel');
                    }
                  },
                  { 
                    text: 'Refresh Page', 
                    onPress: () => {
                      setLoading(false);
                      // Force re-render by navigating away and back
                      navigation.navigate('Home');
                      setTimeout(() => navigation.navigate('OfficialVerification'), 100);
                    }
                  },
                  { 
                    text: 'OK', 
                    onPress: () => setLoading(false)
                  }
                ]
              );
            } catch (error) {
              console.error('Error granting admin access:', error);
              Alert.alert(
                'Error', 
                `Failed to grant admin access: ${error.message}\n\nPlease check your internet connection and try again.`
              );
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Function to show available verification codes for debugging
  const showAvailableCodes = () => {
    const codeList = Object.keys(verificationCodes).map(code => {
      const data = verificationCodes[code];
      return `• ${code} - ${data.barangay}, ${data.municipality}, ${data.province}`;
    }).join('\n');

    Alert.alert(
      'Available Verification Codes',
      codeList || 'No verification codes loaded',
      [{ text: 'OK' }]
    );
  };

  // Function to check current user data in Firestore
  const checkUserData = async () => {
    try {
      if (!userId) {
        Alert.alert('Error', 'No user ID found');
        return;
      }

      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const debugInfo = `
User Document Data:
• isVerifiedOfficial: ${userData.isVerifiedOfficial}
• officialRole: ${userData.officialRole}
• verificationStatus: ${userData.verificationStatus}
• canBroadcast: ${userData.canBroadcast}
• barangayAssignment: ${userData.barangayAssignment ? JSON.stringify(userData.barangayAssignment) : 'None'}

Profile Data:
• profile.isVerifiedOfficial: ${userData.profile?.isVerifiedOfficial}
• profile.officialRole: ${userData.profile?.officialRole}
• profile.verificationStatus: ${userData.profile?.verificationStatus}
        `.trim();

        Alert.alert('Current User Data', debugInfo, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', 'User document does not exist');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to fetch user data: ${error.message}`);
    }
  };

  const submitVerificationRequest = async () => {
    if (fetchingCodes) {
      Alert.alert('Please Wait', 'Loading verification codes. Please try again in a moment.');
      return;
    }

    if (!selectedRole) {
      Alert.alert('Error', 'Please select your official role.');
      return;
    }

    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter your barangay verification code.');
      return;
    }

    if (!contactNumber.trim()) {
      Alert.alert('Error', 'Please enter your contact number.');
      return;
    }

    if (!officeName.trim()) {
      Alert.alert('Error', 'Please enter your office name/title.');
      return;
    }

    const codeValidation = validateVerificationCode(verificationCode.trim());
    if (!codeValidation) {
      const availableCodes = Object.keys(verificationCodes);
      const debugMessage = availableCodes.length > 0 
        ? `Available codes: ${availableCodes.join(', ')}`
        : 'No verification codes loaded. Please check Firebase barangay collection.';
      
      Alert.alert(
        'Invalid Verification Code', 
        `Code "${verificationCode.trim()}" not found.\n\n${debugMessage}`,
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      // Update user profile with verification request
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        'profile.officialRole': selectedRole.value,
        'profile.barangayAssignment': `${codeValidation.barangay}, ${codeValidation.municipality}, ${codeValidation.province}`,
        'profile.verificationStatus': 'pending',
        'profile.verificationRequestedAt': serverTimestamp(),
        'profile.contactNumber': contactNumber,
        'profile.officeName': officeName,
        'profile.additionalInfo': additionalInfo,
        'profile.verificationCode': verificationCode.toUpperCase()
      });

      // Create verification request document for admin review
      const verificationRequest = {
        userId,
        email,
        displayName,
        officialRole: selectedRole.value,
        officialRoleLabel: selectedRole.label,
        barangayAssignment: `${codeValidation.barangay}, ${codeValidation.municipality}, ${codeValidation.province}`,
        contactNumber,
        officeName,
        additionalInfo,
        verificationCode: verificationCode.toUpperCase(),
        requestedAt: serverTimestamp(),
        status: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        reviewNotes: null
      };

      await addDoc(collection(db, 'officialVerificationRequests'), verificationRequest);

      Alert.alert(
        'Request Submitted',
        'Your official verification request has been submitted. You will be notified once it has been reviewed by the administrator.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('Error submitting verification request:', error);
      Alert.alert('Error', 'Failed to submit verification request. Please try again.');
    }

    setLoading(false);
  };

  const getStatusDisplay = () => {
    if (isVerifiedOfficial) {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            <Text style={styles.statusTitle}>Verified Official</Text>
          </View>
          <Text style={styles.statusDescription}>
            You are verified as a barangay official and can send emergency broadcasts.
          </Text>
          <TouchableOpacity 
            style={styles.broadcastButton}
            onPress={() => navigation.navigate('EmergencyBroadcast')}
          >
            <Ionicons name="megaphone" size={20} color="white" />
            <Text style={styles.broadcastButtonText}>Send Emergency Broadcast</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (verificationStatus === 'pending') {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="time" size={24} color="#FF9800" />
            <Text style={styles.statusTitle}>Verification Pending</Text>
          </View>
          <Text style={styles.statusDescription}>
            Your official verification request is being reviewed. You will be notified once approved.
          </Text>
        </View>
      );
    }

    if (verificationStatus === 'rejected') {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="close-circle" size={24} color="#F44336" />
            <Text style={styles.statusTitle}>Verification Rejected</Text>
          </View>
          <Text style={styles.statusDescription}>
            Your verification request was rejected. Please contact support or resubmit with correct information.
          </Text>
        </View>
      );
    }

    return null;
  };

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
        <Ionicons name="shield-checkmark" size={24} color="#0891b2" />
        <Text style={styles.title}>Official Verification</Text>
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {/* Current Status */}
        {getStatusDisplay()}

        {/* Developer Admin Access Button - Only show if not already verified */}
        {!isVerifiedOfficial && (
          <View style={styles.developerSection}>
            <Text style={styles.developerSectionTitle}>🔧 Developer Tools</Text>
            
            {/* Debug Info */}
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>Current Status:</Text>
              <Text style={styles.debugText}>• User ID: {userId || 'Not found'}</Text>
              <Text style={styles.debugText}>• Verified: {isVerifiedOfficial ? 'Yes' : 'No'}</Text>
              <Text style={styles.debugText}>• Status: {verificationStatus || 'none'}</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.devAdminButton}
              onPress={activateDevAdminAccess}
              disabled={loading}
            >
              <Ionicons name="build" size={20} color="white" />
              <Text style={styles.devAdminButtonText}>
                {loading ? 'Granting Access...' : 'Grant Admin Access (TEST_ADMIN_001)'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.devAdminButton, { backgroundColor: '#0891b2', marginTop: 8 }]}
              onPress={showAvailableCodes}
              disabled={loading}
            >
              <Ionicons name="list" size={20} color="white" />
              <Text style={styles.devAdminButtonText}>
                Show Available Verification Codes
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.devAdminButton, { backgroundColor: '#9C27B0', marginTop: 8 }]}
              onPress={checkUserData}
              disabled={loading}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.devAdminButtonText}>
                Check Current User Data
              </Text>
            </TouchableOpacity>
            
            <Text style={styles.developerNote}>
              Using official TEST_ADMIN_001 verification code from system
            </Text>
          </View>
        )}

        {/* Loading State for Verification Codes */}
        {fetchingCodes && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E65100" />
            <Text style={styles.loadingText}>Loading verification codes...</Text>
          </View>
        )}

        {/* Verification Form - Only show if not verified and not pending and codes are loaded */}
        {!fetchingCodes && !isVerifiedOfficial && verificationStatus !== 'pending' && (
          <View style={styles.verificationForm}>
            <Text style={styles.formTitle}>🏛️ Apply for Official Verification</Text>
            <Text style={styles.formDescription}>
              Verified barangay officials can send emergency broadcasts to residents in their area.
            </Text>

            {/* Official Role Selection */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Official Role *</Text>
              <TouchableOpacity 
                style={styles.roleSelector}
                onPress={() => setShowRoleModal(true)}
              >
                <View style={styles.roleSelectorContent}>
                  {selectedRole ? (
                    <>
                      <Ionicons name={selectedRole.icon} size={20} color="#4CAF50" />
                      <Text style={styles.selectedRoleText}>{selectedRole.label}</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="chevron-down" size={20} color="#999" />
                      <Text style={styles.placeholderText}>Select your official role</Text>
                    </>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
            </View>

            {/* Verification Code */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Barangay Verification Code *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter your barangay verification code"
                value={verificationCode}
                onChangeText={setVerificationCode}
                autoCapitalize="characters"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputHelper}>
                Contact your barangay administrator for this code
              </Text>
            </View>

            {/* Contact Number */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Official Contact Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="09XXXXXXXXX"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
                maxLength={11}
                placeholderTextColor="#999"
              />
            </View>

            {/* Office Name */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Office/Position Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Office of the Barangay Captain"
                value={officeName}
                onChangeText={setOfficeName}
                placeholderTextColor="#999"
              />
            </View>

            {/* Additional Information */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Additional Information</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Any additional information to support your verification"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
                placeholderTextColor="#999"
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={submitVerificationRequest}
              disabled={loading || !selectedRole || !verificationCode.trim() || !contactNumber.trim() || !officeName.trim()}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text style={styles.submitButtonText}>Submit Verification Request</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>📋 Verification Requirements</Text>
          <View style={styles.requirementsList}>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Valid barangay verification code</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Official contact number</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Valid government position</Text>
            </View>
            <View style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.requirementText}>Administrator approval</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowRoleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Official Role</Text>
              <TouchableOpacity 
                style={styles.modalCloseButton}
                onPress={() => setShowRoleModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.rolesList}>
              {OFFICIAL_ROLES.map((role, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.roleOption,
                    selectedRole?.value === role.value && styles.selectedRoleOption
                  ]}
                  onPress={() => {
                    setSelectedRole(role);
                    setShowRoleModal(false);
                  }}
                >
                  <Ionicons 
                    name={role.icon} 
                    size={24} 
                    color={selectedRole?.value === role.value ? "#4CAF50" : "#666"} 
                  />
                  <Text style={[
                    styles.roleOptionText,
                    selectedRole?.value === role.value && styles.selectedRoleOptionText
                  ]}>
                    {role.label}
                  </Text>
                  {selectedRole?.value === role.value && (
                    <Ionicons name="checkmark" size={20} color="#4CAF50" />
                  )}
                </TouchableOpacity>
              ))}
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