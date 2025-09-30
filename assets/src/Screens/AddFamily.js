import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Clipboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { useUser } from '../Components/UserContext';
import { useFamily } from '../Components/FamilyContext';
import styles from "../Styles/AddFamily.styles";
import Logo from "../Images/SafeLink_LOGO.png";
import HamburgerMenu from "../Components/HamburgerMenu";

export default function AddFamily({ navigation }) {
  const { userId, displayName: userDisplayName, email: userEmail } = useUser();
  const { family, familyCode, familyName, isAdmin } = useFamily();
  
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Set myFamilyCode from context
  const myFamilyCode = familyCode;

  // Fetch current family and check if user has existing family code
  useEffect(() => {
    if (!userId) return;
    
    const fetchFamilyData = async () => {
      try {
        // Check if user is part of any family by searching through all families
        const familiesRef = collection(db, "families");
        const querySnapshot = await getDocs(familiesRef);
        
        let userFamily = null;
        
        querySnapshot.forEach((doc) => {
          const familyData = doc.data();
          const isUserMember = familyData.members?.some(member => member.userId === userId);
          
          if (isUserMember) {
            userFamily = { id: doc.id, ...familyData };
          }
        });
        
        if (userFamily) {
          setMyFamilyCode(userFamily.code);
          setFamily(userFamily.members || []);
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
        const familiesRef = collection(db, "families");
        const q = query(familiesRef, where("code", "==", newCode));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          isUnique = true;
        }
      }

      // Create new family document
      const familyData = {
        code: newCode,
        createdAt: serverTimestamp(),
        createdBy: userId,
        members: [{
          userId,
          email: userEmail,
          name: userDisplayName,
          isAdmin: true,
          joinedAt: new Date().toISOString(),
          status: "SAFE",
          lastUpdate: new Date().toISOString()
        }]
      };

      await addDoc(collection(db, "families"), familyData);
      
      setMyFamilyCode(newCode);
      setFamily(familyData.members);
      
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
      Alert.alert("Error", "Failed to create family. Please try again.");
    }
    
    setLoading(false);
  };

  // Join existing family using code
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
      // Find family with the code
      const familiesRef = collection(db, "families");
      const q = query(familiesRef, where("code", "==", joinCode.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "Invalid family code. Please check and try again.");
        setLoading(false);
        return;
      }

      const familyDoc = querySnapshot.docs[0];
      const familyData = familyDoc.data();
      
      // Check if user is already a member
      const isAlreadyMember = familyData.members.some(member => member.userId === userId);
      if (isAlreadyMember) {
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
        status: "SAFE",
        lastUpdate: new Date().toISOString()
      };

      const updatedMembers = [...familyData.members, newMember];

      await updateDoc(familyDoc.ref, {
        members: updatedMembers
      });

      setMyFamilyCode(joinCode.trim());
      setFamily(updatedMembers);
      setJoinCode("");

      Alert.alert("Joined Family!", "You've successfully joined the family.");
    } catch (error) {
      console.error("Error joining family:", error);
      Alert.alert("Error", "Failed to join family. Please try again.");
    }

    setLoading(false);
  };

  // Copy code to clipboard
  const copyToClipboard = (code) => {
    Clipboard.setString(code);
    Alert.alert("Copied!", "Family code copied to clipboard.");
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
        <Text style={styles.title}>Add A Family</Text>
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
        {family.length > 0 && (
          <View style={styles.familyMembersSection}>
            <View style={styles.codeSectionHeader}>
              <Ionicons name="people" size={20} color="#4CAF50" />
              <Text style={styles.codeSectionTitle}>Family Members ({family.length})</Text>
            </View>
            {family.map((member, index) => (
              <View key={index} style={styles.memberCard}>
                <View style={styles.memberInfo}>
                  <Ionicons name="person-circle" size={32} color="#2196F3" />
                  <View style={styles.memberDetails}>
                    <Text style={styles.memberName}>{member.name}</Text>
                    <Text style={styles.memberEmail}>{member.email}</Text>
                    {member.isAdmin && (
                      <View style={styles.adminBadge}>
                        <Ionicons name="star" size={12} color="#FF9800" />
                        <Text style={styles.adminText}>Admin</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.memberStatus}>
                  <View style={[styles.statusIndicator, { backgroundColor: member.status === 'SAFE' ? '#4CAF50' : '#FF5722' }]} />
                  <Text style={styles.statusText}>{member.status}</Text>
                </View>
              </View>
            ))}
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
