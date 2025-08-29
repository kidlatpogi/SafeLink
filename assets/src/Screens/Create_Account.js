import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import styles from "../Styles/Create_Account.styles";

export default function Create_Account({ navigation }) {
  /**
 $$$$$$\  $$\   $$\  $$$$$$\        $$\      $$\  $$$$$$\   $$$$$$\           $$$$$\ $$\   $$\ $$$$$$$\   $$$$$$\  $$$$$$$$\                   
$$  __$$\ $$$\  $$ |$$  __$$\       $$$\    $$$ |$$  __$$\ $$  __$$\          \__$$ |$$ |  $$ |$$  __$$\ $$  __$$\ $$  _____|                  
$$ /  $$ |$$$$\ $$ |$$ /  \__|      $$$$\  $$$$ |$$ /  $$ |$$ /  \__|            $$ |$$ |  $$ |$$ |  $$ |$$ /  \__|$$ |                        
$$$$$$$$ |$$ $$\$$ |$$ |$$$$\       $$\$$\$$ $$ |$$$$$$$$ |$$ |$$$$\             $$ |$$ |  $$ |$$ |  $$ |$$ |$$$$\ $$$$$\                      
$$  __$$ |$$ \$$$$ |$$ |\_$$ |      $$ \$$$  $$ |$$  __$$ |$$ |\_$$ |      $$\   $$ |$$ |  $$ |$$ |  $$ |$$ |\_$$ |$$  __|                     
$$ |  $$ |$$ |\$$$ |$$ |  $$ |      $$ |\$  /$$ |$$ |  $$ |$$ |  $$ |      $$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |                        
$$ |  $$ |$$ | \$$ |\$$$$$$  |      $$ | \_/ $$ |$$ |  $$ |\$$$$$$  |      \$$$$$$  |\$$$$$$  |$$$$$$$  |\$$$$$$  |$$$$$$$$\                   
\__|  \__|\__|  \__| \______/       \__|     \__|\__|  \__| \______/        \______/  \______/ \_______/  \______/ \________|                  
                                                                                                                                                                                                                                                                                                                                                                                                                                             
$$\   $$\  $$$$$$\         $$$$$$\   $$$$$$\  $$$$$$$\  $$$$$$$$\        $$$$$$\ $$\     $$\                                                   
$$$\  $$ |$$  __$$\       $$  __$$\ $$  __$$\ $$  __$$\ $$  _____|      $$  __$$\\$$\   $$  |                                                  
$$$$\ $$ |$$ /  \__|      $$ /  \__|$$ /  $$ |$$ |  $$ |$$ |            $$ /  $$ |\$$\ $$  /                                                   
$$ $$\$$ |$$ |$$$$\       $$ |      $$ |  $$ |$$ |  $$ |$$$$$\          $$$$$$$$ | \$$$$  /                                                    
$$ \$$$$ |$$ |\_$$ |      $$ |      $$ |  $$ |$$ |  $$ |$$  __|         $$  __$$ |  \$$  /                                                     
$$ |\$$$ |$$ |  $$ |      $$ |  $$\ $$ |  $$ |$$ |  $$ |$$ |            $$ |  $$ |   $$ |                                                      
$$ | \$$ |\$$$$$$  |      \$$$$$$  | $$$$$$  |$$$$$$$  |$$$$$$$$\       $$ |  $$ |   $$ |                                                      
\__|  \__| \______/        \______/  \______/ \_______/ \________|      \__|  \__|   \__|                                                      
                                                                                                                                                                                                                                                                                                                                                                                                                                             
$$\   $$\ $$$$$$\ $$\   $$\ $$$$$$$\  $$$$$$\        $$$$$$\   $$$$$$\  $$\   $$\  $$$$$$\   $$$$$$\ $$$$$$$$\        $$$$$$\   $$$$$$\        
$$ |  $$ |\_$$  _|$$$\  $$ |$$  __$$\ \_$$  _|      $$  __$$\ $$  __$$\ $$$\  $$ |$$  __$$\ $$  __$$\\__$$  __|      $$  __$$\ $$  __$$\       
$$ |  $$ |  $$ |  $$$$\ $$ |$$ |  $$ |  $$ |        $$ /  $$ |$$ /  $$ |$$$$\ $$ |$$ /  \__|$$ /  $$ |  $$ |         $$ /  \__|$$ /  $$ |      
$$$$$$$$ |  $$ |  $$ $$\$$ |$$ |  $$ |  $$ |        $$$$$$$$ |$$$$$$$$ |$$ $$\$$ |$$ |$$$$\ $$$$$$$$ |  $$ |         \$$$$$$\  $$$$$$$$ |      
$$  __$$ |  $$ |  $$ \$$$$ |$$ |  $$ |  $$ |        $$  __$$ |$$  __$$ |$$ \$$$$ |$$ |\_$$ |$$  __$$ |  $$ |          \____$$\ $$  __$$ |      
$$ |  $$ |  $$ |  $$ |\$$$ |$$ |  $$ |  $$ |        $$ |  $$ |$$ |  $$ |$$ |\$$$ |$$ |  $$ |$$ |  $$ |  $$ |         $$\   $$ |$$ |  $$ |      
$$ |  $$ |$$$$$$\ $$ | \$$ |$$$$$$$  |$$$$$$\       $$ |  $$ |$$ |  $$ |$$ | \$$ |\$$$$$$  |$$ |  $$ |  $$ |         \$$$$$$  |$$ |  $$ |      
\__|  \__|\______|\__|  \__|\_______/ \______|      \__|  \__|\__|  \__|\__|  \__| \______/ \__|  \__|  \__|          \______/ \__|  \__|      
                                                                                                                                                                                                    
$$\        $$$$$$\  $$\   $$\  $$$$$$\  $$$$$$\ $$$$$$$$\                                                                                      
$$ |      $$  __$$\ $$$\  $$ |$$  __$$\ \_$$  _|\__$$  __|                                                                                     
$$ |      $$ /  $$ |$$$$\ $$ |$$ /  \__|  $$ |     $$ |                                                                                        
$$ |      $$$$$$$$ |$$ $$\$$ |$$ |$$$$\   $$ |     $$ |                                                                                        
$$ |      $$  __$$ |$$ \$$$$ |$$ |\_$$ |  $$ |     $$ |                                                                                        
$$ |      $$ |  $$ |$$ |\$$$ |$$ |  $$ |  $$ |     $$ |                                                                                        
$$$$$$$$\ $$ |  $$ |$$ | \$$ |\$$$$$$  |$$$$$$\    $$ |                                                                                        
\________|\__|  \__|\__|  \__| \______/ \______|   \__|         */

  /*
 $$$$$$\ $$\     $$\ $$$$$$\     $$$$$$\   $$\   $$\
$$  __$$\\$$\   $$ | $$  __$$\  $$  __$$\  $$\   $$ |
$$ /  \__ \$$\ $$ /  $$ /  $$ | $$ /  $$ | $$\   $$ |
\$$$$$$\   \$$$$ /   $$$$$$$  | $$$$$$$$ | $$\   $$ |
 \____$$ |   $$ |    $$  __$$<  $$  __$$ | $$\   $$ |
$$\   $$ |   $$ |    $$ |  $$ | $$ |  $$ | $$\   $$ |
\$$$$$$      $$ |    $$$$$$$  | $$ |  $$ | \$$$$$$  |
 \______/    \__|    \_______/  \__|  \__|  \______/

*/

  // Variables brah
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [retypePassword, setRetypePassword] = useState("");
  const [agree, setAgree] = useState(false);

  return (
    <View
      style={styles.screen}
      {...(Platform.OS === "web" ? { className: "create-screen" } : {})}
    >
      {/* Header Gradient */}
      <LinearGradient
        colors={["#eb4b3f", "#f0945b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
        {...(Platform.OS === "web" ? { className: "create-header" } : {})}
      >
        {/* Lets Create your Account Text to bro */}
        <Text style={styles.headerText1}>Let's</Text>
        <Text style={styles.headerText2}>Create Your Account</Text>

        <TouchableOpacity style={styles.closeBtn}>
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
      {/* End ng Gradient */}

      {/* Text Fields */}
      <View
        style={styles.form}
        {...(Platform.OS === "web" ? { className: "create-form" } : {})}
      >
        {/* Start ng Email Address */}
        <View
          style={[styles.inputWrapper, styles.emailInputWrapper]}
          {...(Platform.OS === "web"
            ? { className: "input-wrapper email-input-wrapper" }
            : {})}
        >
          <MaterialIcons
            name="alternate-email"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
        </View>
        {/* Syempre ito yung END */}

        {/* Start ng Password */}
        <View
          style={styles.inputWrapper}
          {...(Platform.OS === "web" ? { className: "input-wrapper" } : {})}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {/* End ng Password */}

        {/* Start ng Retype Password */}
        <View
          style={styles.inputWrapper}
          {...(Platform.OS === "web" ? { className: "input-wrapper" } : {})}
        >
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="#666"
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Retype Password"
            placeholderTextColor="#666"
            value={retypePassword}
            onChangeText={setRetypePassword}
            secureTextEntry
          />
        </View>
        {/* End ng Retype Password */}

        {/* Start ng Checkbox */}
        <View
          style={styles.checkboxRow}
          {...(Platform.OS === "web" ? { className: "checkbox-row" } : {})}
        >
          <TouchableOpacity
            style={styles.checkbox}
            onPress={() => setAgree(!agree)}
          >
            <Ionicons
              name={agree ? "checkbox" : "square-outline"}
              size={20}
              color={agree ? "#eb4b3f" : "#666"}
            />
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>Terms & Privacy</Text>
          </Text>
        </View>
        {/* End ng Checkbox */}

        {/* Create Account Button */}
        <TouchableOpacity
          style={styles.createAccountBtn}
          {...(Platform.OS === "web" ? { className: "signup-btn" } : {})}
        >
          <Text style={styles.createAccountBtnText}>Create Account</Text>
        </TouchableOpacity>

        {/* Have an Account Hyperlink */}
        <Text
          style={styles.signinText}
          {...(Platform.OS === "web" ? { className: "signin-text" } : {})}
        >
          Have an account?{" "}
          <Text
            style={styles.signinLink}
            onPress={() => navigation && navigation.navigate("Login")}
          >
            LogIn
          </Text>
        </Text>
      </View>
    </View>
  );
}
