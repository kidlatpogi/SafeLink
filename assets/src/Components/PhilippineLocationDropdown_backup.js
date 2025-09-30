import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import {
  getProvinces,
  getCities,
  getBarangays,
  searchProvinces,
  searchCities,
  searchBarangays,
  findProvinceByName,
  findCityByName,
} from './PhilippineLocationData';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { getProvinces, getCities, getBarangays } from './PhilippineLocationData';

const PhilippineLocationDropdown = ({ 
  onLocationChange, 
  initialProvince = '', 
  initialCity = '', 
  initialBarangay = '',
  coordinates = null 
}) => {
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBarangay, setSelectedBarangay] = useState(initialBarangay);
  
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [barangayModalVisible, setBarangayModalVisible] = useState(false);
  
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [barangaySearch, setBarangaySearch] = useState('');
  
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  
  // Data states
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  
  // Filtered data states
  const [filteredProvinces, setFilteredProvinces] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredBarangays, setFilteredBarangays] = useState([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    barangays: false,
  });

  // Load provinces on component mount
  useEffect(() => {
    loadProvinces();
  }, []);

  // Load cities when province changes
  useEffect(() => {
    if (selectedProvince) {
      loadCities(selectedProvince);
    } else {
      setCities([]);
      setFilteredCities([]);
    }
  }, [selectedProvince]);

  // Load barangays when city changes
  useEffect(() => {
    if (selectedCity) {
      loadBarangays(selectedCity);
    } else {
      setBarangays([]);
      setFilteredBarangays([]);
    }
  }, [selectedCity]);

  // Filter provinces when search changes
  useEffect(() => {
    filterProvinces();
  }, [provinceSearch, provinces]);

  // Filter cities when search changes
  useEffect(() => {
    filterCities();
  }, [citySearch, cities]);

  // Filter barangays when search changes
  useEffect(() => {
    filterBarangays();
  }, [barangaySearch, barangays]);

  const loadProvinces = async () => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const provincesData = await getProvinces();
      setProvinces(provincesData);
      setFilteredProvinces(provincesData);
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async (province) => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      // Find province object if it's just a string
      const provinceObj = typeof province === 'string' 
        ? provinces.find(p => p.name === province)
        : province;
      
      if (provinceObj?.code) {
        const citiesData = await getCities(provinceObj.code);
        setCities(citiesData);
        setFilteredCities(citiesData);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const loadBarangays = async (city) => {
    setLoading(prev => ({ ...prev, barangays: true }));
    try {
      // Find city object if it's just a string
      const cityObj = typeof city === 'string' 
        ? cities.find(c => c.name === city)
        : city;
      
      if (cityObj?.code) {
        const barangaysData = await getBarangays(cityObj.code);
        setBarangays(barangaysData);
        setFilteredBarangays(barangaysData);
      }
    } catch (error) {
      console.error('Error loading barangays:', error);
    } finally {
      setLoading(prev => ({ ...prev, barangays: false }));
    }
  };

  const filterProvinces = async () => {
    if (provinceSearch.trim()) {
      try {
        const filtered = await searchProvinces(provinceSearch);
        setFilteredProvinces(filtered);
      } catch (error) {
        console.error('Error filtering provinces:', error);
        setFilteredProvinces(provinces);
      }
    } else {
      setFilteredProvinces(provinces);
    }
  };

  const filterCities = async () => {
    if (citySearch.trim()) {
      try {
        const provinceObj = typeof selectedProvince === 'string' 
          ? provinces.find(p => p.name === selectedProvince)
          : selectedProvince;
        
        if (provinceObj?.code) {
          const filtered = await searchCities(provinceObj.code, citySearch);
          setFilteredCities(filtered);
        }
      } catch (error) {
        console.error('Error filtering cities:', error);
        setFilteredCities(cities);
      }
    } else {
      setFilteredCities(cities);
    }
  };

  const filterBarangays = async () => {
    if (barangaySearch.trim()) {
      try {
        const cityObj = typeof selectedCity === 'string' 
          ? cities.find(c => c.name === selectedCity)
          : selectedCity;
        
        if (cityObj?.code) {
          const filtered = await searchBarangays(cityObj.code, barangaySearch);
          setFilteredBarangays(filtered);
        }
      } catch (error) {
        console.error('Error filtering barangays:', error);
        setFilteredBarangays(barangays);
      }
    } else {
      setFilteredBarangays(barangays);
    }
  };

  // Auto-fill from coordinates
  const autoFillFromCoordinates = async () => {
    if (!coordinates) {
      Alert.alert('Location Required', 'Please set your location first to use auto-fill.');
      return;
    }

    setIsAutoFilling(true);
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync(coordinates);
      
      if (reverseGeocode && reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        
        // Extract location details
        const provinceName = location.region || '';
        const cityName = location.city || location.subregion || '';
        const barangayName = location.district || 'Poblacion';

        // Try to match with our Philippine data
        const matchedProvince = await findProvinceByName(provinceName);
        let matchedCity = null;
        let matchedBarangay = null;

        if (matchedProvince) {
          setSelectedProvince(matchedProvince.name);
          
          matchedCity = await findCityByName(matchedProvince.code, cityName);
          
          if (matchedCity) {
            setSelectedCity(matchedCity.name);
            
            const barangaysData = await getBarangays(matchedCity.code);
            matchedBarangay = barangaysData.find(b => 
              b.name.toLowerCase().includes(barangayName.toLowerCase())
            ) || barangaysData[0];
            
            if (matchedBarangay) {
              setSelectedBarangay(matchedBarangay.name);
            }
          }
        }

        // Update parent component
        onLocationChange({
          country: 'Philippines',
          province: matchedProvince?.name || provinceName,
          municipality: matchedCity?.name || cityName,
          barangay: matchedBarangay?.name || barangayName
        });

        Alert.alert('Success', 'Location details auto-filled successfully!');
      } else {
        Alert.alert('Error', 'Could not determine location details from coordinates.');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      Alert.alert('Error', 'Failed to auto-fill location details.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  // Handle province selection
  const selectProvince = (province) => {
    const provinceName = province.name || province;
    setSelectedProvince(provinceName);
    setSelectedCity('');
    setSelectedBarangay('');
    setProvinceModalVisible(false);
    setProvinceSearch('');
    
    onLocationChange({
      country: 'Philippines',
      province: provinceName,
      municipality: '',
      barangay: ''
    });
  };

  // Handle city selection
  const selectCity = (city) => {
    const cityName = city.name || city;
    setSelectedCity(cityName);
    setSelectedBarangay('');
    setCityModalVisible(false);
    setCitySearch('');
    
    onLocationChange({
      country: 'Philippines',
      province: selectedProvince,
      municipality: cityName,
      barangay: ''
    });
  };

  // Handle barangay selection
  const selectBarangay = (barangay) => {
    const barangayName = barangay.name || barangay;
    setSelectedBarangay(barangayName);
    setBarangayModalVisible(false);
    setBarangaySearch('');
    
    onLocationChange({
      country: 'Philippines',
      province: selectedProvince,
      municipality: selectedCity,
      barangay: barangayName
    });
  };

  // Render dropdown item
  const renderDropdownItem = ({ item, onPress, selected = false }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, selected && styles.selectedItem]}
  const renderDropdownItem = ({ item, onPress, selected }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, selected && styles.selectedItem]}
      onPress={() => onPress(item)}
    >
      <Text style={[styles.dropdownItemText, selected && styles.selectedItemText]}>
        {item.name || item}
      </Text>
      {selected && <Ionicons name="checkmark" size={20} color="#FF6F00" />}
    </TouchableOpacity>
  );

  // Render modal
  const renderModal = ({ visible, onClose, data, searchValue, onSearchChange, onItemSelect, title }) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${title.toLowerCase()}...`}
              value={searchValue}
              onChangeText={onSearchChange}
              autoCapitalize="words"
            />
          </View>

          <FlatList
            data={data}
            keyExtractor={(item) => item}
            renderItem={({ item }) => renderDropdownItem({
              item,
              onPress: onItemSelect,
              selected: false
            })}
            style={styles.dropdownList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📍 Administrative Location</Text>
      
      {/* Auto-fill button */}
      <TouchableOpacity 
        style={styles.autoFillButton}
        onPress={autoFillFromCoordinates}
        disabled={isAutoFilling || !coordinates}
      >
        <View style={styles.autoFillContent}>
          {isAutoFilling ? (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          ) : (
            <Ionicons name="location" size={18} color="white" style={{ marginRight: 8 }} />
          )}
          <Text style={styles.autoFillText}>
            {isAutoFilling ? 'Auto-filling...' : 'Auto-fill from Location'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Country (Fixed) */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Country</Text>
        <View style={[styles.dropdown, styles.disabledDropdown]}>
          <Ionicons name="globe-outline" size={20} color="#FF6F00" style={styles.dropdownIcon} />
          <Text style={styles.dropdownText}>Philippines</Text>
        </View>
      </View>

      {/* Province */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Province/State</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setProvinceModalVisible(true)}
        >
          <Ionicons name="map-outline" size={20} color="#FF6F00" style={styles.dropdownIcon} />
          <Text style={[styles.dropdownText, !selectedProvince && styles.placeholderText]}>
            {selectedProvince || 'Select Province/State'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* City/Municipality */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Municipality/City</Text>
        <TouchableOpacity
          style={[styles.dropdown, !selectedProvince && styles.disabledDropdown]}
          onPress={() => selectedProvince && setCityModalVisible(true)}
          disabled={!selectedProvince}
        >
          <Ionicons name="business-outline" size={20} color="#FF6F00" style={styles.dropdownIcon} />
          <Text style={[styles.dropdownText, !selectedCity && styles.placeholderText]}>
            {selectedCity || 'Select Municipality/City'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* Barangay */}
      <View style={styles.dropdownContainer}>
        <Text style={styles.dropdownLabel}>Barangay/District</Text>
        <TouchableOpacity
          style={[styles.dropdown, !selectedCity && styles.disabledDropdown]}
          onPress={() => selectedCity && setBarangayModalVisible(true)}
          disabled={!selectedCity}
        >
          <Ionicons name="home-outline" size={20} color="#FF6F00" style={styles.dropdownIcon} />
          <Text style={[styles.dropdownText, !selectedBarangay && styles.placeholderText]}>
            {selectedBarangay || 'Select Barangay/District'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <Text style={styles.helperText}>
        Select your complete administrative location for precise emergency alerts.
        Use the auto-fill button if you have set your GPS location.
      </Text>

      {/* Province Modal */}
      {renderModal({
        visible: provinceModalVisible,
        onClose: () => {
          setProvinceModalVisible(false);
          setProvinceSearch('');
        },
        data: filteredProvinces,
        searchValue: provinceSearch,
        onSearchChange: setProvinceSearch,
        onItemSelect: selectProvince,
        title: 'Select Province'
      })}

      {/* City Modal */}
      {renderModal({
        visible: cityModalVisible,
        onClose: () => {
          setCityModalVisible(false);
          setCitySearch('');
        },
        data: filteredCities,
        searchValue: citySearch,
        onSearchChange: setCitySearch,
        onItemSelect: selectCity,
        title: 'Select City/Municipality'
      })}

      {/* Barangay Modal */}
      {renderModal({
        visible: barangayModalVisible,
        onClose: () => {
          setBarangayModalVisible(false);
          setBarangaySearch('');
        },
        data: filteredBarangays,
        searchValue: barangaySearch,
        onSearchChange: setBarangaySearch,
        onItemSelect: selectBarangay,
        title: 'Select Barangay'
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    fontFamily: 'Montserrat-VariableFont_wght',
    textAlign: 'center',
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  autoFillContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  autoFillText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  dropdownContainer: {
    marginBottom: 16,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 8,
    paddingHorizontal: 12,
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  disabledDropdown: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
    opacity: 0.6,
  },
  dropdownIcon: {
    marginRight: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  placeholderText: {
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    margin: 20,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedItem: {
    backgroundColor: '#fef3c7',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#374151',
    fontFamily: 'Montserrat-VariableFont_wght',
    flex: 1,
  },
  selectedItemText: {
    fontWeight: '600',
    color: '#92400e',
  },
});

export default PhilippineLocationDropdown;