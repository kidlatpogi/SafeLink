// Components/AlertRadiusSlider.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AlertRadiusSlider = ({ 
  value = 10, 
  onValueChange, 
  minimumValue = 10, 
  maximumValue = 100, 
  step = 10 
}) => {
  const [sliderValue, setSliderValue] = useState(value);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleDecrease = () => {
    const newValue = Math.max(minimumValue, sliderValue - step);
    setSliderValue(newValue);
    onValueChange(newValue);
  };

  const handleIncrease = () => {
    const newValue = Math.min(maximumValue, sliderValue + step);
    setSliderValue(newValue);
    onValueChange(newValue);
  };

  const formatValue = (val) => {
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}km`;
    }
    return `${val}km`;
  };

  const getProgressPercentage = () => {
    return ((sliderValue - minimumValue) / (maximumValue - minimumValue)) * 100;
  };

  return (
    <View style={sliderStyles.container}>
      <Text style={sliderStyles.label}>Alert Radius</Text>
      
      <View style={sliderStyles.valueContainer}>
        <Text style={sliderStyles.valueText}>{formatValue(sliderValue)}</Text>
      </View>
      
      <View style={sliderStyles.sliderContainer}>
        <TouchableOpacity 
          style={[sliderStyles.button, sliderValue <= minimumValue && sliderStyles.buttonDisabled]}
          onPress={handleDecrease}
          disabled={sliderValue <= minimumValue}
        >
          <Ionicons name="remove" size={20} color={sliderValue <= minimumValue ? "#ccc" : "#FF6F00"} />
        </TouchableOpacity>
        
        <View style={sliderStyles.trackContainer}>
          <View style={sliderStyles.track} />
          <View 
            style={[
              sliderStyles.filledTrack, 
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
          <View 
            style={[
              sliderStyles.thumb,
              { left: `${getProgressPercentage()}%` }
            ]}
          />
        </View>
        
        <TouchableOpacity 
          style={[sliderStyles.button, sliderValue >= maximumValue && sliderStyles.buttonDisabled]}
          onPress={handleIncrease}
          disabled={sliderValue >= maximumValue}
        >
          <Ionicons name="add" size={20} color={sliderValue >= maximumValue ? "#ccc" : "#FF6F00"} />
        </TouchableOpacity>
      </View>
      
      <View style={sliderStyles.labelsContainer}>
        <Text style={sliderStyles.minMaxLabel}>{formatValue(minimumValue)}</Text>
        <Text style={sliderStyles.minMaxLabel}>{formatValue(maximumValue)}</Text>
      </View>
      
      <View style={sliderStyles.stepsContainer}>
        <Text style={sliderStyles.stepsText}>Adjusts in {step}km increments</Text>
      </View>
    </View>
  );
};

const sliderStyles = StyleSheet.create({
  container: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e1e1',
  },
  valueText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF6F00',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF6F00',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  buttonDisabled: {
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  trackContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    marginHorizontal: 15,
    position: 'relative',
  },
  track: {
    height: 6,
    backgroundColor: '#e1e1e1',
    borderRadius: 3,
  },
  filledTrack: {
    height: 6,
    backgroundColor: '#FF6F00',
    borderRadius: 3,
    position: 'absolute',
  },
  thumb: {
    width: 20,
    height: 20,
    backgroundColor: '#FF6F00',
    borderRadius: 10,
    position: 'absolute',
    top: -7,
    marginLeft: -10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 55,
    marginTop: 5,
  },
  minMaxLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  stepsContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  stepsText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
});

export default AlertRadiusSlider;