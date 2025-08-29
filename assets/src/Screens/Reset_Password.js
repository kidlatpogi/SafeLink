import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

import styles from '../Styles/Reset_Password.styles';

export default function Reset_Password({ navigation }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (

    // Gradient Background
    <LinearGradient
      colors={["#eb4b3f", "#f0945b"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>

          {/* kandado */}
          <View style={styles.logoWrap}>
            <Image
              source={require('../Images/Forgot_Password_LOGO.webp')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.title}>
              New <Text style={styles.subtitle}>Password</Text>
            </Text>
          </View>

          {/* New Password Field */}
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color="#bed2d0"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#bed2d0"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputWrapper}>
            <MaterialIcons
              name="lock-outline"
              size={20}
              color="#bed2d0"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#bed2d0"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>

          {/* Confirm Button */}
          <TouchableOpacity style={styles.Btn}>
            <Text style={styles.BtnText}>Confirm Password</Text>
          </TouchableOpacity>

          {/* Back to Login */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.backToLogin}>↩ Back to Login</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}