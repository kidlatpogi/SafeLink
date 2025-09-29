import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from '../Styles/Create_Account.styles';

const RetypePasswordInput = ({ 
  retypePassword, 
  setRetypePassword, 
  showRetypePassword, 
  setShowRetypePassword 
}) => {
  return (
    <View style={[styles.inputWrapper, styles.retypePasswordInputWrapper]}>
      <Ionicons
        name="lock-closed-outline"
        size={20}
        color="#666"
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, { color: '#000', paddingRight: 50 }]}
        placeholder="Retype Password"
        placeholderTextColor="#666"
        value={retypePassword}
        onChangeText={setRetypePassword}
        secureTextEntry={!showRetypePassword}
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
        onPress={() => setShowRetypePassword(!showRetypePassword)}
      >
        <Ionicons
          name={showRetypePassword ? "eye-off-outline" : "eye-outline"}
          size={20}
          color="#666"
        />
      </TouchableOpacity>
    </View>
  );
};

export default RetypePasswordInput;