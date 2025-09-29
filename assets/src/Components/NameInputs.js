import React from "react";
import { View, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const NameInputs = ({ 
  firstName, 
  setFirstName, 
  lastName, 
  setLastName, 
  styles 
}) => {
  return (
    <>
      {/* First Name */}
      <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="First Name"
          placeholderTextColor="#666"
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
      </View>

      {/* Last Name */}
      <View style={[styles.inputWrapper, { marginBottom: 20 }]}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Last Name"
          placeholderTextColor="#666"
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
      </View>
    </>
  );
};

export default NameInputs;