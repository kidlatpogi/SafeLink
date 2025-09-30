// React Native compatible wrapper for @dctsph/psgc
// This wrapper handles the ES6 import issues and provides fallback data

// Fallback data structure
const fallbackData = {
  regions: [
    { code: '010000000', name: 'Region I (Ilocos Region)' },
    { code: '020000000', name: 'Region II (Cagayan Valley)' },
    { code: '030000000', name: 'Region III (Central Luzon)' },
    { code: '040000000', name: 'Region IV-A (CALABARZON)' },
    { code: '050000000', name: 'Region V (Bicol Region)' },
    { code: '060000000', name: 'Region VI (Western Visayas)' },
    { code: '070000000', name: 'Region VII (Central Visayas)' },
    { code: '080000000', name: 'Region VIII (Eastern Visayas)' },
    { code: '090000000', name: 'Region IX (Zamboanga Peninsula)' },
    { code: '100000000', name: 'Region X (Northern Mindanao)' },
    { code: '110000000', name: 'Region XI (Davao Region)' },
    { code: '120000000', name: 'Region XII (SOCCSKSARGEN)' },
    { code: '130000000', name: 'National Capital Region (NCR)' },
    { code: '140000000', name: 'Cordillera Administrative Region (CAR)' },
    { code: '150000000', name: 'Autonomous Region in Muslim Mindanao (ARMM)' },
    { code: '160000000', name: 'Region XIII (Caraga)' },
    { code: '170000000', name: 'Region IV-B (MIMAROPA)' }
  ],
  provinces: [
    // Sample provinces for fallback
    { code: '012800000', name: 'Ilocos Norte', regionCode: '010000000' },
    { code: '012900000', name: 'Ilocos Sur', regionCode: '010000000' },
    { code: '013300000', name: 'La Union', regionCode: '010000000' },
    { code: '015500000', name: 'Pangasinan', regionCode: '010000000' },
    { code: '021500000', name: 'Batanes', regionCode: '020000000' },
    { code: '023100000', name: 'Cagayan', regionCode: '020000000' },
    { code: '025000000', name: 'Isabela', regionCode: '020000000' },
    { code: '025700000', name: 'Nueva Vizcaya', regionCode: '020000000' },
    { code: '026600000', name: 'Quirino', regionCode: '020000000' },
    { code: '030800000', name: 'Bataan', regionCode: '030000000' },
    { code: '031400000', name: 'Bulacan', regionCode: '030000000' },
    { code: '054900000', name: 'Nueva Ecija', regionCode: '030000000' },
    { code: '056900000', name: 'Pampanga', regionCode: '030000000' },
    { code: '071000000', name: 'Tarlac', regionCode: '030000000' },
    { code: '077400000', name: 'Zambales', regionCode: '030000000' },
    { code: '041000000', name: 'Batangas', regionCode: '040000000' },
    { code: '042100000', name: 'Cavite', regionCode: '040000000' },
    { code: '034900000', name: 'Laguna', regionCode: '040000000' },
    { code: '058000000', name: 'Quezon', regionCode: '040000000' },
    { code: '066000000', name: 'Rizal', regionCode: '040000000' }
  ],
  municipalities: [
    // Sample municipalities for fallback
    { code: '012801000', name: 'Adams', provinceCode: '012800000' },
    { code: '012802000', name: 'Bacarra', provinceCode: '012800000' },
    { code: '012803000', name: 'Badoc', provinceCode: '012800000' },
    { code: '012804000', name: 'Bangui', provinceCode: '012800000' },
    { code: '012805000', name: 'Banna', provinceCode: '012800000' },
    { code: '012806000', name: 'Batac', provinceCode: '012800000' },
    { code: '012807000', name: 'Burgos', provinceCode: '012800000' },
    { code: '012808000', name: 'Carasi', provinceCode: '012800000' },
    { code: '012809000', name: 'Currimao', provinceCode: '012800000' },
    { code: '012810000', name: 'Dingras', provinceCode: '012800000' },
    { code: '012811000', name: 'Dumalneg', provinceCode: '012800000' },
    { code: '012812000', name: 'Laoag', provinceCode: '012800000' }
  ],
  barangays: [
    // Sample barangays for fallback
    { code: '012801001', name: 'Poblacion', municipalityCode: '012801000' },
    { code: '012801002', name: 'San Gregorio', municipalityCode: '012801000' },
    { code: '012801003', name: 'Zone I', municipalityCode: '012801000' },
    { code: '012801004', name: 'Zone II', municipalityCode: '012801000' },
    { code: '012802001', name: 'Bani', municipalityCode: '012802000' },
    { code: '012802002', name: 'Buyon', municipalityCode: '012802000' },
    { code: '012802003', name: 'Caunayan', municipalityCode: '012802000' },
    { code: '012802004', name: 'Dulapo', municipalityCode: '012802000' }
  ]
};

class PSGCWrapper {
  constructor() {
    this.psgcModule = null;
    this.isInitialized = false;
    this.initPromise = null;
  }

  async initialize() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._loadPSGC();
    return this.initPromise;
  }

  async _loadPSGC() {
    try {
      // Try to load the PSGC module
      const psgc = await import('@dctsph/psgc');
      this.psgcModule = psgc.default || psgc;
      this.isInitialized = true;
      console.log('PSGC module loaded successfully');
      return true;
    } catch (error) {
      console.warn('Failed to load PSGC module, using fallback data:', error);
      this.isInitialized = false;
      return false;
    }
  }

  async getAllRegions() {
    await this.initialize();
    
    if (this.isInitialized && this.psgcModule) {
      try {
        return this.psgcModule.getAllRegions();
      } catch (error) {
        console.warn('Error getting regions from PSGC, using fallback:', error);
      }
    }
    
    return fallbackData.regions;
  }

  async getAllProvinces() {
    await this.initialize();
    
    if (this.isInitialized && this.psgcModule) {
      try {
        return this.psgcModule.getAllProvinces();
      } catch (error) {
        console.warn('Error getting provinces from PSGC, using fallback:', error);
      }
    }
    
    return fallbackData.provinces;
  }

  async getProvincesByRegion(regionCode) {
    await this.initialize();
    
    if (this.isInitialized && this.psgcModule) {
      try {
        return this.psgcModule.getProvincesByRegion(regionCode);
      } catch (error) {
        console.warn('Error getting provinces by region from PSGC, using fallback:', error);
      }
    }
    
    return fallbackData.provinces.filter(province => province.regionCode === regionCode);
  }

  async getMunicipalitiesByProvince(provinceCode) {
    await this.initialize();
    
    if (this.isInitialized && this.psgcModule) {
      try {
        return this.psgcModule.getMunicipalitiesByProvince(provinceCode);
      } catch (error) {
        console.warn('Error getting municipalities from PSGC, using fallback:', error);
      }
    }
    
    return fallbackData.municipalities.filter(municipality => 
      municipality.provinceCode === provinceCode
    );
  }

  async getBarangaysByMunicipality(municipalityCode) {
    await this.initialize();
    
    if (this.isInitialized && this.psgcModule) {
      try {
        return this.psgcModule.getBarangaysByMunicipality(municipalityCode);
      } catch (error) {
        console.warn('Error getting barangays from PSGC, using fallback:', error);
      }
    }
    
    return fallbackData.barangays.filter(barangay => 
      barangay.municipalityCode === municipalityCode
    );
  }

  // Helper methods for searching
  async searchProvinces(searchTerm) {
    const provinces = await this.getAllProvinces();
    if (!searchTerm) return provinces;
    
    const lowerSearch = searchTerm.toLowerCase();
    return provinces.filter(province => 
      province.name.toLowerCase().includes(lowerSearch)
    );
  }

  async searchMunicipalities(provinceCode, searchTerm) {
    const municipalities = await this.getMunicipalitiesByProvince(provinceCode);
    if (!searchTerm) return municipalities;
    
    const lowerSearch = searchTerm.toLowerCase();
    return municipalities.filter(municipality => 
      municipality.name.toLowerCase().includes(lowerSearch)
    );
  }

  async searchBarangays(municipalityCode, searchTerm) {
    const barangays = await this.getBarangaysByMunicipality(municipalityCode);
    if (!searchTerm) return barangays;
    
    const lowerSearch = searchTerm.toLowerCase();
    return barangays.filter(barangay => 
      barangay.name.toLowerCase().includes(lowerSearch)
    );
  }

  // Find by name methods
  async findProvinceByName(provinceName) {
    const provinces = await this.getAllProvinces();
    const searchName = provinceName.toLowerCase().trim();
    
    // Try exact match first
    let found = provinces.find(province => 
      province.name.toLowerCase() === searchName
    );
    
    if (found) return found;
    
    // Try partial match
    found = provinces.find(province => 
      province.name.toLowerCase().includes(searchName) ||
      searchName.includes(province.name.toLowerCase())
    );
    
    return found || null;
  }

  async findMunicipalityByName(provinceCode, municipalityName) {
    const municipalities = await this.getMunicipalitiesByProvince(provinceCode);
    const searchName = municipalityName.toLowerCase().trim();
    
    // Try exact match first
    let found = municipalities.find(municipality => 
      municipality.name.toLowerCase() === searchName
    );
    
    if (found) return found;
    
    // Try partial match
    found = municipalities.find(municipality => 
      municipality.name.toLowerCase().includes(searchName) ||
      searchName.includes(municipality.name.toLowerCase())
    );
    
    return found || null;
  }

  async findBarangayByName(municipalityCode, barangayName) {
    const barangays = await this.getBarangaysByMunicipality(municipalityCode);
    const searchName = barangayName.toLowerCase().trim();
    
    // Try exact match first
    let found = barangays.find(barangay => 
      barangay.name.toLowerCase() === searchName
    );
    
    if (found) return found;
    
    // Try partial match
    found = barangays.find(barangay => 
      barangay.name.toLowerCase().includes(searchName) ||
      searchName.includes(barangay.name.toLowerCase())
    );
    
    return found || null;
  }
}

// Create a singleton instance
const psgcWrapper = new PSGCWrapper();

export default psgcWrapper;