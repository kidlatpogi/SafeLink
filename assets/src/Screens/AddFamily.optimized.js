import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Animated,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { db } from "../firebaseConfig";
import { 
  collection, 
  setDoc,
  getDocs, 
  doc, 
  getDoc, 
  updateDoc
} from "firebase/firestore";
import { useUser } from '../Components/UserContext';
import { useFamily } from '../Components/FamilyContext';
import styles from "../Styles/AddFamily.styles";
import Logo from "../Images/SafeLink_LOGO.png";
import HamburgerMenu from "../Components/HamburgerMenu";

// Helper Functions
const generateFamilyCode = () => Math.floor(100000 + Math.random() * 900000).toString();

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "i'm safe":
    case "safe":
      return "#4CAF50";
    case "not yet responded":
      return "#FF9800";
    case "unknown":
      return "#9E9E9E";
    case "evacuated":
    case "emergency":
      return "#F44336";
    default:
      return "#FF9800";
  }
};

const copyToClipboard = async (code) => {
  try {
    await Clipboard.setStringAsync(code);
    Alert.alert("Copied!", "Family code copied to clipboard.");
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    Alert.alert("Error", "Failed to copy code to clipboard.");
  }
};

export default function AddFamily({ navigation }) {
  const { userId, displayName: userDisplayName, email: userEmail } = useUser();
  const { 
    family: contextFamily, 
    familyCode: contextFamilyCode, 
    getMembersWithRemovalRequests
  } = useFamily();
  
  // State Management
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [localFamily, setLocalFamily] = useState([]);
  const [localFamilyCode, setLocalFamilyCode] = useState("");
  
  // Modal States
  const [managementModalVisible, setManagementModalVisible] = useState(false);
  const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [actionType, setActionType] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);
  
  // Hamburger Menu
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Computed Values
  const myFamilyCode = localFamilyCode || contextFamilyCode;
  const displayFamily = localFamily.length > 0 ? localFamily : (contextFamily || []);
  const currentUserMember = displayFamily.find(member => member.userId === userId);
  const isLocalAdmin = currentUserMember?.isAdmin || false;

  // Menu Animation
  const showMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  // Family Data Management
  const refreshFamilyData = async () => {
    if (!userId) return;
    
    try {
      const familiesRef = collection(db, "families");
      const querySnapshot = await getDocs(familiesRef);
      let userFamily = null;
      
      querySnapshot.forEach((doc) => {
        const familyData = doc.data();
        if (!familyData.isArchived && familyData.members?.some(member => member.userId === userId)) {
          userFamily = { id: doc.id, ...familyData };
        }
      });
      
      if (userFamily) {
        setLocalFamilyCode(userFamily.code);
        setLocalFamily(userFamily.members || []);
      } else {
        setLocalFamilyCode("");
        setLocalFamily([]);
      }
    } catch (err) {
      console.log("Failed to refresh family data:", err);
    }
  };

  // Family Operations
  const createFamily = async () => {
    if (!userId || !userEmail || !userDisplayName) {
      Alert.alert("Error", "User information not available.");
      return;
    }

    if (myFamilyCode) {
      Alert.alert("Info", "You're already part of a family. Share your existing code with others.");
      return;
    }

    setLoading(true);
    
    try {
      let isUnique = false;
      let newCode = "";
      
      // Generate unique code
      while (!isUnique) {
        newCode = generateFamilyCode();
        const familyDocRef = doc(db, "families", newCode);
        const familyDocSnap = await getDoc(familyDocRef);
        isUnique = !familyDocSnap.exists();
      }

      const familyData = {
        code: newCode,
        createdAt: new Date().toISOString(),
        createdBy: userId,
        isArchived: false,
        archivedAt: null,
        archivedBy: null,
        members: [{
          userId,
          email: userEmail,
          name: userDisplayName,
          isAdmin: true,
          joinedAt: new Date().toISOString(),
          status: "I'm Safe",
          lastUpdate: new Date().toISOString(),
          removalRequested: false,
          removalRequestedAt: null
        }]
      };

      await setDoc(doc(db, "families", newCode), familyData);
      
      setLocalFamilyCode(newCode);
      setLocalFamily(familyData.members);
      await refreshFamilyData();
      
      Alert.alert(
        "Family Created!", 
        `Your family code is: ${newCode}\n\nShare this code with your family members so they can join.`,
        [
          { text: "Copy Code", onPress: () => copyToClipboard(newCode) },
          { text: "OK" }
        ]
      );
    } catch (error) {
      console.error("Error creating family:", error);
      Alert.alert("Error", `Failed to create family: ${error.message || 'Unknown error'}. Please try again.`);
    }
    
    setLoading(false);
  };

  const joinFamily = async () => {
    if (!joinCode.trim()) {
      Alert.alert("Error", "Please enter a family code.");
      return;
    }

    if (joinCode.length !== 6) {
      Alert.alert("Error", "Family code must be 6 digits.");
      return;
    }

    if (!userId || !userEmail || !userDisplayName) {
      Alert.alert("Error", "User information not available.");
      return;
    }

    if (myFamilyCode) {
      Alert.alert("Error", "You're already part of a family. Leave your current family first.");
      return;
    }

    setLoading(true);

    try {
      const familyDocRef = doc(db, "families", joinCode.trim());
      const familyDocSnap = await getDoc(familyDocRef);

      if (!familyDocSnap.exists()) {
        Alert.alert("Error", "Invalid family code. Please check and try again.");
        setLoading(false);
        return;
      }

      const familyData = familyDocSnap.data();
      
      if (familyData.isArchived) {
        Alert.alert("Error", "This family is no longer active. Please contact the family admin for a new code.");
        setLoading(false);
        return;
      }
      
      if (!familyData.members || !Array.isArray(familyData.members)) {
        Alert.alert("Error", "Invalid family data structure. Please contact support.");
        setLoading(false);
        return;
      }
      
      if (familyData.members.some(member => member.userId === userId)) {
        Alert.alert("Info", "You're already a member of this family.");
        setLoading(false);
        return;
      }

      const newMember = {
        userId,
        email: userEmail,
        name: userDisplayName,
        isAdmin: false,
        joinedAt: new Date().toISOString(),
        status: "I'm Safe",
        lastUpdate: new Date().toISOString(),
        removalRequested: false,
        removalRequestedAt: null
      };

      const updatedMembers = [...familyData.members, newMember];
      
      await updateDoc(familyDocRef, { members: updatedMembers });

      setLocalFamilyCode(joinCode.trim());
      setLocalFamily(updatedMembers);
      setJoinCode("");
      await refreshFamilyData();

      Alert.alert("Joined Family!", "You've successfully joined the family.");
    } catch (error) {
      console.error("Error joining family:", error);
      Alert.alert("Error", `Failed to join family: ${error.message || 'Unknown error'}. Please try again.`);
    }

    setLoading(false);
  };

  // Modal Operations
  const resetModalState = () => {
    setManagementModalVisible(false);
    setConfirmationModalVisible(false);
    setConfirmationText("");
    setActionType("");
    setMemberToRemove(null);
  };

  const openRemovalConfirmation = (member) => {
    setMemberToRemove(member);
    setActionType("remove");
    setConfirmationText("");
    setConfirmationModalVisible(true);
  };

  const openArchiveConfirmation = () => {
    setActionType("archive");
    setConfirmationText("");
    setConfirmationModalVisible(true);
  };

  // Family Management Operations
  const archiveFamily = async () => {
    if (!myFamilyCode || !isLocalAdmin) {
      Alert.alert("Error", "Only the family creator can archive the family.");
      return;
    }

    if (confirmationText !== "CONFIRM DELETE") {
      Alert.alert("Error", "Please type 'CONFIRM DELETE' to proceed with archiving the family.");
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "families", myFamilyCode), {
        isArchived: true,
        archivedAt: new Date().toISOString(),
        archivedBy: userId
      });

      resetModalState();
      setLocalFamilyCode("");
      setLocalFamily([]);
      await refreshFamilyData();
      
      Alert.alert("Family Archived", "The family has been archived successfully. You can now create or join a new family.");
    } catch (error) {
      console.error("Error archiving family:", error);
      Alert.alert("Error", "Failed to archive family. Please try again.");
    }
    setLoading(false);
  };

  const kickMember = async (memberToKick) => {
    if (!isLocalAdmin) {
      Alert.alert("Error", "Only family admin can remove members.");
      return;
    }

    if (memberToKick.userId === userId) {
      Alert.alert("Error", "You cannot remove yourself. Use archive family instead.");
      return;
    }

    if (confirmationText !== "CONFIRM REMOVAL") {
      Alert.alert("Error", "Please type 'CONFIRM REMOVAL' to proceed with removing this member.");
      return;
    }

    setLoading(true);
    try {
      const updatedMembers = displayFamily.filter(member => member.userId !== memberToKick.userId);
      
      await updateDoc(doc(db, "families", myFamilyCode), { members: updatedMembers });

      resetModalState();
      setLocalFamily(updatedMembers);
      await refreshFamilyData();
      
      Alert.alert("Member Removed", `${memberToKick.name} has been removed from the family.`);
    } catch (error) {
      console.error("Error removing member:", error);
      Alert.alert("Error", "Failed to remove member. Please try again.");
    }
    setLoading(false);
  };

  const handleRemovalRequest = async (isCancel = false) => {
    if (isLocalAdmin) {
      Alert.alert("Info", "As the family admin, you can archive the entire family instead.");
      return;
    }

    const action = isCancel ? "cancel" : "request";
    const message = isCancel 
      ? "Are you sure you want to cancel your removal request?"
      : "Are you sure you want to request removal from this family? The family admin will be notified.";

    Alert.alert(
      isCancel ? "Cancel Request" : "Request Removal",
      message,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: isCancel ? "Cancel Request" : "Request",
          onPress: async () => {
            setLoading(true);
            try {
              const updatedMembers = displayFamily.map(member => {
                if (member.userId === userId) {
                  return {
                    ...member,
                    removalRequested: !isCancel,
                    removalRequestedAt: isCancel ? null : new Date().toISOString()
                  };
                }
                return member;
              });
              
              await updateDoc(doc(db, "families", myFamilyCode), { members: updatedMembers });
              setLocalFamily(updatedMembers);
              await refreshFamilyData();
              
              Alert.alert(
                isCancel ? "Request Cancelled" : "Request Sent", 
                isCancel 
                  ? "Your removal request has been cancelled."
                  : "Your removal request has been sent to the family admin."
              );
            } catch (error) {
              console.error(`Error ${action}ing removal:`, error);
              Alert.alert("Error", `Failed to ${action} removal request. Please try again.`);
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Effects
  useEffect(() => {
    if (contextFamilyCode && !localFamilyCode) setLocalFamilyCode(contextFamilyCode);
    if (contextFamily && Array.isArray(contextFamily) && contextFamily.length > 0 && localFamily.length === 0) {
      setLocalFamily(contextFamily);
    }
  }, [contextFamilyCode, contextFamily]);

  useEffect(() => {
    if (!userId) return;
    
    const fetchFamilyData = async () => {
      try {
        const familiesRef = collection(db, "families");
        const querySnapshot = await getDocs(familiesRef);
        let userFamily = null;
        
        querySnapshot.forEach((doc) => {
          const familyData = doc.data();
          if (!familyData.isArchived && familyData.members?.some(member => member.userId === userId)) {
            userFamily = { id: doc.id, ...familyData };
          }
        });
        
        if (userFamily) {
          setLocalFamilyCode(userFamily.code);
          setLocalFamily(userFamily.members || []);
        }
      } catch (err) {
        console.log("Failed to fetch family data:", err);
      }
    };
    
    fetchFamilyData();
  }, [userId, userEmail, userDisplayName]);

  // Component Renderers
  const renderHeader = () => (
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
        <TouchableOpacity onPress={showMenu} style={styles.backBtn}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFamilyCodeSection = () => {
    if (!myFamilyCode) {
      return (
        <View style={styles.codeSection}>
          <View style={styles.codeSectionHeader}>
            <View style={styles.codeSectionLeft}>
              <Ionicons name="add-circle" size={20} color="#FF9800" />
              <Text style={styles.codeSectionTitle}>Create Family</Text>
            </View>
          </View>
          <Text style={styles.codeInstructions}>
            Create a family and get a unique 6-digit code to share with your family members.
          </Text>
          <TouchableOpacity 
            style={[styles.createFamilyButton, loading && styles.disabledButton]}
            onPress={createFamily}
            disabled={loading}
          >
            <Ionicons name="people" size={24} color="white" />
            <Text style={styles.createFamilyButtonText}>
              {loading ? "Creating..." : "Create Family"}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.codeSection}>
        <View style={styles.codeSectionHeader}>
          <View style={styles.codeSectionLeft}>
            <Ionicons name="people" size={20} color="#4CAF50" />
            <Text style={styles.codeSectionTitle}>Your Family Code</Text>
          </View>
          {isLocalAdmin && (
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setManagementModalVisible(true)}
            >
              <Ionicons name="settings" size={20} color="#666" />
              {getMembersWithRemovalRequests && getMembersWithRemovalRequests().length > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationText}>{getMembersWithRemovalRequests().length}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.codeDisplay}>
          <Text style={styles.familyCodeText}>{myFamilyCode}</Text>
          <TouchableOpacity 
            onPress={() => copyToClipboard(myFamilyCode)}
            style={styles.copyButton}
          >
            <Ionicons name="copy" size={20} color="#fff" />
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.codeInstructions}>
          Share this code with your family members so they can join your family.
        </Text>
      </View>
    );
  };

  const renderJoinFamilySection = () => {
    if (myFamilyCode) return null;

    return (
      <View style={styles.codeSection}>
        <View style={styles.codeSectionHeader}>
          <View style={styles.codeSectionLeft}>
            <Ionicons name="enter" size={20} color="#2196F3" />
            <Text style={styles.codeSectionTitle}>Join Family</Text>
          </View>
        </View>
        <Text style={styles.codeInstructions}>
          Enter the 6-digit family code shared by your family member.
        </Text>
        <View style={styles.joinCodeContainer}>
          <TextInput
            style={styles.joinCodeInput}
            placeholder="Enter 6-digit code"
            value={joinCode}
            onChangeText={setJoinCode}
            keyboardType="numeric"
            maxLength={6}
            placeholderTextColor="#999"
          />
          <TouchableOpacity 
            style={[styles.joinButton, loading && styles.disabledButton]}
            onPress={joinFamily}
            disabled={loading || joinCode.length !== 6}
          >
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderMemberActions = (member) => {
    // Admin actions for other members
    if (isLocalAdmin && member.userId !== userId) {
      return (
        <TouchableOpacity 
          style={styles.kickButton}
          onPress={() => openRemovalConfirmation(member)}
          disabled={loading}
        >
          <Ionicons name="person-remove" size={16} color="#F44336" />
          <Text style={styles.kickButtonText}>Remove</Text>
        </TouchableOpacity>
      );
    }
    
    // Non-admin member's own actions
    if (member.userId === userId && !isLocalAdmin) {
      return (
        <TouchableOpacity 
          style={[styles.requestButton, member.removalRequested && styles.cancelRequestButton]}
          onPress={() => handleRemovalRequest(member.removalRequested)}
          disabled={loading}
        >
          <Ionicons 
            name={member.removalRequested ? "close-circle" : "exit"} 
            size={16} 
            color={member.removalRequested ? "#FF9800" : "#F44336"} 
          />
          <Text style={[styles.requestButtonText, member.removalRequested && styles.cancelRequestButtonText]}>
            {member.removalRequested ? "Cancel Request" : "Request Removal"}
          </Text>
        </TouchableOpacity>
      );
    }
    
    // Admin's own member card - show Family Creator for everyone to see
    if (member.userId === userId && isLocalAdmin) {
      return (
        <View style={styles.adminIndicator}>
          <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
          <Text style={styles.adminIndicatorText}>Family Creator</Text>
        </View>
      );
    }

    return null;
  };

  const renderMemberBadges = (member) => (
    <View style={styles.memberBadges}>
      {member.isAdmin && (
        <View style={styles.adminBadge}>
          <Ionicons name="star" size={12} color="#FF9800" />
          <Text style={styles.adminText}>Family Creator</Text>
        </View>
      )}
      {member.removalRequested && (
        <View style={styles.removalBadge}>
          <Ionicons name="warning" size={12} color="#F44336" />
          <Text style={styles.removalText}>Removal Requested</Text>
        </View>
      )}
    </View>
  );

  const renderFamilyMembers = () => {
    if (displayFamily.length === 0) return null;

    return (
      <View style={styles.familyMembersSection}>
        <View style={styles.codeSectionHeader}>
          <View style={styles.codeSectionLeft}>
            <Ionicons name="people" size={20} color="#4CAF50" />
            <Text style={styles.codeSectionTitle}>Family Members ({displayFamily.length})</Text>
          </View>
        </View>
        {displayFamily.map((member, index) => (
          <View key={index} style={styles.memberCard}>
            <View style={styles.memberInfo}>
              <Ionicons name="person-circle" size={32} color="#2196F3" />
              <View style={styles.memberDetails}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberEmail}>{member.email}</Text>
                {renderMemberBadges(member)}
              </View>
            </View>
            <View style={styles.memberActions}>
              <View style={styles.memberStatus}>
                <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(member.status) }]} />
                <Text style={styles.statusText}>{member.status}</Text>
              </View>
              {renderMemberActions(member)}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderManagementModal = () => (
    <Modal
      visible={managementModalVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={resetModalState}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Family Management</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={resetModalState}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalBody}>
            {/* Pending Removal Requests */}
            {getMembersWithRemovalRequests && getMembersWithRemovalRequests().length > 0 && (
              <View style={styles.removalRequestsSection}>
                <Text style={styles.removalRequestsTitle}>
                  ⚠️ Pending Removal Requests ({getMembersWithRemovalRequests().length})
                </Text>
                {getMembersWithRemovalRequests().map((member, index) => (
                  <View key={index} style={styles.removalRequestCard}>
                    <View style={styles.requestMemberInfo}>
                      <Ionicons name="person-circle" size={24} color="#F44336" />
                      <Text style={styles.requestMemberName}>{member.name}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.approveRemovalButton}
                      onPress={() => openRemovalConfirmation(member)}
                      disabled={loading}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text style={styles.approveRemovalText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            {/* Archive Family Section */}
            <View style={styles.archiveSection}>
              <Text style={styles.archiveSectionTitle}>🗄️ Archive Family</Text>
              <Text style={styles.archiveSectionDescription}>
                Archiving will make the family code unusable and remove all members' access. This action cannot be undone.
              </Text>
              <TouchableOpacity 
                style={[styles.archiveButton, loading && styles.disabledButton]}
                onPress={openArchiveConfirmation}
                disabled={loading}
              >
                <Ionicons name="archive" size={20} color="white" />
                <Text style={styles.archiveButtonText}>Archive Family</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderConfirmationModal = () => (
    <Modal
      visible={confirmationModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={resetModalState}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModalContent}>
          <View style={styles.confirmationModalHeader}>
            <Text style={styles.confirmationModalTitle}>
              {actionType === "archive" ? "🔒 Archive Family" : `🔒 Remove ${memberToRemove?.name}`}
            </Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={resetModalState}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.confirmationModalBody}>
            <Text style={styles.confirmationModalDescription}>
              {actionType === "archive" 
                ? "This will permanently archive your family and make the family code unusable. All members will lose access."
                : `This will remove ${memberToRemove?.name} from your family. They will lose access to family features.`
              }
            </Text>
            
            <Text style={styles.confirmationInstructions}>
              To proceed, please type "{actionType === "archive" ? "CONFIRM DELETE" : "CONFIRM REMOVAL"}" below:
            </Text>
            
            <TextInput
              style={styles.confirmationInput}
              placeholder={actionType === "archive" ? "Type: CONFIRM DELETE" : "Type: CONFIRM REMOVAL"}
              value={confirmationText}
              onChangeText={setConfirmationText}
              autoCapitalize="characters"
              placeholderTextColor="#999"
              autoFocus={true}
            />
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity style={styles.cancelConfirmButton} onPress={resetModalState}>
                <Text style={styles.cancelConfirmText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.proceedButton, 
                  (confirmationText !== (actionType === "archive" ? "CONFIRM DELETE" : "CONFIRM REMOVAL")) && styles.disabledButton
                ]}
                onPress={actionType === "archive" ? archiveFamily : () => kickMember(memberToRemove)}
                disabled={
                  loading || 
                  confirmationText !== (actionType === "archive" ? "CONFIRM DELETE" : "CONFIRM REMOVAL")
                }
              >
                <Text style={styles.proceedButtonText}>
                  {loading ? "Processing..." : (actionType === "archive" ? "Archive" : "Remove")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );

  return (
    <View style={styles.container}>
      {renderHeader()}

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="people" size={24} color="#E65100" />
        <Text style={styles.title}>Add a Family</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {renderFamilyCodeSection()}
        {renderJoinFamilySection()}
        {renderFamilyMembers()}
      </ScrollView>

      {renderManagementModal()}
      {renderConfirmationModal()}

      {/* Hamburger Menu */}
      <HamburgerMenu
        menuVisible={menuVisible}
        setMenuVisible={setMenuVisible}
        slideAnim={slideAnim}
        opacityAnim={opacityAnim}
        navigation={navigation}
      />
    </View>
  );
}