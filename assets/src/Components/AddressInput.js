import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const AddressInput = ({ 
  address, 
  setAddress, 
  styles 
}) => {
  return (
    <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
      <Ionicons
        name="location-outline"
        size={20}
        color="#666"
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholder="Address"
        placeholderTextColor="#666"
        value={address}
        onChangeText={setAddress}
        autoCapitalize="words"
      />
    </View>
  );
};

export default AddressInput;