import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from '../Styles/Home.styles';

export default function Home({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to SafeLink</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}