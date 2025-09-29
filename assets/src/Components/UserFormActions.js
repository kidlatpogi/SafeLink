import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

const UserFormActions = ({ 
  error, 
  isLoading, 
  handleSaveProfile, 
  isEditMode, 
  navigation, 
  styles 
}) => {
  return (
    <>
      {/* Error Message */}
      {error && (
        <View style={{ marginBottom: 15 }}>
          <Text style={{ color: 'red', textAlign: 'center', fontSize: 14 }}>
            {error}
          </Text>
        </View>
      )}

      {/* Save Profile Button */}
      <TouchableOpacity
        style={[
          styles.createAccountBtn,
          { 
            opacity: isLoading ? 0.7 : 1,
            marginBottom: 20
          }
        ]}
        onPress={handleSaveProfile}
        disabled={isLoading}
      >
        <Text style={styles.createAccountBtnText}>
          {isLoading ? "Saving..." : (isEditMode ? "Update Profile" : "Complete Profile")}
        </Text>
      </TouchableOpacity>

      {/* Skip/Cancel Option */}
      <TouchableOpacity
        style={{
          alignItems: 'center',
          paddingVertical: 15,
        }}
        onPress={() => {
          if (isEditMode) {
            navigation.goBack(); // Go back to Home if editing
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            }); // Reset navigation if first-time setup
          }
        }}
      >
        <Text style={{
          color: '#666',
          fontSize: 14,
          textDecorationLine: 'underline'
        }}>
          {isEditMode ? "Cancel" : "Skip for now"}
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default UserFormActions;