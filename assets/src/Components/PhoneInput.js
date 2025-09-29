import React from "react";
import { View, TextInput } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const PhoneInput = ({ 
  phoneNumber, 
  handlePhoneNumberChange, 
  styles 
}) => {
  return (
    <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
      <MaterialIcons
        name="phone"
        size={20}
        color="#666"
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="09123456789"
        placeholderTextColor="#666"
        value={phoneNumber}
        onChangeText={handlePhoneNumberChange}
        keyboardType="phone-pad"
        maxLength={11}
      />
    </View>
  );
};

export default PhoneInput;