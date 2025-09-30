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
  const renderModal = ({ visible, onClose, data, searchValue, onSearchChange, onItemSelect, title, loading: modalLoading }) => (
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

          {modalLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={data}
              keyExtractor={(item, index) => item.code || item.name || index.toString()}
              renderItem={({ item }) => renderDropdownItem({
                item,
                onPress: onItemSelect,
                selected: false
              })}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          )}
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
        {isAutoFilling ? (
          <ActivityIndicator size="small" color="#007AFF" />
        ) : (
          <Ionicons name="location" size={16} color="#007AFF" />
        )}
        <Text style={styles.autoFillButtonText}>
          {isAutoFilling ? 'Auto-filling...' : 'Auto-fill from GPS'}
        </Text>
      </TouchableOpacity>

      {/* Province Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Province *</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setProvinceModalVisible(true)}
        >
          <Text style={[styles.dropdownText, !selectedProvince && styles.placeholder]}>
            {selectedProvince || 'Select Province'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* City Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>City/Municipality *</Text>
        <TouchableOpacity
          style={[styles.dropdown, !selectedProvince && styles.disabledDropdown]}
          onPress={() => selectedProvince && setCityModalVisible(true)}
          disabled={!selectedProvince}
        >
          <Text style={[styles.dropdownText, !selectedCity && styles.placeholder]}>
            {selectedCity || (selectedProvince ? 'Select City/Municipality' : 'Select province first')}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Barangay Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Barangay *</Text>
        <TouchableOpacity
          style={[styles.dropdown, !selectedCity && styles.disabledDropdown]}
          onPress={() => selectedCity && setBarangayModalVisible(true)}
          disabled={!selectedCity}
        >
          <Text style={[styles.dropdownText, !selectedBarangay && styles.placeholder]}>
            {selectedBarangay || (selectedCity ? 'Select Barangay' : 'Select city first')}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Province Modal */}
      {renderModal({
        visible: provinceModalVisible,
        onClose: () => {
          setProvinceModalVisible(false);
          setProvinceSearch('');
        },
        title: 'Select Province',
        data: filteredProvinces,
        searchValue: provinceSearch,
        onSearchChange: setProvinceSearch,
        onItemSelect: selectProvince,
        loading: loading.provinces
      })}

      {/* City Modal */}
      {renderModal({
        visible: cityModalVisible,
        onClose: () => {
          setCityModalVisible(false);
          setCitySearch('');
        },
        title: 'Select City/Municipality',
        data: filteredCities,
        searchValue: citySearch,
        onSearchChange: setCitySearch,
        onItemSelect: selectCity,
        loading: loading.cities
      })}

      {/* Barangay Modal */}
      {renderModal({
        visible: barangayModalVisible,
        onClose: () => {
          setBarangayModalVisible(false);
          setBarangaySearch('');
        },
        title: 'Select Barangay',
        data: filteredBarangays,
        searchValue: barangaySearch,
        onSearchChange: setBarangaySearch,
        onItemSelect: selectBarangay,
        loading: loading.barangays
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  autoFillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007AFF',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  autoFillButtonText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 48,
  },
  disabledDropdown: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholder: {
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    margin: 20,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#333',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  dropdownList: {
    flex: 1,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedItem: {
    backgroundColor: '#FFF3E0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectedItemText: {
    color: '#FF6F00',
    fontWeight: '500',
  },
});

export default PhilippineLocationDropdown;