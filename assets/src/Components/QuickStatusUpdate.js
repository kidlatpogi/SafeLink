import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from './UserContext';
import { useFamily } from './FamilyContext';
import { useNotifications } from './NotificationContext';
import styles from "../Styles/Home.styles";

const QuickStatusUpdate = ({ displayName }) => {
  const { userId } = useUser();
  const { userStatus, updateUserStatus, familyCode, familyMembers } = useFamily();
  const { notificationService } = useNotifications();

  // Quick status update function
  const updateQuickStatus = async (newStatus) => {
    if (!userId) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    if (!familyCode) {
      Alert.alert("Info", "You need to join or create a family first to update your status.");
      return;
    }

    try {
      console.log('QuickStatusUpdate - Updating status:', { newStatus, userId, familyCode });
      
      // Update status using FamilyContext
      const success = await updateUserStatus(newStatus);
      
      if (success) {
        // Send notification to family members
        if (notificationService && familyMembers?.length > 0) {
          try {
            const statusMessage = `${displayName} updated their status to "${newStatus}"`;
            
            for (const member of familyMembers) {
              if (member.userId !== userId && member.pushToken) {
                await notificationService.sendNotification(
                  member.pushToken,
                  'Family Status Update',
                  statusMessage,
                  {
                    type: 'family_status',
                    userId: userId,
                    status: newStatus,
                    memberName: displayName
                  }
                );
              }
            }
            console.log('QuickStatusUpdate - Family notification sent for quick status update');
          } catch (notificationError) {
            console.error('QuickStatusUpdate - Failed to send family notifications:', notificationError);
          }
        }
        
        Alert.alert("Status Updated", `Your status is now "${newStatus}"`);
        console.log('QuickStatusUpdate - Status updated successfully:', newStatus);
      } else {
        Alert.alert("Error", "Failed to update status. Please try again.");
        console.error('QuickStatusUpdate - Status update failed');
      }
    } catch (err) {
      console.error("QuickStatusUpdate - Error updating status:", err);
      Alert.alert("Error", "Failed to update status. Please try again.");
    }
  };

  // Get status color
  const getStatusColor = () => {
    switch (userStatus) {
      case "I'm Safe":
        return "#4CAF50";
      case "Needs Help":
        return "#F44336";
      case "Evacuated":
        return "#FF9800";
      case "Not Yet Responded":
        return "#9E9E9E";
      case "Unknown":
        return "#757575";
      default:
        return "#9E9E9E";
    }
  };

  return (
    <View style={styles.quickStatusCard}>
      <View style={styles.quickStatusHeader}>
        <Text style={styles.quickStatusTitle}>Quick Status Update</Text>
      </View>
      
      <View style={styles.quickStatusContent}>
        <View style={styles.quickStatusContainer}>
          <TouchableOpacity
            style={[styles.quickStatusButton, { backgroundColor: '#4CAF50' }]}
            onPress={() => updateQuickStatus("I'm Safe")}
            activeOpacity={0.8}
          >
            <Ionicons name="shield-checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.quickStatusText}>I'm Safe</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.quickStatusButton, { backgroundColor: '#F44336' }]}
            onPress={() => updateQuickStatus("Needs Help")}
            activeOpacity={0.8}
          >
            <Ionicons name="alert-circle" size={20} color="#FFFFFF" />
            <Text style={styles.quickStatusText}>Needs Help</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.currentStatusRow}>
          <Text style={styles.currentStatusLabel}>Current Status: </Text>
          <Text style={[styles.currentStatusValue, { color: getStatusColor() }]}>
            {userStatus || "Not Set"}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default QuickStatusUpdate;