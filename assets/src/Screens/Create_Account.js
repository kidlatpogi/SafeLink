import React, { useState, useRef, useEffect } from "react";

// Import components
import CreateAccountHeader from '../Components/CreateAccountHeader';
import EmailInput from '../Components/EmailInput';
import PasswordInput from '../Components/PasswordInput';
import RetypePasswordInput from '../Components/RetypePasswordInput';
import TermsCheckbox from '../Components/TermsCheckbox';
import CreateAccountFooter from '../Components/CreateAccountFooter';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Animated,
  Keyboard,
  Alert,
} from "react-native";

import styles from "../Styles/Create_Account.styles";

// Firebase imports
import { auth, GOOGLE_CLIENT_IDS } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  sendEmailVerification,
} from "firebase/auth";

// Import signInWithPopup only for web
import { signInWithPopup } from "firebase/auth";

// Expo Auth Session for Google login
import * as Google from "expo-auth-session/providers/google";
import * as AuthSession from "expo-auth-session";

// ✅ Import KeyboardAwareScrollView
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Create_Account({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRetypePassword, setShowRetypePassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animated header
  const headerHeight = useRef(new Animated.Value(240)).current;
  const headerTextSize = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => {
        Animated.parallel([
          Animated.timing(headerHeight, {
            toValue: 100,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(headerTextSize, {
            toValue: 20,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => {
        Animated.parallel([
          Animated.timing(headerHeight, {
            toValue: 240,
            duration: 250,
            useNativeDriver: false,
          }),
          Animated.timing(headerTextSize, {
            toValue: 32,
            duration: 250,
            useNativeDriver: false,
          }),
        ]).start();
      }
    );
    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, [headerHeight, headerTextSize]);

  // Google OAuth configuration
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'safelink',
    path: 'redirect',
  });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: Platform.select({
      android: GOOGLE_CLIENT_IDS?.android || "947195980810-k4fso2tuih6ea7j5vfm1f72s8j5idcsl.apps.googleusercontent.com",
      ios: GOOGLE_CLIENT_IDS?.ios || "947195980810-iqn4dberfu733cuk9332aitc1ren96hl.apps.googleusercontent.com", 
      web: GOOGLE_CLIENT_IDS?.web || "947195980810-trgaoi6be6k2cva2vjc442n6lr6erlon.apps.googleusercontent.com",
    }),
    redirectUri,
  });

  // Handle Google login response
  useEffect(() => {
    if (response?.type === "success") {
      (async () => {
        try {
          const { id_token, access_token } = response.params;
          
          if (!id_token) {
            console.error("No id_token in response:", response.params);
            setError("Google authentication failed. Please try again.");
            return;
          }
          
          const credential = GoogleAuthProvider.credential(id_token, access_token);
          await signInWithCredential(auth, credential);
          console.log("User logged in via Google OAuth");
          navigation.reset({
            index: 0,
            routes: [{ name: "User_Form" }], // New Google users go to User_Form
          });
        } catch (err) {
          setError("Google login failed. Please try again.");
        }
      })();
    } else if (response?.type === "error") {
      setError("Google authentication was cancelled or failed.");
    }
  }, [response, navigation]);

  // Fade error animation
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: error ? 1 : 0,
      duration: 300,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, [error]);

  // Password validation function
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  };

  // Email/password signup with email verification
  const handleCreateAccount = async () => {
    if (!email || !password || !retypePassword) {
      Alert.alert("Error", "All fields are required");
      return;
    }

    if (!agree) {
      Alert.alert("Error", "Please agree to the Terms & Privacy");
      return;
    }

    if (password !== retypePassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert("Invalid Password", passwordValidation.errors.join('\n'));
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("Account created successfully:", user.uid);
      
      // Send email verification
      await sendEmailVerification(user, {
        url: 'https://disaster-preparedness-b21f9.firebaseapp.com/', // Your app's URL
        handleCodeInApp: false,
      });
      
      // Sign out the user immediately after account creation and verification email sent
      await auth.signOut();
      
      // Show verification message and navigate to Login
      Alert.alert(
        "Account Created Successfully", 
        `Your account has been created! We've sent a verification email to ${email}. Please check your email and click the verification link before logging in.`,
        [
          {
            text: "OK",
            onPress: () => navigation.navigate("Login")
          }
        ]
      );
    } catch (error) {
      // Handle specific Firebase errors
      let errorMessage = "An error occurred while creating your account.";
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email address is already registered. Please use a different email or try logging in.";
          break;
        case 'auth/invalid-email':
          errorMessage = "Please enter a valid email address.";
          break;
        case 'auth/operation-not-allowed':
          errorMessage = "Email/password accounts are not enabled. Please contact support.";
          break;
        case 'auth/weak-password':
          errorMessage = "The password is too weak. Please choose a stronger password.";
          break;
        case 'auth/network-request-failed':
          errorMessage = "Network error. Please check your internet connection and try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Google login
  const handleGoogleSignIn = async () => {
    setError("");
    if (Platform.OS === "web") {
      try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        navigation.reset({ index: 0, routes: [{ name: "User_Form" }] });
      } catch (err) {
        setError("Google login failed. Please try again.");
      }
    } else {
      promptAsync();
    }
  };

  return (
    <View style={styles.screen}>
      <CreateAccountHeader 
        headerHeight={headerHeight}
        headerTextSize={headerTextSize}
        navigation={navigation}
      />

      {/* ✅ Replaced ScrollView + KeyboardAvoidingView */}
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingVertical: 30 }}
        extraScrollHeight={20} // gives small space above input
        enableOnAndroid={true}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.form}>
          <EmailInput 
            email={email}
            setEmail={setEmail}
            styles={styles}
          />

          <PasswordInput 
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showPasswordRequirements={showPasswordRequirements}
            setShowPasswordRequirements={setShowPasswordRequirements}
            styles={styles}
          />

          <RetypePasswordInput 
            retypePassword={retypePassword}
            setRetypePassword={setRetypePassword}
            showRetypePassword={showRetypePassword}
            setShowRetypePassword={setShowRetypePassword}
            styles={styles}
          />

          <TermsCheckbox 
            agree={agree}
            setAgree={setAgree}
            navigation={navigation}
            styles={styles}
          />

          {/* Error Message */}
          <View
            style={{ minHeight: 25, marginBottom: 10, justifyContent: "center" }}
          >
            {error && (
              <Animated.Text
                style={{ color: "red", textAlign: "center", opacity: fadeAnim }}
              >
                {error}
              </Animated.Text>
            )}
          </View>

          {/* Create Account Button */}
          <TouchableOpacity
            style={[styles.createAccountBtn, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleCreateAccount}
            disabled={isLoading}
          >
            <Text style={styles.createAccountBtnText}>
              {isLoading ? "Creating Account..." : "Create Account"}
            </Text>
          </TouchableOpacity>

          <CreateAccountFooter 
            request={request}
            handleGoogleSignIn={handleGoogleSignIn}
            navigation={navigation}
            styles={styles}
          />
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}