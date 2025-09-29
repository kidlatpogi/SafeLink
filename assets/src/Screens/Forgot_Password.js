import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import styles from "../Styles/Forgot_Password.styles";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Forgot_Password({ navigation }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    setMessage("");
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Reset instructions sent! Check your email.");
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0} // tweak this value if needed
    >
      <LinearGradient
        colors={["#eb4b3f", "#f0945b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Kandado (Lock Image + Text) */}
          <View style={styles.logoWrap}>
            <Image
              source={require("../Images/Forgot_Password_LOGO.webp")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.forgot}>
              Forgot <Text style={styles.password}>Password?</Text>
            </Text>
            <Text style={styles.instructions}>
              No worries, we’ll send you reset instructions
            </Text>
          </View>

          {/* White Panel */}
          <View style={styles.whitePanel}>
            {/* Email Field */}
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="alternate-email"
                size={20}
                color="#2b524a"
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Button */}
            <TouchableOpacity style={styles.Btn} onPress={handleResetPassword}>
              <Text style={styles.BtnText}>Reset Password</Text>
            </TouchableOpacity>
            {message ? (
              <Text style={{ color: "red", textAlign: "center" }}>{message}</Text>
            ) : null}

            {/* Back to Login */}
            <TouchableOpacity 
              onPress={() => navigation.navigate("Login")}
              style={styles.backButton}
            >
              <Ionicons 
                name="arrow-back" 
                size={20} 
                color="#2b524a" 
              />
              <Text style={styles.backText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}