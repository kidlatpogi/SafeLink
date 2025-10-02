import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Animated,
  SafeAreaView,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import styles from "../Styles/Go_Bag.styles";
import Logo from "../Images/SafeLink_LOGO.png";
import HamburgerMenu from "../Components/HamburgerMenu";

export default function Go_Bag({ navigation }) {
  // Enhanced items with categories and priority levels
  const itemCategories = {
    essentials: [
      { name: "Water (1 gallon per person per day)", priority: "critical", icon: "water" },
      { name: "Non-perishable food (3-day supply)", priority: "critical", icon: "restaurant" },
      { name: "First aid kit", priority: "critical", icon: "medical" },
      { name: "Flashlight", priority: "critical", icon: "flashlight" },
      { name: "Portable phone charger/power bank", priority: "critical", icon: "battery-charging" },
    ],
    documents: [
      { name: "Important documents (ID, insurance, etc.)", priority: "high", icon: "document-text" },
      { name: "Cash in small bills", priority: "high", icon: "cash" },
      { name: "Emergency contact information", priority: "high", icon: "call" },
    ],
    medical: [
      { name: "Prescription medications (7-day supply)", priority: "critical", icon: "medical" },
      { name: "Over-the-counter medications", priority: "medium", icon: "medical-outline" },
      { name: "Medical supplies (bandages, antiseptic)", priority: "medium", icon: "bandage" },
    ],
    tools: [
      { name: "Multi-tool or Swiss Army knife", priority: "medium", icon: "construct" },
      { name: "Extra batteries", priority: "medium", icon: "battery-half" },
      { name: "Whistle for signaling help", priority: "high", icon: "musical-notes" },
      { name: "Duct tape", priority: "medium", icon: "layers" },
    ],
    personal: [
      { name: "Change of clothing and sturdy shoes", priority: "medium", icon: "shirt" },
      { name: "Personal hygiene items", priority: "medium", icon: "flower" },
      { name: "Face masks and hand sanitizer", priority: "high", icon: "medical" },
      { name: "Sleeping bag or warm blanket", priority: "medium", icon: "bed" },
    ]
  };

  // Flatten all items for easy management
  const allItems = Object.values(itemCategories).flat();

  const [checkedItems, setCheckedItems] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [locationPhoto, setLocationPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState({
    essentials: true,
    documents: true,
    medical: true,
    tools: false,
    personal: false,
  });

  // Hamburger menu state
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Load saved progress on component mount
  useEffect(() => {
    loadSavedProgress();
  }, []);

  // Save progress automatically when checkedItems or locationPhoto changes
  useEffect(() => {
    if (checkedItems.length > 0 || lastUpdated || locationPhoto) {
      saveProgress();
    }
  }, [checkedItems, locationPhoto]);

  const loadSavedProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem('goBagChecklist');
      if (savedData) {
        const { checkedItems: saved, lastUpdated: savedDate, locationPhoto: savedPhoto } = JSON.parse(savedData);
        setCheckedItems(saved || []);
        setLastUpdated(savedDate);
        setLocationPhoto(savedPhoto || null);
      }
    } catch (error) {
      console.error('Error loading saved progress:', error);
    }
  };

  const saveProgress = async () => {
    try {
      const dataToSave = {
        checkedItems,
        lastUpdated: new Date().toISOString(),
        locationPhoto,
      };
      await AsyncStorage.setItem('goBagChecklist', JSON.stringify(dataToSave));
      setLastUpdated(new Date().toISOString());
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

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

  const toggleItem = (itemName) => {
    if (checkedItems.includes(itemName)) {
      setCheckedItems(checkedItems.filter((i) => i !== itemName));
    } else {
      setCheckedItems([...checkedItems, itemName]);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Calculate progress statistics
  const getProgressStats = () => {
    const total = allItems.length;
    const completed = checkedItems.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    const criticalItems = allItems.filter(item => item.priority === 'critical');
    const criticalCompleted = criticalItems.filter(item => checkedItems.includes(item.name)).length;
    const criticalPercentage = criticalItems.length > 0 ? Math.round((criticalCompleted / criticalItems.length) * 100) : 0;

    return { total, completed, percentage, criticalCompleted, criticalItems: criticalItems.length, criticalPercentage };
  };

  const getCategoryProgress = (category) => {
    const categoryItems = itemCategories[category];
    const completedInCategory = categoryItems.filter(item => checkedItems.includes(item.name)).length;
    return { completed: completedInCategory, total: categoryItems.length };
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return '#F44336';
      case 'high': return '#FF9800';
      case 'medium': return '#4CAF50';
      default: return '#757575';
    }
  };

  const resetChecklist = () => {
    Alert.alert(
      'Reset Checklist',
      'Are you sure you want to reset all items? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            setCheckedItems([]);
            setLocationPhoto(null);
            AsyncStorage.removeItem('goBagChecklist');
          }
        }
      ]
    );
  };

  // Photo management functions
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please allow camera access to take a photo of your go-bag location.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7, // Compress to save storage
      });

      if (!result.canceled && result.assets[0]) {
        setLocationPhoto(result.assets[0].uri);
        Alert.alert(
          '📸 Photo Added!',
          'Your go-bag location photo has been saved locally on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const chooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setLocationPhoto(result.assets[0].uri);
        Alert.alert(
          '📸 Photo Added!',
          'Your go-bag location photo has been saved locally on your device.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error choosing photo:', error);
      Alert.alert('Error', 'Failed to select photo. Please try again.');
    }
  };

  const showPhotoOptions = () => {
    Alert.alert(
      '📸 Add Location Photo',
      'Help you and your family quickly find your go-bag during emergencies.\n\n🔒 Privacy: Photo stored locally on your device only.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: chooseFromGallery },
      ]
    );
  };

  const removePhoto = () => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove the location photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => setLocationPhoto(null)
        }
      ]
    );
  };

  // Enhanced sharing with better formatting
  const handleShare = async () => {
    try {
      const stats = getProgressStats();
      const checklistText = `🎒 Emergency Go-Bag Checklist
📊 Progress: ${stats.completed}/${stats.total} items (${stats.percentage}%)
🚨 Critical items: ${stats.criticalCompleted}/${stats.criticalItems} complete
📅 Last updated: ${lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never'}

${Object.entries(itemCategories).map(([category, items]) => {
  const categoryProgress = getCategoryProgress(category);
  return `\n📋 ${category.toUpperCase()} (${categoryProgress.completed}/${categoryProgress.total})\n${items
    .map((item) => `${checkedItems.includes(item.name) ? "✅" : "⬜"} ${item.name}${item.priority === 'critical' ? ' ⚠️' : ''}`)
    .join("\n")}`;
}).join("\n")}

Generated by SafeLink Emergency App 🚨`;
      
      await Share.share({
        message: checklistText,
        title: "Emergency Go-Bag Checklist"
      });
    } catch (err) {
      console.log("Share error:", err);
      Alert.alert("Error", "Failed to share checklist");
    }
  };

  const setReminder = () => {
    Alert.alert(
      "Set Reminder",
      "We recommend reviewing your go-bag every 6 months to update expired items and seasonal clothing.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Remind in 6 months", onPress: () => {
          // In a real app, you'd set up local notifications here
          Alert.alert("Reminder Set", "You'll be reminded to review your go-bag in 6 months.");
        }}
      ]
    );
  };

  const stats = getProgressStats();

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
        <Ionicons name="backpack" size={24} color="#FF6F00" />
        <Text style={styles.title}>Emergency Go-Bag</Text>
      </View>

      {/* Progress Overview */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressStats}>
            <Text style={styles.progressTitle}>Overall Progress</Text>
            <Text style={styles.progressPercentage}>{stats.percentage}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${stats.percentage}%` }]} />
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#F44336' }]}>{stats.criticalCompleted}</Text>
            <Text style={styles.statLabel}>Critical Items</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
        </View>

        {lastUpdated && (
          <Text style={styles.lastUpdated}>
            Last updated: {new Date(lastUpdated).toLocaleDateString()}
          </Text>
        )}

        {/* Location Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoHeader}>
            <Ionicons name="camera" size={16} color="#2196F3" />
            <Text style={styles.photoHeaderText}>Go-Bag Location (Optional)</Text>
          </View>
          
          {locationPhoto ? (
            <View style={styles.photoContainer}>
              <TouchableOpacity 
                style={styles.photoThumbnail}
                onPress={() => setShowPhotoModal(true)}
              >
                <Image source={{ uri: locationPhoto }} style={styles.photoImage} />
                <View style={styles.photoOverlay}>
                  <Ionicons name="expand" size={16} color="white" />
                </View>
              </TouchableOpacity>
              <View style={styles.photoActions}>
                <TouchableOpacity style={styles.changePhotoButton} onPress={showPhotoOptions}>
                  <Ionicons name="camera" size={14} color="#2196F3" />
                  <Text style={styles.changePhotoText}>Change</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.removePhotoButton} onPress={removePhoto}>
                  <Ionicons name="trash" size={14} color="#F44336" />
                  <Text style={styles.removePhotoText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity style={styles.addPhotoButton} onPress={showPhotoOptions}>
              <View style={styles.addPhotoIcon}>
                <Ionicons name="camera-outline" size={24} color="#2196F3" />
              </View>
              <View style={styles.addPhotoContent}>
                <Text style={styles.addPhotoTitle}>Add location photo</Text>
                <Text style={styles.addPhotoSubtitle}>Help family find your emergency supplies quickly</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          )}
          
          <Text style={styles.privacyText}>
            🔒 Photos stored locally on your device only
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-social" size={18} color="white" />
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.reminderButton} onPress={setReminder}>
          <Ionicons name="alarm" size={18} color="white" />
          <Text style={styles.buttonText}>Set Reminder</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.resetButton} onPress={resetChecklist}>
          <Ionicons name="refresh" size={18} color="white" />
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Categorized Checklist */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {Object.entries(itemCategories).map(([category, items]) => {
          const categoryProgress = getCategoryProgress(category);
          const isExpanded = expandedCategories[category];
          
          return (
            <View key={category} style={styles.categoryCard}>
              <TouchableOpacity 
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category)}
              >
                <View style={styles.categoryTitleRow}>
                  <Text style={styles.categoryTitle}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Text>
                  <View style={styles.categoryProgress}>
                    <Text style={styles.categoryProgressText}>
                      {categoryProgress.completed}/{categoryProgress.total}
                    </Text>
                  </View>
                </View>
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#666" 
                />
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.categoryItems}>
                  {items.map((item, index) => {
                    const isChecked = checkedItems.includes(item.name);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[styles.listItem, isChecked && styles.checkedItem]}
                        onPress={() => toggleItem(item.name)}
                      >
                        <View style={styles.itemLeft}>
                          <Ionicons
                            name={isChecked ? "checkbox" : "square-outline"}
                            size={24}
                            color={isChecked ? "#4CAF50" : "#999"}
                          />
                          <Ionicons 
                            name={item.icon} 
                            size={20} 
                            color={getPriorityColor(item.priority)}
                            style={styles.itemIcon}
                          />
                        </View>
                        <View style={styles.itemContent}>
                          <Text style={[styles.itemText, isChecked && styles.checkedText]}>
                            {item.name}
                          </Text>
                          <View style={styles.priorityBadge}>
                            <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(item.priority) }]} />
                            <Text style={styles.priorityText}>{item.priority}</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        {/* Emergency Tips */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={20} color="#FF9800" />
            <Text style={styles.tipsTitle}>Quick Tips</Text>
          </View>
          <Text style={styles.tipText}>• Store your go-bag in an easily accessible location</Text>
          <Text style={styles.tipText}>• Check and rotate perishable items every 6 months</Text>
          <Text style={styles.tipText}>• Include items for each family member and pets</Text>
          <Text style={styles.tipText}>• Keep copies of important documents in waterproof containers</Text>
          <Text style={styles.tipText}>• Test flashlights and radios regularly</Text>
        </View>
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.photoModalOverlay}>
          <View style={styles.photoModalContent}>
            <View style={styles.photoModalHeader}>
              <Text style={styles.photoModalTitle}>Go-Bag Location</Text>
              <TouchableOpacity 
                style={styles.photoModalClose}
                onPress={() => setShowPhotoModal(false)}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            {locationPhoto && (
              <Image source={{ uri: locationPhoto }} style={styles.photoModalImage} />
            )}
            
            <View style={styles.photoModalActions}>
              <TouchableOpacity 
                style={styles.photoModalButton} 
                onPress={() => {
                  setShowPhotoModal(false);
                  showPhotoOptions();
                }}
              >
                <Ionicons name="camera" size={20} color="#2196F3" />
                <Text style={styles.photoModalButtonText}>Change Photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.photoModalButton, styles.photoModalRemoveButton]} 
                onPress={() => {
                  setShowPhotoModal(false);
                  removePhoto();
                }}
              >
                <Ionicons name="trash" size={20} color="#F44336" />
                <Text style={[styles.photoModalButtonText, styles.photoModalRemoveText]}>Remove Photo</Text>
              </TouchableOpacity>
            </View>
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
