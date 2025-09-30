// Philippine Provinces, Cities, and Barangays Data
// Using @dctsph/psgc package for official PSGC data with React Native compatibility

import psgcWrapper from './PSGCWrapper';

// Helper functions to work with PSGC data
export const getRegions = async () => {
  try {
    return await psgcWrapper.getAllRegions();
  } catch (error) {
    console.error('Error getting regions:', error);
    return [];
  }
};

export const getProvinces = async (regionCode = null) => {
  try {
    if (regionCode) {
      return await psgcWrapper.getProvincesByRegion(regionCode);
    }
    return await psgcWrapper.getAllProvinces();
  } catch (error) {
    console.error('Error getting provinces:', error);
    return [];
  }
};

export const getCities = async (provinceCode) => {
  try {
    if (!provinceCode) return [];
    return await psgcWrapper.getMunicipalitiesByProvince(provinceCode);
  } catch (error) {
    console.error('Error getting cities:', error);
    return [];
  }
};

export const getBarangays = async (municipalityCode) => {
  try {
    if (!municipalityCode) return [];
    return await psgcWrapper.getBarangaysByMunicipality(municipalityCode);
  } catch (error) {
    console.error('Error getting barangays:', error);
    return [];
  }
};

// Search functions for better UX
export const searchProvinces = async (searchTerm) => {
  try {
    return await psgcWrapper.searchProvinces(searchTerm);
  } catch (error) {
    console.error('Error searching provinces:', error);
    return [];
  }
};

export const searchCities = async (provinceCode, searchTerm) => {
  try {
    return await psgcWrapper.searchMunicipalities(provinceCode, searchTerm);
  } catch (error) {
    console.error('Error searching cities:', error);
    return [];
  }
};

export const searchBarangays = async (municipalityCode, searchTerm) => {
  try {
    return await psgcWrapper.searchBarangays(municipalityCode, searchTerm);
  } catch (error) {
    console.error('Error searching barangays:', error);
    return [];
  }
};

// Find location by name (useful for reverse geocoding)
export const findProvinceByName = async (provinceName) => {
  try {
    return await psgcWrapper.findProvinceByName(provinceName);
  } catch (error) {
    console.error('Error finding province by name:', error);
    return null;
  }
};

export const findCityByName = async (provinceCode, cityName) => {
  try {
    return await psgcWrapper.findMunicipalityByName(provinceCode, cityName);
  } catch (error) {
    console.error('Error finding city by name:', error);
    return null;
  }
};

export const findBarangayByName = async (municipalityCode, barangayName) => {
  try {
    return await psgcWrapper.findBarangayByName(municipalityCode, barangayName);
  } catch (error) {
    console.error('Error finding barangay by name:', error);
    return null;
  }
};

// Helper function to get complete location hierarchy
export const getLocationHierarchy = (barangayCode) => {
  try {
    // This would need to be implemented based on the structure
    // For now, return a simple structure
    return {
      region: null,
      province: null,
      municipality: null,
      barangay: null
    };
  } catch (error) {
    console.error('Error getting location hierarchy:', error);
    return null;
  }
};

export default {
  getRegions,
  getProvinces,
  getCities,
  getBarangays,
  searchProvinces,
  searchCities,
  searchBarangays,
  findProvinceByName,
  findCityByName,
  findBarangayByName,
  getLocationHierarchy
};