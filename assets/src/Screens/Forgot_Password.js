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

import styles from '../Styles/Forgot_Password.styles';

export default function Forgot_Password({ navigation }) {
  const [email, setEmail] = useState("");

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
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>

          {/* Kandado */}
          <View style={styles.logoWrap}>

            {/* Image ng Kandado */}
            <Image
              source={require('../Images/Forgot_Password_LOGO.webp')}
              style={styles.logo}
              resizeMode="contain"
            />

            {/* Forgot Password */}
            <Text style={styles.forgot}>
              Forgot <Text style={styles.password}>Password?</Text>
            </Text>

            {/* No worries et al */}
            <Text style={styles.instructions}>
              No worries, we’ll send you reset instructions
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

    {/* White Panel */}
      <View style={styles.whitePanel}>

        {/* Email Field LAMAW */}
        <View style={styles.inputWrapper}>
          <MaterialIcons
            name="alternate-email"
            size={20}
            color="#bed2d0"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#bed2d0"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>

    {/* Button to Reset Password */}
        <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.BtnText}>Reset Password</Text>
        </TouchableOpacity>

    {/* Back to friends */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.forgotText}>↩ Back to Login</Text>
        </TouchableOpacity>
        
      </View>
    </LinearGradient>
  );
}