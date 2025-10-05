import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StatusBar,
  StyleSheet,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import HamburgerMenu from './HamburgerMenu';

const AppHeader = ({ 
  title, 
  navigation, 
  showBackButton = true,
  showHamburger = true,
  icon = null,
  backgroundColor = '#FF6F00',
  statusBarStyle = 'light-content'
}) => {
  // Calculate consistent header height for different devices
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const headerPadding = statusBarHeight + 15;
  
  // Hamburger menu state
  const slideAnim = useRef(new Animated.Value(-280)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [menuVisible, setMenuVisible] = React.useState(false);

  const showMenu = () => {
    setMenuVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <>
      <StatusBar backgroundColor={backgroundColor} barStyle={statusBarStyle} />
      
      {/* Main Header */}
      <View style={[styles.header, { backgroundColor, paddingTop: headerPadding }]}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          {showBackButton ? (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={32} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
          
          {/* Logo and Title */}
          <View style={styles.logoWrapper}>
            <Image source={require('../Images/SafeLink_LOGO.png')} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Safe</Text>
              <Text style={{ color: "#E82222", fontWeight: "bold", fontSize: 18 }}>Link</Text>
            </Text>
          </View>
          
          {/* Hamburger Menu */}
          {showHamburger ? (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={showMenu}
            >
              <Ionicons name="menu" size={32} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>
      </View>

      {/* Title Row with Icon */}
      {title && (
        <View style={styles.titleRow}>
          {icon && <Ionicons name={icon} size={26} color="#FF6F00" />}
          <Text style={styles.title}>{title}</Text>
        </View>
      )}

      {/* Hamburger Menu */}
      {showHamburger && (
        <HamburgerMenu 
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          slideAnim={slideAnim}
          opacityAnim={opacityAnim}
          navigation={navigation}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    minHeight: 60, // Ensure consistent minimum height
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoImage: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    minHeight: 56,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default AppHeader;