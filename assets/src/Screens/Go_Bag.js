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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Save progress automatically when checkedItems changes
  useEffect(() => {
    if (checkedItems.length > 0 || lastUpdated) {
      saveProgress();
    }
  }, [checkedItems]);

  const loadSavedProgress = async () => {
    try {
      const savedData = await AsyncStorage.getItem('goBagChecklist');
      if (savedData) {
        const { checkedItems: saved, lastUpdated: savedDate } = JSON.parse(savedData);
        setCheckedItems(saved || []);
        setLastUpdated(savedDate);
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
            AsyncStorage.removeItem('goBagChecklist');
          }
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
