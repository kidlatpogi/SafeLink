import React from "react";
import { View, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import styles from '../Styles/Create_Account.styles';

const EmailInput = ({ email, setEmail }) => {
  return (
    <View style={[styles.inputWrapper, styles.emailInputWrapper]}>
      <MaterialIcons
        name="alternate-email"
        size={20}
        color="#666"
        style={styles.inputIcon}
      />
      <TextInput
        style={[styles.input, { color: '#000' }]}
        placeholder="Email Address"
        placeholderTextColor="#666"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
};

export default EmailInput;