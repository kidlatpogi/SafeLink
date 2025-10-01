import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import BroadcastSettings from '../Components/BroadcastSettings';
import HamburgerMenu from '../Components/HamburgerMenu';

const BroadcastSettingsScreen = ({ navigation }) => {
  const [broadcastSettings, setBroadcastSettings] = useState({
    radiusEnabled: true,
    radius: 20,
    adminEnabled: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  // Load existing settings on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.broadcastSettings) {
            setBroadcastSettings(userData.broadcastSettings);
          }
        }
      }
    } catch (error) {
      console.error('Error loading broadcast settings:', error);
    }
  };

  const saveSettings = async () => {
    setIsLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        
        // Update only the broadcast settings
        await setDoc(userDocRef, {
          broadcastSettings: broadcastSettings,
          updatedAt: new Date().toLocaleString()
        }, { merge: true });

        Alert.alert(
          'Success',
          'Broadcast settings saved successfully!',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error saving broadcast settings:', error);
      Alert.alert(
        'Error',
        'Failed to save broadcast settings. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={32} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Broadcast Settings</Text>
          <Text style={styles.headerSubtitle}>Configure your alert preferences</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => setIsMenuVisible(true)}
        >
          <Ionicons name="menu" size={32} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <BroadcastSettings
          onSettingsChange={setBroadcastSettings}
          initialRadius={broadcastSettings.radius}
          initialLocationBased={broadcastSettings.radiusEnabled}
          initialAdminBased={broadcastSettings.adminEnabled}
        />

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.disabledButton]}
          onPress={saveSettings}
          disabled={isLoading}
        >
          <Ionicons 
            name={isLoading ? "sync" : "checkmark-circle"} 
            size={20} 
            color="#fff" 
            style={[styles.saveButtonIcon, isLoading && styles.rotating]} 
          />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Text>
        </TouchableOpacity>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#0ea5e9" />
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <Text style={styles.infoText}>
            • <Text style={styles.boldText}>Location Alerts:</Text> Get notified about emergencies within your chosen radius{'\n'}
            • <Text style={styles.boldText}>Administrative Alerts:</Text> Receive alerts for your specific barangay, municipality, and province{'\n'}
            • <Text style={styles.boldText}>Battery Impact:</Text> Smaller radius = longer battery life
          </Text>
        </View>
      </View>
      
      <HamburgerMenu 
        isVisible={isMenuVisible}
        onClose={() => setIsMenuVisible(false)}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF6F00',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: 'Montserrat-VariableFont_wght',
    marginTop: 2,
  },
  content: {
    flex: 1,
    backgroundColor: '#fff',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6F00',
    marginHorizontal: 20,
    marginVertical: 20,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  infoSection: {
    backgroundColor: '#f0f9ff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0369a1',
    marginLeft: 8,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  infoText: {
    fontSize: 14,
    color: '#0369a1',
    lineHeight: 22,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  boldText: {
    fontWeight: '600',
  },
});

export default BroadcastSettingsScreen;