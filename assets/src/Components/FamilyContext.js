import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, getDocs, doc as firestoreDoc, getDoc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useUser } from './UserContext';
import AutoStatusService from './AutoStatusService';

const FamilyContext = createContext();

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};

export const FamilyProvider = ({ children }) => {
  const { userId } = useUser();
  const [familyData, setFamilyData] = useState({
    family: [],
    familyCode: '',
    familyName: '',
    isAdmin: false,
    userStatus: 'Not Yet Responded'
  });
  const [loading, setLoading] = useState(true);
  const [familyId, setFamilyId] = useState(null);

  useEffect(() => {
    let unsubscribeFamily = null;

    const setupFamilyListener = async () => {
      if (!userId) {
        setFamilyData({
          family: [],
          familyCode: '',
          familyName: '',
          isAdmin: false,
          userStatus: 'Not Yet Responded'
        });
        setLoading(false);
        return;
      }

      try {
        // Find the family this user belongs to
        const familiesRef = collection(db, "families");
        const querySnapshot = await getDocs(familiesRef);
        
        let userFamily = null;
        
        querySnapshot.forEach((familyDoc) => {
          const familyDocData = familyDoc.data();
          
          // Skip archived families
          if (familyDocData.isArchived) {
            return;
          }
          
          const memberFound = familyDocData.members?.find(member => member.userId === userId);
          
          if (memberFound) {
            userFamily = {
              id: familyDoc.id,
              ...familyDocData
            };
          }
        });

        if (userFamily) {
          setFamilyId(userFamily.id);

          // Set up real-time listener for this family
          const familyDocRef = firestoreDoc(db, "families", userFamily.id);
          unsubscribeFamily = onSnapshot(familyDocRef, async (doc) => {
            if (doc.exists()) {
              const familyDocData = doc.data();
              
              // Find current user in family members
              const currentUserMember = familyDocData.members?.find(member => member.userId === userId);
              
              // Enrich family members with additional data
              const enrichedMembers = await Promise.all(
                (familyDocData.members || []).map(async (member) => {
                  try {
                    // Get user profile data
                    const userDoc = await getDoc(firestoreDoc(db, "users", member.userId));
                    let phoneNumber = member.phoneNumber;
                    let emergencyLocation = null;
                    let locationData = null;
                    let updatedName = member.name;

                    if (userDoc.exists()) {
                      const userData = userDoc.data();
                      
                      // Update name from user profile if changed
                      if (userData.displayName && userData.displayName !== member.name) {
                        updatedName = userData.displayName;
                      } else if (userData.profile?.firstName && userData.profile?.lastName) {
                        const profileName = `${userData.profile.firstName} ${userData.profile.lastName}`;
                        if (profileName !== member.name) {
                          updatedName = profileName;
                        }
                      }
                      
                      // Get phone number from profile if not in family data
                      if (!phoneNumber && userData.profile?.phoneNumber) {
                        phoneNumber = userData.profile.phoneNumber;
                      }
                      
                      // Get location data from profile.coordinates
                      if (userData.profile?.coordinates) {
                        locationData = userData.profile.coordinates;
                      }
                    }

                    // Get emergency location data (priority)
                    try {
                      const emergencyLocationDoc = await getDoc(firestoreDoc(db, "users", member.userId, "emergencyLocation", "current"));
                      if (emergencyLocationDoc.exists()) {
                        emergencyLocation = emergencyLocationDoc.data();
                        locationData = emergencyLocation; // Override with emergency location
                      }
                    } catch (locationError) {
                      // No emergency location found for this member
                    }

                    return {
                      ...member,
                      name: updatedName, // Use updated name
                      phoneNumber,
                      emergencyLocation,
                      locationData
                    };
                  } catch (error) {
                    console.error("FamilyContext - Error enriching member data:", error);
                    return member;
                  }
                })
              );

              // Sort members to put current user first
              const sortedMembers = enrichedMembers.sort((a, b) => {
                if (a.userId === userId) return -1;
                if (b.userId === userId) return 1;
                return 0;
              });

              setFamilyData({
                family: sortedMembers,
                familyCode: familyDocData.code || familyDocData.familyCode || '',
                familyName: familyDocData.familyName || '',
                isAdmin: currentUserMember?.isAdmin || false,
                userStatus: currentUserMember?.status || 'Not Yet Responded'
              });

              // Initialize auto status monitoring for this family
              const familyCode = familyDocData.code || familyDocData.familyCode || '';
              if (familyCode) {
                AutoStatusService.initializeAutoStatusForFamily(familyCode);
                console.log('FamilyContext - Auto status service initialized for family:', familyCode);
              }
            }
          });

          setLoading(false);
        } else {
          setFamilyData({
            family: [],
            familyCode: '',
            familyName: '',
            isAdmin: false,
            userStatus: 'Not Yet Responded'
          });
          setLoading(false);
        }
      } catch (error) {
        console.error("FamilyContext - Error setting up family listener:", error);
        setLoading(false);
      }
    };

    setupFamilyListener();

    return () => {
      if (unsubscribeFamily) {
        unsubscribeFamily();
      }
      // Cleanup auto status service
      AutoStatusService.cleanup();
    };
  }, [userId]);

  const value = {
    ...familyData,
    loading,
    familyId,
    // Helper methods
    getCurrentUserMember: () => familyData.family.find(member => member.userId === userId),
    getFamilyMemberById: (memberId) => familyData.family.find(member => member.userId === memberId),
    getFamilyMemberCount: () => familyData.family.length,
    
    // Update user status using family code as document ID
    updateUserStatus: async (newStatus) => {
      if (!familyData.familyCode || !userId) {
        console.error('FamilyContext - Cannot update status: missing familyCode or userId');
        return false;
      }
      
      try {
        console.log('FamilyContext - Updating user status:', { familyCode: familyData.familyCode, userId, newStatus });
        
        // Get family document using family code as document ID
        const familyDocRef = firestoreDoc(db, "families", familyData.familyCode);
        const familyDocSnap = await getDoc(familyDocRef);
        
        if (!familyDocSnap.exists()) {
          console.error('FamilyContext - Family document not found:', familyData.familyCode);
          return false;
        }
        
        const currentFamilyData = familyDocSnap.data();
        const updatedMembers = currentFamilyData.members.map(member => {
          if (member.userId === userId) {
            return {
              ...member,
              status: newStatus,
              lastUpdate: new Date().toISOString()
            };
          }
          return member;
        });
        
        await updateDoc(familyDocRef, { members: updatedMembers });
        
        // Reset auto status timers when user manually updates status
        AutoStatusService.resetTimerForUser(userId, familyData.familyCode);
        
        console.log('FamilyContext - User status updated successfully');
        return true;
      } catch (error) {
        console.error('FamilyContext - Error updating user status:', error);
        return false;
      }
    },

    // Get members with pending removal requests (admin only)
    getMembersWithRemovalRequests: () => {
      return familyData.family.filter(member => member.removalRequested === true);
    },

    // Check if current user is the family creator
    isCreator: () => {
      const currentUser = familyData.family.find(member => member.userId === userId);
      return currentUser?.isAdmin && familyData.createdBy === userId;
    }
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

export default FamilyContext;