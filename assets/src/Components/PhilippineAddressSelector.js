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
  regions, 
  provinces, 
  cities, 
  barangays,
  regionByCode,
  provinceByName 
} from 'select-philippines-address';

const PhilippineAddressSelector = ({ 
  onLocationChange, 
  initialRegion = '', 
  initialProvince = '', 
  initialCity = '', 
  initialBarangay = '',
  coordinates = null 
}) => {
  const [selectedRegion, setSelectedRegion] = useState(initialRegion);
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedBarangay, setSelectedBarangay] = useState(initialBarangay);
  
  // Debug: Log initial values and state
  useEffect(() => {
    console.log('PhilippineAddressSelector - Initial props:', { 
      initialRegion, 
      initialProvince, 
      initialCity, 
      initialBarangay 
    });
    console.log('PhilippineAddressSelector - Current state:', { 
      selectedRegion, 
      selectedProvince, 
      selectedCity, 
      selectedBarangay 
    });
  }, [initialRegion, initialProvince, initialCity, initialBarangay]);

  // Update state when initial values change (for edit mode)
  useEffect(() => {
    if (initialRegion !== selectedRegion) {
      console.log('Updating selectedRegion from', selectedRegion, 'to', initialRegion);
      setSelectedRegion(initialRegion);
    }
    if (initialProvince !== selectedProvince) {
      console.log('Updating selectedProvince from', selectedProvince, 'to', initialProvince);
      setSelectedProvince(initialProvince);
    }
    if (initialCity !== selectedCity) {
      console.log('Updating selectedCity from', selectedCity, 'to', initialCity);
      setSelectedCity(initialCity);
    }
    if (initialBarangay !== selectedBarangay) {
      console.log('Updating selectedBarangay from', selectedBarangay, 'to', initialBarangay);
      setSelectedBarangay(initialBarangay);
    }
  }, [initialRegion, initialProvince, initialCity, initialBarangay]);
  
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [provinceModalVisible, setProvinceModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [barangayModalVisible, setBarangayModalVisible] = useState(false);
  
  const [regionSearch, setRegionSearch] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [barangaySearch, setBarangaySearch] = useState('');
  
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  // Data states
  const [regionList, setRegionList] = useState([]);
  const [provinceList, setProvinceList] = useState([]);
  const [cityList, setCityList] = useState([]);
  const [barangayList, setBarangayList] = useState([]);

  // Load regions on component mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load cascading data when initial values are provided
  useEffect(() => {
    const loadInitialData = async () => {
      if (initialRegion && regionList.length > 0 && !initialDataLoaded) {
        try {
          setInitialDataLoaded(true);
          console.log('Loading initial address data:', { initialRegion, initialProvince, initialCity, initialBarangay });
          
          // Find region code for the initial region
          const regionInfo = regionList.find(r => r.region_name === initialRegion);
          if (regionInfo) {
            // Load provinces for the initial region
            await loadProvinces(regionInfo.region_code);
            
            if (initialProvince) {
              // Find province info to get province code
              const provinceInfo = await provinceByName(initialProvince);
              if (provinceInfo) {
                // Load cities for the initial province
                await loadCities(provinceInfo.province_code);
                
                if (initialCity) {
                  // Get cities data to find city code
                  const cityData = await cities(provinceInfo.province_code);
                  const cityInfo = cityData.find(c => c.city_name === initialCity);
                  if (cityInfo && initialBarangay) {
                    // Load barangays for the initial city
                    await loadBarangays(cityInfo.city_code);
                  }
                }
              }
            }
          }
          console.log('Initial address data loaded successfully');
        } catch (error) {
          console.error('Error loading initial address data:', error);
          setInitialDataLoaded(false); // Reset on error to allow retry
        }
      }
    };

    // Only load initial data if we have initial values and regions are loaded
    // Also check if we haven't already set the region to avoid infinite loops
    if (initialRegion && regionList.length > 0 && selectedRegion === initialRegion) {
      loadInitialData();
    }
  }, [regionList, initialRegion, initialProvince, initialCity, initialBarangay]);

  // Auto-fill based on coordinates when provided
  useEffect(() => {
    if (coordinates && !isAutoFilling) {
      autoFillFromCoordinates();
    }
  }, [coordinates]);

  // Update parent component when location changes
  useEffect(() => {
    onLocationChange({
      region: selectedRegion,
      province: selectedProvince,
      municipality: selectedCity,
      barangay: selectedBarangay
    });
  }, [selectedRegion, selectedProvince, selectedCity, selectedBarangay]);

  const loadRegions = async () => {
    try {
      setIsLoading(true);
      const regionData = await regions();
      setRegionList(regionData);
    } catch (error) {
      console.error('Error loading regions:', error);
      Alert.alert('Error', 'Failed to load regions');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProvinces = async (regionCode) => {
    try {
      setIsLoading(true);
      const provinceData = await provinces(regionCode);
      setProvinceList(provinceData);
    } catch (error) {
      console.error('Error loading provinces:', error);
      Alert.alert('Error', 'Failed to load provinces');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCities = async (provinceCode) => {
    try {
      setIsLoading(true);
      const cityData = await cities(provinceCode);
      setCityList(cityData);
    } catch (error) {
      console.error('Error loading cities:', error);
      Alert.alert('Error', 'Failed to load cities');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBarangays = async (cityCode) => {
    try {
      setIsLoading(true);
      const barangayData = await barangays(cityCode);
      setBarangayList(barangayData);
    } catch (error) {
      console.error('Error loading barangays:', error);
      Alert.alert('Error', 'Failed to load barangays');
    } finally {
      setIsLoading(false);
    }
  };

  const autoFillFromCoordinates = async () => {
    if (!coordinates) return;
    
    setIsAutoFilling(true);
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      });

      if (reverseGeocode.length > 0) {
        const location = reverseGeocode[0];
        
        // Try to find and set province
        if (location.region) {
          const provinceInfo = await provinceByName(location.region);
          if (provinceInfo) {
            setSelectedProvince(location.region);
            await loadCities(provinceInfo.province_code);
          }
        }
        
        // Set city if available
        if (location.city || location.subregion) {
          const cityName = location.city || location.subregion;
          setSelectedCity(cityName);
          
          // Load barangays for the city
          const cityInfo = cityList.find(c => c.city_name.toLowerCase() === cityName.toLowerCase());
          if (cityInfo) {
            await loadBarangays(cityInfo.city_code);
          }
        }
        
        // Set district/barangay if available
        if (location.district) {
          setSelectedBarangay(location.district);
        }
      }
    } catch (error) {
      console.error('Error in auto-fill:', error);
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleRegionSelect = async (region) => {
    setSelectedRegion(region.region_name);
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedBarangay('');
    setProvinceList([]);
    setCityList([]);
    setBarangayList([]);
    setRegionModalVisible(false);
    setRegionSearch('');
    
    await loadProvinces(region.region_code);
  };

  const handleProvinceSelect = async (province) => {
    setSelectedProvince(province.province_name);
    setSelectedCity('');
    setSelectedBarangay('');
    setCityList([]);
    setBarangayList([]);
    setProvinceModalVisible(false);
    setProvinceSearch('');
    
    await loadCities(province.province_code);
  };

  const handleCitySelect = async (city) => {
    setSelectedCity(city.city_name);
    setSelectedBarangay('');
    setBarangayList([]);
    setCityModalVisible(false);
    setCitySearch('');
    
    await loadBarangays(city.city_code);
  };

  const handleBarangaySelect = (barangay) => {
    setSelectedBarangay(barangay.brgy_name);
    setBarangayModalVisible(false);
    setBarangaySearch('');
  };

  const filterData = (data, searchTerm, nameKey) => {
    if (!searchTerm) return data;
    return data.filter(item => 
      item[nameKey].toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderDropdownButton = (title, value, onPress, disabled = false) => {
    // Debug: Log dropdown values
    console.log(`Dropdown ${title}: value="${value}", disabled=${disabled}`);
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{title}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, disabled && styles.disabledButton]}
          onPress={onPress}
          disabled={disabled || isLoading}
        >
          <Text style={[styles.dropdownButtonText, !value && styles.placeholderText]}>
            {value || `Select ${title}`}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    );
  };

  const renderModal = (visible, setVisible, data, searchValue, setSearchValue, onSelect, titleKey, searchPlaceholder, title) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select {title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <TextInput
            style={styles.searchInput}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChangeText={setSearchValue}
          />
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF6F00" />
              <Text style={styles.loadingText}>Loading {title.toLowerCase()}...</Text>
            </View>
          ) : (
            <FlatList
              data={filterData(data, searchValue, titleKey)}
              keyExtractor={(item, index) => `${item[titleKey]}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => onSelect(item)}
                >
                  <Text style={styles.modalItemText}>{item[titleKey]}</Text>
                </TouchableOpacity>
              )}
              style={styles.modalList}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>📍 Philippine Address</Text>
      
      {isAutoFilling && (
        <View style={styles.autoFillContainer}>
          <ActivityIndicator size="small" color="#FF6F00" />
          <Text style={styles.autoFillText}>Auto-filling from location...</Text>
        </View>
      )}

      {renderDropdownButton('Region', selectedRegion, () => setRegionModalVisible(true))}
      
      {renderDropdownButton(
        'Province', 
        selectedProvince, 
        () => setProvinceModalVisible(true),
        !selectedRegion
      )}
      
      {renderDropdownButton(
        'City/Municipality', 
        selectedCity, 
        () => setCityModalVisible(true),
        !selectedProvince
      )}
      
      {renderDropdownButton(
        'Barangay', 
        selectedBarangay, 
        () => setBarangayModalVisible(true),
        !selectedCity
      )}

      {/* Region Modal */}
      {renderModal(
        regionModalVisible,
        setRegionModalVisible,
        regionList,
        regionSearch,
        setRegionSearch,
        handleRegionSelect,
        'region_name',
        'Search regions...',
        'Region'
      )}

      {/* Province Modal */}
      {renderModal(
        provinceModalVisible,
        setProvinceModalVisible,
        provinceList,
        provinceSearch,
        setProvinceSearch,
        handleProvinceSelect,
        'province_name',
        'Search provinces...',
        'Province'
      )}

      {/* City Modal */}
      {renderModal(
        cityModalVisible,
        setCityModalVisible,
        cityList,
        citySearch,
        setCitySearch,
        handleCitySelect,
        'city_name',
        'Search cities/municipalities...',
        'City/Municipality'
      )}

      {/* Barangay Modal */}
      {renderModal(
        barangayModalVisible,
        setBarangayModalVisible,
        barangayList,
        barangaySearch,
        setBarangaySearch,
        handleBarangaySelect,
        'brgy_name',
        'Search barangays...',
        'Barangay'
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  autoFillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  autoFillText: {
    marginLeft: 10,
    color: '#856404',
    fontSize: 14,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  fieldContainer: {
    marginBottom: 15,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  disabledButton: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
    fontFamily: 'Montserrat-VariableFont_wght',
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Montserrat-VariableFont_wght',
  },
});

export default PhilippineAddressSelector;