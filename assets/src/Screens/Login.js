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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

import styles from '../Styles/Login.styles';

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

          {/* Logo tapos yung Bilog */}
          <View style={styles.logoWrap}>
            <LinearGradient
              colors={["rgba(169,199,195,0.5)", "rgba(76,132,121,0.5)"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.logoCircle}
            >
              <Image
                source={require('../Images/SafeLink_LOGO.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </LinearGradient>
            <Text style={styles.title}>
              Safe<Text style={styles.linkText}>Link</Text>
            </Text>
          </View>

          {/* Text FIelds */}
          <View style={styles.form}>

            {/* Start ng Email */}
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="alternate-email"
                size={20}
                color="#fff"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: '#fff' }]}
                placeholder="Email Address"
                placeholderTextColor="#fff"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>
			{/* End ng Email */}

			{/* Start ng Password */}
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#fff"
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, { color: '#fff' }]}
                placeholder="Password"
                placeholderTextColor="#fff"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
			{/* End ng Password */}

          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* White Panel */}
      <View style={styles.whitePanel}>

		{/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Login Button */}
        <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.BtnText}>Login</Text>
        </TouchableOpacity>

        {/* Divider (or na TXT) */}
        <Text style={styles.orText}>or</Text>

		{/* Create Account Button */}
        <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('CreateAccount')}>
          <Text style={styles.BtnText}>Create Account</Text>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}