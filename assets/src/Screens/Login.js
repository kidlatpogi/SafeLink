import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Svg, Path } from "react-native-svg";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import extracted components
import { useGoogleAuthHandler } from '../Components/LoginComponents/GoogleAuthHandler';
import { handleEmailLogin } from '../Components/LoginComponents/LoginFormHandler';

import styles from '../Styles/Login.styles';

// Google Logo Component (Original SVG-based with proper Google colors)
const GoogleLogo = ({ size = 20 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <Path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <Path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <Path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </Svg>
);

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [lastResendTime, setLastResendTime] = useState(null);
  const [hasUnverifiedEmail, setHasUnverifiedEmail] = useState(false);

  // Use Google auth handler hook
  const { handleGoogleSignIn } = useGoogleAuthHandler(navigation, setError);

  // Handle email/password login
  const handleLogin = async () => {
    setError("");
    await handleEmailLogin(
      email,
      password,
      resendAttempts,
      lastResendTime,
      setResendAttempts,
      setLastResendTime,
      setHasUnverifiedEmail,
      setIsLoading,
      navigation
    );
  };

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
        <ScrollView 
          contentContainerStyle={{ 
            flexGrow: 1, 
            justifyContent: 'center',
            paddingBottom: 150
          }}
        >

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
                onChangeText={(text) => {
                  setEmail(text);
                  // Reset unverified email state when email changes
                  if (hasUnverifiedEmail) {
                    setHasUnverifiedEmail(false);
                  }
                }}
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
                style={[styles.input, { color: '#fff', paddingRight: 50 }]}
                placeholder="Password"
                placeholderTextColor="#fff"
                value={password}
                onChangeText={setPassword}
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
                  color="#fff"
                />
              </TouchableOpacity>
            </View>
			{/* End ng Password */}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* White Panel */}
      <View style={styles.whitePanel}>

        {/* Error Message */}
        {error && error.trim() && (
          <Text style={{ color: 'red', textAlign: 'center', marginBottom: 15 }}>
            {String(error)}
          </Text>
        )}

        {/* Login Button */}
        <TouchableOpacity style={styles.Btn} onPress={handleLogin}>
          <Text style={styles.BtnText}>Login</Text>
        </TouchableOpacity>

        {/* Forgot Password */}
        <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={{ marginTop: 5, marginBottom: 8 }}>
          <Text style={[styles.forgotText, { marginBottom: 0 }]}>Forgot Password?</Text>
        </TouchableOpacity>

        {/* Conditional Resend Verification Email */}
        {email.trim() && hasUnverifiedEmail && (
          <TouchableOpacity 
            onPress={async () => {
              try {
                // Temporarily sign in to send verification email
                const userCredential = await signInWithEmailAndPassword(auth, email, password || "dummy");
                
                if (userCredential.user.emailVerified) {
                  Alert.alert("Already Verified", "Your email is already verified. You can log in normally.");
                  await auth.signOut();
                  setHasUnverifiedEmail(false); // Hide the button since email is verified
                  return;
                }
                
                await sendEmailVerification(userCredential.user);
                await auth.signOut();
                
                // Update resend tracking
                setResendAttempts(prev => prev + 1);
                setLastResendTime(Date.now());
                
                Alert.alert("Verification Sent", "We've sent a verification email to your inbox. Please check your email.");
              } catch (error) {
                if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                  Alert.alert("Cannot Send", "Please enter the correct password first, then try resending verification email.");
                } else {
                  Alert.alert("Error", "Failed to send verification email. Please try again.");
                }
              }
            }}
            style={{ marginBottom: 8 }}
          >
            <Text style={[styles.forgotText, { fontSize: 12, opacity: 0.8, marginBottom: 0 }]}>
              Resend Verification Email
            </Text>
          </TouchableOpacity>
        )}

        {/* Divider (or na TXT) */}
        <Text style={styles.orText}>or</Text>

        {/* Create Account Button */}
        <TouchableOpacity style={styles.Btn} onPress={() => navigation.navigate('CreateAccount')}>
          <Text style={styles.BtnText}>Create Account</Text>
        </TouchableOpacity>

        {/* Google Sign-In Button */}
        <TouchableOpacity
          style={[styles.GoogleBtn, { opacity: isLoading ? 0.5 : 1 }]}
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        >
          <GoogleLogo size={20} />
          <Text style={styles.GoogleBtnText}>
            Continue with Google
          </Text>
        </TouchableOpacity>

      </View>
    </LinearGradient>
  );
}