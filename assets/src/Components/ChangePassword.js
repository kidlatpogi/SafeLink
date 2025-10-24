import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { auth } from '../firebaseConfig';
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

const ChangePassword = ({ visible, onClose, styles }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validatePassword = (password) => {
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
    if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
    if (!/[0-9]/.test(password)) return "Password must contain at least one number";
    return null;
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert("Error", "Please enter your current password");
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter a new password");
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert("Error", "Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      Alert.alert("Invalid Password", passwordError);
      return;
    }

    try {
      setIsLoading(true);
      const user = auth.currentUser;

      if (!user || !user.email) {
        Alert.alert("Error", "Unable to identify user. Please try logging in again.");
        return;
      }

      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert(
        "Success",
        "Your password has been changed successfully.",
        [
          {
            text: "OK",
            onPress: () => {
              // Clear form and close modal
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
              onClose();
            }
          }
        ]
      );

    } catch (error) {
      console.error("Password change error:", error);

      let errorMessage = "Failed to change password. Please try again.";

      if (error.code === 'auth/wrong-password') {
        errorMessage = "Current password is incorrect.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "New password is too weak.";
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = "Please log out and log back in before changing your password.";
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPasswordInput = (
    value,
    setValue,
    placeholder,
    showPassword,
    setShowPassword
  ) => (
    <View style={[styles.inputWrapper, styles.passwordInputWrapper]}>
      <Ionicons
        name="lock-closed-outline"
        size={20}
        color="#666"
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, { color: '#000', paddingRight: 50 }]}
        placeholder={placeholder}
        placeholderTextColor="#666"
        value={value}
        onChangeText={setValue}
        secureTextEntry={!showPassword}
      />
      <TouchableOpacity
        style={{
          position: 'absolute',
          right: 15,
          top: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          width: 30,
        }}
        onPress={() => setShowPassword(!showPassword)}
      >
        <Ionicons
          name={showPassword ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 20,
          width: '90%',
          maxWidth: 400,
          maxHeight: '80%',
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#333',
            }}>
              Change Password
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Current Password */}
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
          }}>
            Current Password
          </Text>
          {renderPasswordInput(
            currentPassword,
            setCurrentPassword,
            "Enter current password",
            showCurrentPassword,
            setShowCurrentPassword
          )}

          {/* New Password */}
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
            marginTop: 15,
          }}>
            New Password
          </Text>
          {renderPasswordInput(
            newPassword,
            setNewPassword,
            "Enter new password",
            showNewPassword,
            setShowNewPassword
          )}

          {/* Confirm New Password */}
          <Text style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#333',
            marginBottom: 8,
            marginTop: 15,
          }}>
            Confirm New Password
          </Text>
          {renderPasswordInput(
            confirmPassword,
            setConfirmPassword,
            "Confirm new password",
            showConfirmPassword,
            setShowConfirmPassword
          )}

          {/* Password Requirements */}
          <View style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: 12,
            marginTop: 15,
            marginBottom: 20,
            borderLeftWidth: 3,
            borderLeftColor: '#17a2b8',
          }}>
            <Text style={{
              fontSize: 12,
              fontWeight: 'bold',
              color: '#495057',
              marginBottom: 8
            }}>
              Password Requirements:
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name={newPassword.length >= 8 ? "checkmark-circle" : "close-circle"}
                size={16}
                color={newPassword.length >= 8 ? "#28a745" : "#dc3545"}
              />
              <Text style={{
                fontSize: 11,
                marginLeft: 6,
                color: newPassword.length >= 8 ? "#28a745" : "#dc3545"
              }}>
                At least 8 characters
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name={/[A-Z]/.test(newPassword) ? "checkmark-circle" : "close-circle"}
                size={16}
                color={/[A-Z]/.test(newPassword) ? "#28a745" : "#dc3545"}
              />
              <Text style={{
                fontSize: 11,
                marginLeft: 6,
                color: /[A-Z]/.test(newPassword) ? "#28a745" : "#dc3545"
              }}>
                One uppercase letter (A-Z)
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <Ionicons
                name={/[a-z]/.test(newPassword) ? "checkmark-circle" : "close-circle"}
                size={16}
                color={/[a-z]/.test(newPassword) ? "#28a745" : "#dc3545"}
              />
              <Text style={{
                fontSize: 11,
                marginLeft: 6,
                color: /[a-z]/.test(newPassword) ? "#28a745" : "#dc3545"
              }}>
                One lowercase letter (a-z)
              </Text>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons
                name={/[0-9]/.test(newPassword) ? "checkmark-circle" : "close-circle"}
                size={16}
                color={/[0-9]/.test(newPassword) ? "#28a745" : "#dc3545"}
              />
              <Text style={{
                fontSize: 11,
                marginLeft: 6,
                color: /[0-9]/.test(newPassword) ? "#28a745" : "#dc3545"
              }}>
                One number (0-9)
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
          }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: '#6c757d',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: isLoading ? '#6c757d' : '#FF6B6B',
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={{
                color: '#fff',
                fontSize: 16,
                fontWeight: '600',
              }}>
                {isLoading ? 'Changing...' : 'Change Password'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ChangePassword;