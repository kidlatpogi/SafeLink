import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from '../Styles/Create_Account.styles';

const TermsCheckbox = ({ agree, setAgree, navigation }) => {
  return (
    <View style={styles.checkboxRow}>
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
        I agree to the{" "}
        <Text
          style={styles.termsLink}
          onPress={() => navigation.navigate("TermsPrivacy")}
        >
          Terms & Privacy
        </Text>
      </Text>
    </View>
  );
};

export default TermsCheckbox;