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
  title = "SafeLink", 
  navigation, 
  showBack = true,
  showHamburger = true,
  showLogo = false,
  icon = null,
  backgroundColor = '#FF6F00',
  statusBarStyle = 'light-content'
}) => {
  // Calculate consistent but reasonable header height
  const statusBarHeight = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;
  const headerPaddingTop = statusBarHeight + 10; // Reduced padding for smaller header
  
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
      
      {/* Single Consolidated Header */}
      <View style={[styles.header, { backgroundColor, paddingTop: headerPaddingTop }]}>
        <View style={styles.headerContent}>
          {/* Back Button */}
          {showBack ? (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => {
                if (navigation && navigation.goBack) {
                  navigation.goBack();
                } else {
                  console.warn('AppHeader: navigation prop is missing or invalid');
                }
              }}
            >
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
          
          {/* Title with Optional Icon or Logo */}
          <View style={styles.titleWrapper}>
            {showLogo ? (
              <>
                <Image source={require('../Images/SafeLink_LOGO.png')} style={styles.logoImage} />
                <Text style={styles.logoText}>
                  <Text style={{ color: "white", fontWeight: "bold" }}>Safe</Text>
                  <Text style={{ color: "#E82222", fontWeight: "bold" }}>Link</Text>
                </Text>
              </>
            ) : (
              <>
                {icon && <Ionicons name={icon} size={22} color="white" style={styles.titleIcon} />}
                <Text style={styles.headerTitle}>{title}</Text>
              </>
            )}
          </View>
          
          {/* Hamburger Menu */}
          {showHamburger ? (
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={showMenu}
            >
              <Ionicons name="menu" size={26} color="white" />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerButton} />
          )}
        </View>
      </View>

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
    paddingBottom: 15,
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
    paddingVertical: 8,
    minHeight: 50, // Reduced minimum height for smaller header
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  titleIcon: {
    marginRight: 8,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    textAlign: 'center',
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});

export default AppHeader;