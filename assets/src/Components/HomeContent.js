import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { db, auth } from "../firebaseConfig";
import { collection, getDocs, doc, onSnapshot } from "firebase/firestore";
import styles from "../Styles/Home.styles";
import EvacIcon from "../Images/map.png";

const API_KEY = "c956f87c395021c41caf56aba8b6d870"; // OpenWeather API Key

const HomeContent = ({ displayName, navigation }) => {
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [family, setFamily] = useState([]);
  const [userStatus, setUserStatus] = useState("Not Yet Responded");

  const userId = auth.currentUser?.uid;

  // ✅ Fetch family members from Firestore
  useEffect(() => {
    if (!userId) return;

    const fetchFamily = async () => {
      try {
        const familySnapshot = await getDocs(
          collection(db, "users", userId, "family")
        );
        const familyData = familySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFamily(familyData);
      } catch (err) {
        console.log("Failed to fetch family:", err);
      }
    };

    fetchFamily();
  }, [userId]);

  // ✅ Listen for real-time updates of user's check-in status
  useEffect(() => {
    if (!userId) return;

    const statusRef = doc(db, "users", userId, "checkInStatus", "status");

    const unsubscribe = onSnapshot(statusRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserStatus(docSnap.data().status);
      } else {
        setUserStatus("Not Yet Responded");
      }
    });

    return () => unsubscribe();
  }, [userId]);

  // ✅ Get status color for Family Check-In
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

  // ✅ Fetch current location and weather
  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
        );

        const data = await res.json();

        if (res.ok && data.weather && data.weather.length > 0) {
          setWeather(data.weather[0].main);
          setCity(data.name);
        } else {
          setErrorMsg(data.message || "Failed to fetch weather data");
        }
      } catch (err) {
        setErrorMsg("Failed to fetch weather data");
        console.log(err);
      }
    })();
  }, []);

  const { icon, color } = getWeatherIcon(weather);

  return (
    <>
      {/* Greeting */}
      <Text style={styles.greeting}>Hi, {displayName}!</Text>

      <View style={styles.sectionRow}>
        <View style={styles.column}>
          {/* Real-Time Alerts */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Real-Time Alerts</Text>
            </View>
            <View style={styles.sectionContent}>
              {errorMsg ? (
                <>
                  <MaterialIcons name="error" size={30} color="red" />
                  <Text style={styles.itemTextCentered}>{errorMsg}</Text>
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
                  <MaterialIcons name="hourglass-empty" size={30} color="gray" />
                  <Text style={styles.itemTextCentered}>Loading...</Text>
                </>
              )}
            </View>
          </View>

          {/* Emergency Broadcast */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EmergencyBroadcast")}
          >
            <View style={styles.itemRow}>
              <Ionicons name="megaphone" size={30} color="#FF9800" />
              <Text style={styles.itemText}>Emergency Broadcast</Text>
            </View>
          </TouchableOpacity>

          {/* Family Check-In */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("FamilyCheckIn", { displayName })}
          >
            <View style={styles.itemRow}>
              <Ionicons name="people" size={30} color={getStatusColor()} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemText}>Family Check-In</Text>
                <Text style={[styles.statusText, { color: getStatusColor() }]}>
                  Status: {userStatus}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Right Column */}
        <View style={styles.column}>
          {/* Evacuation Centers */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Evacuation Centers</Text>
            </View>
            <View style={styles.sectionContent}>
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

          {/* Go-Bag Checklist */}
          <TouchableOpacity 
  style={styles.card}
  onPress={() => navigation.navigate("Go_Bag")} // ✅ Navigate to Go_Bag screen
>
  <View style={styles.itemRow}>
    <Ionicons name="checkbox" size={30} color="green" />
    <Text style={styles.itemText}>Go-Bag Checklist</Text>
  </View>
</TouchableOpacity>


          {/* Add A Family */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("AddFamily")}
          >
            <View style={styles.itemRow}>
              <Ionicons name="person-add" size={30} color="gray" />
              <Text style={styles.itemText}>Add A Family</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Family Status */}
      <View style={styles.familyCard}>
        <View style={styles.familyHeader}>
          <Text style={styles.familyStatusTitle}>Family Status</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllGreen}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.familyRow}>
          {family.length === 0 ? (
            <Text style={{ color: "#888" }}>No family members added yet.</Text>
          ) : (
            family.map((member) => (
              <View key={member.id} style={styles.familyMember}>
                <Ionicons name="person-circle" size={60} color="blue" />
                <Text style={styles.name}>{member.name}</Text>
                <Text style={styles.safe}>{member.status || "Safe"}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </>
  );
};

export default HomeContent;
