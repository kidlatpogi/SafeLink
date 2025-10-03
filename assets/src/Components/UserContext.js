import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { doc, onSnapshot } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    let unsubscribeUser = null;

    const setupUserListener = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setUserData(null);
          setUserId(null);
          setLoading(false);
          return;
        }

        setUserId(currentUser.uid);

        // Set up real-time listener for user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        unsubscribeUser = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            console.log('UserContext - Document updated, isVerifiedOfficial:', data.isVerifiedOfficial || data.profile?.isVerifiedOfficial);
            
            // Extract display name from data
            const displayName = data.displayName || 
                               data.profile?.displayName || 
                               `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim() ||
                               currentUser.displayName ||
                               currentUser.email?.split('@')[0] ||
                               'User';

            const enrichedData = {
              ...data,
              uid: currentUser.uid,
              email: currentUser.email,
              displayName,
              firstName: data.profile?.firstName || '',
              lastName: data.profile?.lastName || '',
              phoneNumber: data.profile?.phoneNumber || data.phoneNumber || '',
              profileComplete: !!data.profile?.firstName && !!data.profile?.lastName,
              // Official verification fields - check both root level and profile level
              isVerifiedOfficial: data.isVerifiedOfficial || data.profile?.isVerifiedOfficial || false,
              officialRole: data.officialRole || data.profile?.officialRole || null,
              barangayAssignment: data.barangayAssignment || data.profile?.barangayAssignment || null,
              canBroadcast: data.canBroadcast || data.profile?.canBroadcast || false,
              verificationStatus: data.verificationStatus || data.profile?.verificationStatus || 'none',
              verificationData: data.verificationData || data.profile?.verificationData || null
            };

            setUserData(enrichedData);
            
            // Cache user data for offline access
            AsyncStorage.setItem('cachedUserData', JSON.stringify(enrichedData));
          } else {
            setUserData(null);
          }
          setLoading(false);
        }, (error) => {
          console.error('UserContext - Error listening to user data:', error);
          setLoading(false);
        });

      } catch (error) {
        console.error('UserContext - Setup error:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setupUserListener();
      } else {
        setUserData(null);
        setUserId(null);
        setLoading(false);
        if (unsubscribeUser) {
          unsubscribeUser();
        }
      }
    });

    return () => {
      if (unsubscribeUser) {
        unsubscribeUser();
      }
      unsubscribeAuth();
    };
  }, []);

  // Method to trigger update notifications to other components
  const notifyDataUpdate = (updateType, data) => {
    // This could emit events or trigger other listeners if needed
  };

  const value = {
    userData,
    userId,
    loading,
    displayName: userData?.displayName || 'User',
    firstName: userData?.firstName || '',
    lastName: userData?.lastName || '',
    email: userData?.email || '',
    phoneNumber: userData?.phoneNumber || '',
    profileComplete: userData?.profileComplete || false,
    // Official verification properties
    isVerifiedOfficial: userData?.isVerifiedOfficial || false,
    officialRole: userData?.officialRole || null,
    barangayAssignment: userData?.barangayAssignment || null,
    canBroadcast: userData?.canBroadcast || false,
    verificationStatus: userData?.verificationStatus || 'none',
    notifyDataUpdate
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;