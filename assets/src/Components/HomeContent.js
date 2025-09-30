import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from './UserContext';
import { useFamily } from './FamilyContext';
import useOptimizedLocation from './useOptimizedLocation';
import styles from "../Styles/Home.styles";
import EvacIcon from "../Images/map.png";

const API_KEY = "c956f87c395021c41caf56aba8b6d870"; // OpenWeather API Key

const HomeContent = ({ displayName, navigation }) => {
  const { userId } = useUser();
  const { family, userStatus } = useFamily();
  
  const API_KEY = "c956f87c395021c41caf56aba8b6d870"; // OpenWeather API Key

  // Use optimized location hook with automatic tracking
  const { location, loading: locationLoading, error: locationError } = useOptimizedLocation({
    enableTracking: true, // Enable background tracking
    onLocationUpdate: (newLocation) => {
      // Automatically update weather when location changes
      fetchWeatherForLocation(newLocation.latitude, newLocation.longitude);
    }
  });
  
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Fetch weather for a specific location
  const fetchWeatherForLocation = async (latitude, longitude) => {
    try {
      setWeatherLoading(true);
      
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );

      const data = await response.json();

      if (response.ok && data.weather && data.weather.length > 0) {
        setWeather(data.weather[0].main);
        setCity(data.name);
      } else {
        console.warn("Weather API error:", data.message);
        setWeather(null);
        setCity(null);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
      setWeather(null);
      setCity(null);
    } finally {
      setWeatherLoading(false);
    }
  };

  // Initial weather fetch when location becomes available
  useEffect(() => {
    if (location && !weather) {
      fetchWeatherForLocation(location.latitude, location.longitude);
    }
  }, [location]);

  // Get status color for Family Check-In
  const getStatusColor = () => {
    switch (userStatus) {
      case "I'm Safe":
        return "#4CAF50";
      case "Not Yet Responded":
        return "#FF9800";
      case "Unknown":
        return "#9E9E9E";
      case "Evacuated":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  // Get status color for any member status
  const getMemberStatusColor = (status) => {
    switch (status) {
      case "I'm Safe":
      case "SAFE":
        return "#4CAF50";
      case "Not Yet Responded":
        return "#FF9800";
      case "Unknown":
        return "#9E9E9E";
      case "Evacuated":
      case "DANGER":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  // ✅ Weather icon mapping
  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "Rain":
        return { icon: "umbrella", color: "#2196F3" };
      case "Thunderstorm":
        return { icon: "flash-on", color: "red" };
      case "Drizzle":
        return { icon: "grain", color: "#4FC3F7" };
      case "Clear":
        return { icon: "wb-sunny", color: "orange" };
      case "Clouds":
        return { icon: "cloud", color: "gray" };
      case "Snow":
        return { icon: "ac-unit", color: "#00BCD4" };
      case "Mist":
      case "Fog":
      case "Haze":
        return { icon: "blur-on", color: "#9E9E9E" };
      default:
        return { icon: "warning", color: "red" };
    }
  };

  const { icon, color } = getWeatherIcon(weather);

  return (
    <>
      {/* Greeting */}
      <Text style={styles.greeting}>Hi, {displayName}!</Text>

      <View style={styles.sectionRow}>
        <View style={styles.column}>

          {/* Evacuation Centers - HIGH PRIORITY */}
          <View style={[styles.sectionCard, { flex: 1, marginBottom: 10 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Evacuation Centers</Text>
            </View>
            <View style={[styles.sectionContent, { flex: 1, justifyContent: 'center' }]}>
              <Image source={EvacIcon} style={styles.evacIcon} resizeMode="contain" />
              <View style={styles.sectionFooter}>
                <Text style={styles.nearestCenterText}>Nearest Center</Text>
                <TouchableOpacity
                  style={styles.seeAllButton}
                  onPress={() => navigation.navigate("EvacuationCenters")}
                >
                  <Text style={styles.seeAllGreen}>Route</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Real-Time Alerts */}
          <View style={[styles.sectionCard, { flex: 1 }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Real-Time Alerts</Text>
            </View>
            <View style={[styles.sectionContent, { flex: 1, justifyContent: 'center' }]}>
              {locationError ? (
                <>
                  <MaterialIcons name="location-off" size={30} color="red" />
                  <Text style={styles.itemTextCentered}>Location Error</Text>
                </>
              ) : (weatherLoading || locationLoading) ? (
                <>
                  <MaterialIcons name="hourglass-empty" size={30} color="gray" />
                  <Text style={styles.itemTextCentered}>Loading...</Text>
                </>
              ) : weather && city ? (
                <>
                  <MaterialIcons name={icon} size={30} color={color} />
                  <Text style={styles.itemTextCentered}>
                    {weather} {"\n"} {city}
                  </Text>
                </>
              ) : (
                <>
                  <MaterialIcons name="cloud-off" size={30} color="gray" />
                  <Text style={styles.itemTextCentered}>Weather Unavailable</Text>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: '#FFEBEE' }]}
            onPress={() => navigation.navigate("BroadcastFeed")}
          >
            <View style={styles.itemRow}>
              <Ionicons name="megaphone" size={30} color="#FF5722" />
              <Text style={[styles.itemText, { fontWeight: 'bold', color: '#FF5722' }]}>Emergency Broadcast</Text>
            </View>
          </TouchableOpacity>

          {/* Family Check-In - ESSENTIAL */}
          <TouchableOpacity
            style={[styles.card, { backgroundColor: '#E8F5E8' }]}
            onPress={() => navigation.navigate("FamilyCheckIn", { displayName })}
          >
            <View style={styles.itemRow}>
              <Ionicons name="people" size={30} color={getStatusColor()} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemText, { fontWeight: 'bold' }]}>Family Check-In</Text>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  Status: {userStatus}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {/* Go-Bag Checklist - IMPORTANT */}
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: '#FFF3E0' }]}
            onPress={() => navigation.navigate("Go_Bag")}
          >
            <View style={styles.itemRow}>
              <Ionicons name="checkbox" size={30} color="#FF9800" />
              <Text style={[styles.itemText, { fontWeight: '600' }]}>Go-Bag Checklist</Text>
            </View>
          </TouchableOpacity>

          {/* Add A Family - UTILITY */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("AddFamily")}
          >
            <View style={styles.itemRow}>
              <Ionicons name="person-add" size={30} color="#2196F3" />
              <Text style={styles.itemText}>Add A Family</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Family Status */}
      <View style={styles.familyCard}>
        <View style={styles.familyHeader}>
          <Text style={styles.familyStatusTitle}>Family Status</Text>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('FamilyDetails')}
          >
            <Text style={styles.seeAllGreen}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.familyListContainer}>
          {family.length === 0 ? (
            <View style={styles.emptyFamilyContainer}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyFamilyText}>No family members added yet.</Text>
              <Text style={styles.emptyFamilySubtext}>Create or join a family to see member status here.</Text>
            </View>
          ) : (
            family.map((member) => (
              <View key={member.userId} style={[styles.familyMemberCard, { borderLeftColor: getMemberStatusColor(member.status) }]}>
                <View style={styles.familyMemberInfo}>
                  <Ionicons name="person-circle" size={40} color="#2196F3" />
                  <View style={styles.familyMemberDetails}>
                    <Text style={styles.familyMemberName}>{member.name}</Text>
                    <Text style={styles.familyMemberEmail}>{member.email}</Text>
                    {member.isAdmin && (
                      <View style={styles.familyAdminBadge}>
                        <Ionicons name="star" size={10} color="#FF9800" />
                        <Text style={styles.familyAdminText}>Admin</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.familyMemberStatus}>
                  <View style={[styles.familyStatusIndicator, { backgroundColor: getMemberStatusColor(member.status) }]} />
                  <Text style={[styles.familyStatusText, { color: getMemberStatusColor(member.status) }]}>
                    {member.status || "Safe"}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </>
  );
};

export default HomeContent;
