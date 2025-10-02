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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from 'expo-clipboard';
import { db, auth } from "../firebaseConfig";
import { 
  collection, 
  addDoc, 
  setDoc,
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where
} from "firebase/firestore";
import { useUser } from '../Components/UserContext';
import { useFamily } from '../Components/FamilyContext';
import styles from "../Styles/AddFamily.styles";
import Logo from "../Images/SafeLink_LOGO.png";
import HamburgerMenu from "../Components/HamburgerMenu";

export default function AddFamily({ navigation }) {
  const { userId, displayName: userDisplayName, email: userEmail } = useUser();
  const { 
    family: contextFamily, 
    familyCode: contextFamilyCode, 
    familyName, 
    isAdmin,
    getMembersWithRemovalRequests,
    isCreator
  } = useFamily();
  
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Local state for family data (since context doesn't provide setters)
  const [localFamily, setLocalFamily] = useState([]);
  const [localFamilyCode, setLocalFamilyCode] = useState("");

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Hamburger menu function
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

  // Set local family data from context or use local state
  const myFamilyCode = localFamilyCode || contextFamilyCode;
  const displayFamily = localFamily.length > 0 ? localFamily : (contextFamily || []);

  // Sync context data with local state
  useEffect(() => {
    console.log('AddFamily - Context sync:', { contextFamilyCode, contextFamily: contextFamily?.length, localFamilyCode, localFamily: localFamily.length });
    
    if (contextFamilyCode && !localFamilyCode) {
      setLocalFamilyCode(contextFamilyCode);
    }
    if (contextFamily && Array.isArray(contextFamily) && contextFamily.length > 0 && localFamily.length === 0) {
      setLocalFamily(contextFamily);
    }
  }, [contextFamilyCode, contextFamily]);

  // Fetch current family and check if user has existing family code
  // Note: This supports both new structure (family code as doc ID) and legacy structure (random doc IDs)
  useEffect(() => {
    if (!userId) return;
    
    const fetchFamilyData = async () => {
      try {
        // Check if user is part of any family by searching through all families
        // This approach works for both new and legacy family documents
        const familiesRef = collection(db, "families");
        const querySnapshot = await getDocs(familiesRef);
        
        let userFamily = null;
        
        querySnapshot.forEach((doc) => {
          const familyData = doc.data();
          
          // Skip archived families
          if (familyData.isArchived) {
            return;
          }
          
          const isUserMember = familyData.members?.some(member => member.userId === userId);
          
          if (isUserMember) {
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

  // Generate 6-digit unique family code
  const generateFamilyCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Create new family with unique code
  const createFamily = async () => {
    console.log('CreateFamily - Starting with:', { userId, userEmail, userDisplayName, myFamilyCode });
    
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
      console.log('CreateFamily - Generating unique code...');
      let isUnique = false;
      let newCode = "";
      
      // Generate unique code
      while (!isUnique) {
        newCode = generateFamilyCode();
        // Check if document with this code already exists (including archived families)
        const familyDocRef = doc(db, "families", newCode);
        const familyDocSnap = await getDoc(familyDocRef);
        
        if (!familyDocSnap.exists()) {
          isUnique = true;
        } else {
          // If family exists but is archived, we can't reuse the code
          const existingFamily = familyDocSnap.data();
          if (existingFamily.isArchived) {
            console.log('CreateFamily - Code already used by archived family:', newCode);
            // Continue loop to generate new code
          }
        }
      }

      console.log('CreateFamily - Generated unique code:', newCode);

      // Create new family document with family code as document ID
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

      console.log('CreateFamily - Creating family document with ID:', newCode);
      const familyDocRef = doc(db, "families", newCode);
      await setDoc(familyDocRef, familyData);
      
      console.log('CreateFamily - Family created successfully');
      setLocalFamilyCode(newCode);
      setLocalFamily(familyData.members);
      
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

  // Join existing family using code
  const joinFamily = async () => {
    console.log('JoinFamily - Starting with:', { joinCode, userId, userEmail, userDisplayName, myFamilyCode });
    
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
      console.log('JoinFamily - Searching for family with code:', joinCode.trim());
      // Get family document directly using the family code as document ID
      const familyDocRef = doc(db, "families", joinCode.trim());
      const familyDocSnap = await getDoc(familyDocRef);

      if (!familyDocSnap.exists()) {
        console.log('JoinFamily - No family found with code:', joinCode.trim());
        Alert.alert("Error", "Invalid family code. Please check and try again.");
        setLoading(false);
        return;
      }

      const familyData = familyDocSnap.data();
      
      // Check if family is archived
      if (familyData.isArchived) {
        console.log('JoinFamily - Family is archived:', joinCode.trim());
        Alert.alert("Error", "This family is no longer active. Please contact the family admin for a new code.");
        setLoading(false);
        return;
      }
      
      console.log('JoinFamily - Found family:', familyData);
      
      // Ensure members is an array
      if (!familyData.members || !Array.isArray(familyData.members)) {
        console.log('JoinFamily - Invalid family data structure');
        Alert.alert("Error", "Invalid family data structure. Please contact support.");
        setLoading(false);
        return;
      }
      
      // Check if user is already a member
      const isAlreadyMember = familyData.members.some(member => member.userId === userId);
      if (isAlreadyMember) {
        console.log('JoinFamily - User already a member');
        Alert.alert("Info", "You're already a member of this family.");
        setLoading(false);
        return;
      }

      // Add user to family members
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
      
      console.log('JoinFamily - Updating family with new member:', { newMember, updatedMembers });

      await updateDoc(familyDocRef, {
        members: updatedMembers
      });

      console.log('JoinFamily - Successfully joined family');
      setLocalFamilyCode(joinCode.trim());
      setLocalFamily(updatedMembers);
      setJoinCode("");

      Alert.alert("Joined Family!", "You've successfully joined the family.");
    } catch (error) {
      console.error("Error joining family:", error);
      Alert.alert("Error", `Failed to join family: ${error.message || 'Unknown error'}. Please try again.`);
    }

    setLoading(false);
  };

  // Copy code to clipboard
  const copyToClipboard = async (code) => {
    try {
      await Clipboard.setStringAsync(code);
      Alert.alert("Copied!", "Family code copied to clipboard.");
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      Alert.alert("Error", "Failed to copy code to clipboard.");
    }
  };

  // Archive family (only family creator can do this)
  const archiveFamily = async () => {
    if (!myFamilyCode || !isAdmin) {
      Alert.alert("Error", "Only the family creator can archive the family.");
      return;
    }

    Alert.alert(
      "Archive Family",
      "Are you sure you want to archive this family? This will make the family code unusable and all members will lose access.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const familyDocRef = doc(db, "families", myFamilyCode);
              await updateDoc(familyDocRef, {
                isArchived: true,
                archivedAt: new Date().toISOString(),
                archivedBy: userId
              });

              setLocalFamilyCode("");
              setLocalFamily([]);
              Alert.alert("Family Archived", "The family has been archived successfully.");
            } catch (error) {
              console.error("Error archiving family:", error);
              Alert.alert("Error", "Failed to archive family. Please try again.");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Kick family member (only admin can do this)
  const kickMember = async (memberToKick) => {
    if (!isAdmin) {
      Alert.alert("Error", "Only family admin can remove members.");
      return;
    }

    if (memberToKick.userId === userId) {
      Alert.alert("Error", "You cannot remove yourself. Use archive family instead.");
      return;
    }

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${memberToKick.name} from the family?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const familyDocRef = doc(db, "families", myFamilyCode);
              const updatedMembers = displayFamily.filter(member => member.userId !== memberToKick.userId);
              
              await updateDoc(familyDocRef, {
                members: updatedMembers
              });

              setLocalFamily(updatedMembers);
              Alert.alert("Member Removed", `${memberToKick.name} has been removed from the family.`);
            } catch (error) {
              console.error("Error removing member:", error);
              Alert.alert("Error", "Failed to remove member. Please try again.");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Request removal from family (members can request to be removed)
  const requestRemoval = async () => {
    if (isAdmin) {
      Alert.alert("Info", "As the family admin, you can archive the entire family instead.");
      return;
    }

    Alert.alert(
      "Request Removal",
      "Are you sure you want to request removal from this family? The family admin will be notified.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Request",
          onPress: async () => {
            setLoading(true);
            try {
              const familyDocRef = doc(db, "families", myFamilyCode);
              const updatedMembers = displayFamily.map(member => {
                if (member.userId === userId) {
                  return {
                    ...member,
                    removalRequested: true,
                    removalRequestedAt: new Date().toISOString()
                  };
                }
                return member;
              });
              
              await updateDoc(familyDocRef, {
                members: updatedMembers
              });

              setLocalFamily(updatedMembers);
              Alert.alert("Request Sent", "Your removal request has been sent to the family admin.");
            } catch (error) {
              console.error("Error requesting removal:", error);
              Alert.alert("Error", "Failed to send removal request. Please try again.");
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  // Cancel removal request
  const cancelRemovalRequest = async () => {
    setLoading(true);
    try {
      const familyDocRef = doc(db, "families", myFamilyCode);
      const updatedMembers = displayFamily.map(member => {
        if (member.userId === userId) {
          return {
            ...member,
            removalRequested: false,
            removalRequestedAt: null
          };
        }
        return member;
      });
      
      await updateDoc(familyDocRef, {
        members: updatedMembers
      });

      setLocalFamily(updatedMembers);
      Alert.alert("Request Cancelled", "Your removal request has been cancelled.");
    } catch (error) {
      console.error("Error cancelling removal request:", error);
      Alert.alert("Error", "Failed to cancel removal request. Please try again.");
    }
    setLoading(false);
  };

  // Get appropriate status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "i'm safe":
      case "safe":
        return "#4CAF50"; // Green
      case "not yet responded":
        return "#FF9800"; // Orange
      case "unknown":
        return "#9E9E9E"; // Gray
      case "evacuated":
      case "emergency":
        return "#F44336"; // Red
      default:
        return "#FF9800"; // Default orange
    }
  };

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
          <TouchableOpacity onPress={showMenu} style={styles.backBtn}>
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="people" size={24} color="#E65100" />
        <Text style={styles.title}>Add a Family</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        
        {/* My Family Code Section */}
        {myFamilyCode ? (
          <View style={styles.codeSection}>
            <View style={styles.codeSectionHeader}>
              <Ionicons name="people" size={20} color="#4CAF50" />
              <Text style={styles.codeSectionTitle}>Your Family Code</Text>
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
        ) : (
          <View style={styles.codeSection}>
            <View style={styles.codeSectionHeader}>
              <Ionicons name="add-circle" size={20} color="#FF9800" />
              <Text style={styles.codeSectionTitle}>Create Family</Text>
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
        )}

        {/* Join Family Section */}
        {!myFamilyCode && (
          <View style={styles.codeSection}>
            <View style={styles.codeSectionHeader}>
              <Ionicons name="enter" size={20} color="#2196F3" />
              <Text style={styles.codeSectionTitle}>Join Family</Text>
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
        )}

        {/* Current Family Members */}
        {displayFamily.length > 0 && (
          <View style={styles.familyMembersSection}>
            <View style={styles.codeSectionHeader}>
              <Ionicons name="people" size={20} color="#4CAF50" />
              <Text style={styles.codeSectionTitle}>Family Members ({displayFamily.length})</Text>
            </View>
            {displayFamily.map((member, index) => (
              <View key={index} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Ionicons name="person-circle" size={32} color="#2196F3" />
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    <View style={styles.memberBadges}>
                      {member.isAdmin && (
                        <View style={styles.adminBadge}>
                          <Ionicons name="star" size={12} color="#FF9800" />
                          <Text style={styles.adminText}>Admin</Text>
                        </View>
                      )}
                      {member.removalRequested && (
                        <View style={styles.removalBadge}>
                          <Ionicons name="warning" size={12} color="#F44336" />
                          <Text style={styles.removalText}>Removal Requested</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.memberActions}>
                  <View style={styles.memberStatus}>
                    <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(member.status) }]} />
                    <Text style={styles.statusText}>{member.status}</Text>
                  </View>
                  
                  {/* Admin Actions */}
                  {isAdmin && member.userId !== userId && (
                    <TouchableOpacity 
                      style={styles.kickButton}
                      onPress={() => kickMember(member)}
                      disabled={loading}
                    >
                      <Ionicons name="person-remove" size={16} color="#F44336" />
                      <Text style={styles.kickButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                  
                  {/* Member's own actions */}
                  {member.userId === userId && !isAdmin && (
                    <TouchableOpacity 
                      style={[styles.requestButton, member.removalRequested && styles.cancelRequestButton]}
                      onPress={member.removalRequested ? cancelRemovalRequest : requestRemoval}
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
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Family Management Section - Only for Admins */}
        {myFamilyCode && isAdmin && (
          <View style={styles.managementSection}>
            <View style={styles.codeSectionHeader}>
              <Ionicons name="settings" size={20} color="#F44336" />
              <Text style={styles.codeSectionTitle}>Family Management</Text>
            </View>
            
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
                      onPress={() => kickMember(member)}
                      disabled={loading}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                      <Text style={styles.approveRemovalText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.archiveButton, loading && styles.disabledButton]}
              onPress={archiveFamily}
              disabled={loading}
            >
              <Ionicons name="archive" size={20} color="white" />
              <Text style={styles.archiveButtonText}>
                {loading ? "Archiving..." : "Archive Family"}
              </Text>
            </TouchableOpacity>
            <Text style={styles.archiveWarning}>
              ⚠️ Archiving will make the family code unusable and remove all members' access. This action cannot be undone.
            </Text>
          </View>
        )}
      </ScrollView>

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
