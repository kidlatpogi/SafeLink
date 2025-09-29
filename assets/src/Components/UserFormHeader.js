import React from "react";
import { View, Text, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const UserFormHeader = ({ isEditMode }) => {
  return (
    <LinearGradient
      colors={["#eb4b3f", "#f0945b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 30,
        paddingHorizontal: 20,
      }}
    >
      <Text style={{
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 10,
      }}>
        {isEditMode ? "Edit Profile" : "Complete Your Profile"}
      </Text>
      <Text style={{
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        opacity: 0.9,
      }}>
        {isEditMode ? "Update your personal information" : "Help us personalize your SafeLink experience"}
      </Text>
    </LinearGradient>
  );
};

export default UserFormHeader;