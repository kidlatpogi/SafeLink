import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from '../Styles/Home.styles.new';
import Logo from "../Images/SafeLink_LOGO.png";

const HomeHeader = ({ showMenu }) => {
  return (
    <View style={styles.header}>
      <View style={styles.logoWrapper}>
        <Image source={Logo} style={styles.logoImage} />
        <Text style={styles.logo}>
          <Text style={styles.logoTextWhite}>Safe</Text>
          <Text style={styles.logoTextRed}>Link</Text>
        </Text>
      </View>
      <View style={styles.headerIcons}>
        {/* Hamburger Menu */}
        <TouchableOpacity onPress={showMenu}>
          <Ionicons name="menu" size={32} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeHeader;