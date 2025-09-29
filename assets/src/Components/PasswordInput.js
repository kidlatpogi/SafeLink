import React from "react";
import { View, TextInput, TouchableOpacity, Text, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from '../Styles/Create_Account.styles';

const PasswordInput = ({ 
  password, 
  setPassword, 
  showPassword, 
  setShowPassword, 
  showPasswordRequirements,
  setShowPasswordRequirements,
  fadeAnim 
}) => {
  return (
    <>
      {/* Password Input */}
      <View style={[styles.inputWrapper, styles.passwordInputWrapper]}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: '#000', paddingRight: 50 }]}
          placeholder="Password"
          placeholderTextColor="#666"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          onFocus={() => setShowPasswordRequirements(true)}
          onBlur={() => setShowPasswordRequirements(false)}
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

      {/* Password Requirements Indicator */}
      {showPasswordRequirements && (
        <Animated.View 
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: 8,
            padding: 12,
            marginBottom: 15,
            borderLeftWidth: 3,
            borderLeftColor: '#17a2b8',
            opacity: fadeAnim
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#495057', marginBottom: 8 }}>
            Password Requirements:
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons 
              name={password.length >= 8 ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={password.length >= 8 ? "#28a745" : "#dc3545"} 
            />
            <Text style={{ 
              fontSize: 11, 
              marginLeft: 6, 
              color: password.length >= 8 ? "#28a745" : "#dc3545" 
            }}>
              At least 8 characters
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons 
              name={/[A-Z]/.test(password) ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={/[A-Z]/.test(password) ? "#28a745" : "#dc3545"} 
            />
            <Text style={{ 
              fontSize: 11, 
              marginLeft: 6, 
              color: /[A-Z]/.test(password) ? "#28a745" : "#dc3545" 
            }}>
              One uppercase letter (A-Z)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <Ionicons 
              name={/[a-z]/.test(password) ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={/[a-z]/.test(password) ? "#28a745" : "#dc3545"} 
            />
            <Text style={{ 
              fontSize: 11, 
              marginLeft: 6, 
              color: /[a-z]/.test(password) ? "#28a745" : "#dc3545" 
            }}>
              One lowercase letter (a-z)
            </Text>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons 
              name={/[0-9]/.test(password) ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={/[0-9]/.test(password) ? "#28a745" : "#dc3545"} 
            />
            <Text style={{ 
              fontSize: 11, 
              marginLeft: 6, 
              color: /[0-9]/.test(password) ? "#28a745" : "#dc3545" 
            }}>
              One number (0-9)
            </Text>
          </View>
        </Animated.View>
      )}
    </>
  );
};

export default PasswordInput;