import React from "react";
import { View, Text, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import styles from '../Styles/Create_Account.styles';

const CreateAccountHeader = ({ headerHeight, headerTextSize, navigation }) => {
  return (
    <Animated.View style={{ height: headerHeight }}>
      <LinearGradient
        colors={["#eb4b3f", "#f0945b"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { flex: 1 }]}
      >
        <Animated.Text style={[styles.headerText1, { fontSize: headerTextSize }]}>
          Let's
        </Animated.Text>
        <Animated.Text style={[styles.headerText2, { fontSize: headerTextSize }]}>
          Create Your Account
        </Animated.Text>
        <TouchableOpacity
          style={styles.closeBtn}
          onPress={() => navigation && navigation.goBack()}
        >
          <Ionicons name="close" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default CreateAccountHeader;