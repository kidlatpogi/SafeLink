// OverpassService.js - Fetch real evacuation centers using Overpass API

class OverpassService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter';
    this.timeout = 25000; // 25 seconds timeout
  }

  /**
   * Build Overpass QL query to find potential evacuation centers
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {number} radius - Search radius in meters (default 5000m = 5km)
   */
  buildEvacuationCentersQuery(latitude, longitude, radius = 5000) {
    return `
      [out:json][timeout:25];
      (
        node["amenity"="school"](around:${radius},${latitude},${longitude});
        way["amenity"="school"](around:${radius},${latitude},${longitude});
        node["leisure"="sports_centre"](around:${radius},${latitude},${longitude});
        way["leisure"="sports_centre"](around:${radius},${latitude},${longitude});
        node["amenity"="community_centre"](around:${radius},${latitude},${longitude});
        way["amenity"="community_centre"](around:${radius},${latitude},${longitude});
        node["building"="civic"](around:${radius},${latitude},${longitude});
        way["building"="civic"](around:${radius},${latitude},${longitude});
        node["amenity"="shelter"](around:${radius},${latitude},${longitude});
        way["amenity"="shelter"](around:${radius},${latitude},${longitude});
      );
      out center;
    `;
  }

  /**
   * Fetch evacuation centers from Overpass API
   * @param {number} latitude - User's latitude
   * @param {number} longitude - User's longitude
   * @param {number} radius - Search radius in meters
   * @returns {Promise<Array>} Array of evacuation centers
   */
  async fetchEvacuationCenters(latitude, longitude, radius = 5000) {
    try {
      console.log(`Fetching evacuation centers near ${latitude}, ${longitude}`);
      
      const query = this.buildEvacuationCentersQuery(latitude, longitude, radius);
      
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      try {
        const response = await fetch(this.overpassUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
          },
          body: query,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.elements) {
          const centers = this.parseOverpassResponse(data.elements, latitude, longitude);
          console.log(`Found ${centers.length} evacuation centers`);
          return centers;
        }

        console.log('No evacuation centers found in response');
        return [];
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching evacuation centers from Overpass:', error.message);
      throw error;
    }
  }

  /**
   * Parse Overpass API response into evacuation center objects
   */
  parseOverpassResponse(elements, userLat, userLon) {
    const centers = [];
    let idCounter = 1;

    elements.forEach(element => {
      const tags = element.tags || {};
      
      // Get coordinates based on element type
      let lat, lon;
      if (element.type === 'node') {
        lat = element.lat;
        lon = element.lon;
      } else if (element.type === 'way' && element.center) {
        lat = element.center.lat;
        lon = element.center.lon;
      } else {
        return; // Skip if no coordinates
      }

      // Determine facility type and name
      const amenity = tags.amenity || '';
      const building = tags.building || '';
      const leisure = tags.leisure || '';
      
      let type = 'Emergency Evacuation Center';
      let estimatedCapacity = '100 people';
      let facilities = ['Restrooms'];

      if (amenity === 'school') {
        type = 'School Evacuation Center';
        estimatedCapacity = '300-500 people';
        facilities = ['Restrooms', 'Electricity', 'Water Source', 'Medical Station'];
      } else if (amenity === 'community_centre') {
        type = 'Community Emergency Center';
        estimatedCapacity = '150-200 people';
        facilities = ['Restrooms', 'Electricity', 'Communication Equipment'];
      } else if (leisure === 'sports_centre') {
        type = 'Sports Center Evacuation';
        estimatedCapacity = '200-400 people';
        facilities = ['Restrooms', 'Electricity', 'Water Source'];
      } else if (building === 'civic') {
        type = 'Civic Building Shelter';
        estimatedCapacity = '100-200 people';
        facilities = ['Restrooms', 'Electricity'];
      } else if (amenity === 'shelter') {
        type = 'Designated Emergency Shelter';
        estimatedCapacity = '50-100 people';
        facilities = ['Restrooms', 'Water Source'];
      }

      // Get name (use various name tags)
      const name = tags.name || 
                   tags['name:en'] || 
                   tags['official_name'] || 
                   `${type} ${idCounter}`;

      // Get address
      const address = this.buildAddress(tags);

      // Calculate distance
      const distance = this.calculateDistance(userLat, userLon, lat, lon);

      centers.push({
        id: element.id || idCounter,
        osmId: element.id,
        name: name,
        address: address,
        capacity: estimatedCapacity,
        type: type,
        coordinates: {
          latitude: lat,
          longitude: lon,
        },
        facilities: facilities,
        distance: distance,
        tags: tags, // Keep original tags for reference
      });

      idCounter++;
    });

    // Sort by distance (nearest first)
    centers.sort((a, b) => a.distance - b.distance);

    return centers;
  }

  /**
   * Build address string from OSM tags
   */
  buildAddress(tags) {
    const parts = [];
    
    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }
    if (tags['addr:barangay']) {
      parts.push(tags['addr:barangay']);
    }
    if (tags['addr:city'] || tags['addr:municipality']) {
      parts.push(tags['addr:city'] || tags['addr:municipality']);
    }
    if (tags['addr:province']) {
      parts.push(tags['addr:province']);
    }

    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @returns {number} Distance in kilometers
   */
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg) {
    return deg * (Math.PI / 180);
  }
}

export default new OverpassService();
