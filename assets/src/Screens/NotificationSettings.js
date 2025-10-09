import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Switch, 
  Alert, 
  ScrollView,
  Image,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../Components/NotificationContext';
import { useUser } from '../Components/UserContext';
import styles from '../Styles/NotificationSettings.styles';
import Logo from '../Images/SafeLink_LOGO.png';
import HamburgerMenu from '../Components/HamburgerMenu';

export default function NotificationSettings({ navigation }) {
  const { userId } = useUser();
  const { 
    notificationSettings, 
    updateNotificationSettings, 
    sendTestNotification,
    getNotificationStatus 
  } = useNotifications();
  
  const [settings, setSettings] = useState(notificationSettings);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setSettings(notificationSettings);
  }, [notificationSettings]);

  const handleSettingChange = async (settingKey, value) => {
    setLoading(true);
    
    try {
      const newSettings = { ...settings, [settingKey]: value };
      setSettings(newSettings);
      await updateNotificationSettings(newSettings);
      
      Alert.alert(
        'Settings Updated', 
        `${getSettingDisplayName(settingKey)} notifications ${value ? 'enabled' : 'disabled'}`
      );
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      Alert.alert('Error', 'Failed to update notification settings');
      // Revert the change
      setSettings(settings);
    } finally {
      setLoading(false);
    }
  };

  const getSettingDisplayName = (key) => {
    switch (key) {
      case 'familyStatus': return 'Family Status';
      case 'disasters': return 'Disaster Alerts';
      case 'broadcasts': return 'Emergency Broadcasts';
      default: return key;
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Test Sent', 'Check your notifications!');
    } catch (error) {
      Alert.alert('Error', 'Failed to send test notification');
    }
  };

  const getNotificationStatusDisplay = () => {
    const status = getNotificationStatus();
    
    if (!status.isInitialized) {
      return {
        text: 'Initializing...',
        color: '#FF9800',
        icon: 'time'
      };
    }
    
    if (!status.hasPermission) {
      return {
        text: 'Permission Denied',
        color: '#F44336',
        icon: 'close-circle'
      };
    }
    
    return {
      text: 'Active',
      color: '#4CAF50',
      icon: 'checkmark-circle'
    };
  };

  const statusDisplay = getNotificationStatusDisplay();

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
        <Ionicons name="notifications" size={24} color="#E65100" />
        <Text style={styles.title}>Notification Settings</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Status Section */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>Notification Status</Text>
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <Ionicons name={statusDisplay.icon} size={24} color={statusDisplay.color} />
              <Text style={[styles.statusText, { color: statusDisplay.color }]}>
                {statusDisplay.text}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestNotification}
            >
              <Ionicons name="flask" size={20} color="white" />
              <Text style={styles.testButtonText}>Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Sections */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          
          {/* Family Status Notifications */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingInfo}>
                <Ionicons name="people" size={24} color="#4CAF50" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Family Status Updates</Text>
                  <Text style={styles.settingDescription}>
                    Get notified when family members update their safety status
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.familyStatus}
                onValueChange={(value) => handleSettingChange('familyStatus', value)}
                disabled={loading}
                trackColor={{ false: '#767577', true: '#4CAF50' }}
                thumbColor={settings.familyStatus ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            
            {settings.familyStatus && (
              <View style={styles.settingDetails}>
                <Text style={styles.detailText}>
                  • Safe status updates{'\n'}
                  • Evacuation notifications{'\n'}
                  • Unknown status alerts{'\n'}
                  • Delayed response reminders
                </Text>
              </View>
            )}
          </View>

          {/* Disaster Alerts */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingInfo}>
                <Ionicons name="warning" size={24} color="#FF5722" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Disaster Alerts</Text>
                  <Text style={styles.settingDescription}>
                    Receive alerts about disasters and emergencies near your location
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.disasters}
                onValueChange={(value) => handleSettingChange('disasters', value)}
                disabled={loading}
                trackColor={{ false: '#767577', true: '#FF5722' }}
                thumbColor={settings.disasters ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            
            {settings.disasters && (
              <View style={styles.settingDetails}>
                <Text style={styles.detailText}>
                  • Earthquakes, typhoons, floods{'\n'}
                  • Severe weather warnings{'\n'}
                  • Emergency evacuations{'\n'}
                  • Within 50km radius
                </Text>
              </View>
            )}
          </View>

          {/* Emergency Broadcasts */}
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <View style={styles.settingInfo}>
                <Ionicons name="megaphone" size={24} color="#2196F3" />
                <View style={styles.settingText}>
                  <Text style={styles.settingTitle}>Emergency Broadcasts</Text>
                  <Text style={styles.settingDescription}>
                    Official emergency messages from local authorities
                  </Text>
                </View>
              </View>
              <Switch
                value={settings.broadcasts}
                onValueChange={(value) => handleSettingChange('broadcasts', value)}
                disabled={loading}
                trackColor={{ false: '#767577', true: '#2196F3' }}
                thumbColor={settings.broadcasts ? '#ffffff' : '#f4f3f4'}
              />
            </View>
            
            {settings.broadcasts && (
              <View style={styles.settingDetails}>
                <Text style={styles.detailText}>
                  • Official announcements{'\n'}
                  • Evacuation orders{'\n'}
                  • Safety instructions{'\n'}
                  • Emergency updates
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>About Notifications</Text>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={24} color="#FF9800" />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>How it works</Text>
              <Text style={styles.infoDescription}>
                SafeLink uses push notifications to keep you informed about your family's safety and nearby emergencies. 
                Notifications are sent in real-time and work even when the app is closed.
                {'\n\n'}
                High-priority alerts (evacuations, extreme weather) will override your device's Do Not Disturb settings.
              </Text>
            </View>
          </View>
        </View>
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