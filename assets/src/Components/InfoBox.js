import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const InfoBox = () => {
  return (
    <View style={{
      backgroundColor: '#e3f2fd',
      borderRadius: 8,
      padding: 15,
      marginBottom: 20,
      borderLeftWidth: 4,
      borderLeftColor: '#2196f3'
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name="information-circle" size={20} color="#2196f3" />
        <Text style={{ 
          fontSize: 14, 
          fontWeight: 'bold', 
          color: '#1976d2',
          marginLeft: 8 
        }}>
          Why do we need this information?
        </Text>
      </View>
      <Text style={{ fontSize: 12, color: '#424242', lineHeight: 16 }}>
        • Your name helps us personalize your experience{'\n'}
        • Phone number is used for emergency notifications{'\n'}
        • Address/location is optional but helps during emergencies{'\n'}
        • GPS coordinates enable faster emergency response{'\n'}
        • Birthdate is used for age-appropriate safety information{'\n'}
        • All information is kept secure and private
      </Text>
    </View>
  );
};

export default InfoBox;