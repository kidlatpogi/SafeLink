import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from '@react-native-community/datetimepicker';

const BirthdatePicker = ({ 
  birthdate, 
  showDatePicker, 
  showDatePickerHandler, 
  onDateChange, 
  styles 
}) => {
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <>
      {/* Birthdate */}
      <TouchableOpacity 
        style={[styles.inputWrapper, { marginBottom: 20 }]}
        onPress={showDatePickerHandler}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <View style={[styles.input, { justifyContent: 'center' }]}>
          <Text style={{ 
            color: birthdate ? '#000' : '#666',
            fontSize: 16
          }}>
            {birthdate ? formatDate(birthdate) : 'Select Birthdate'}
          </Text>
        </View>
        <Ionicons
          name="chevron-down-outline"
          size={20}
          color="#666"
          style={{ position: 'absolute', right: 15 }}
        />
      </TouchableOpacity>

      {/* Date Picker */}
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={birthdate}
          mode="date"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
          maximumDate={new Date()} // Prevent future dates
          minimumDate={new Date(1900, 0, 1)} // Reasonable minimum date
        />
      )}
    </>
  );
};

export default BirthdatePicker;