import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Linking,
  ScrollView,
} from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import styles from "../Styles/EvacuationCenters.styles";
import Logo from "../Images/SafeLink_LOGO.png";

// Example list of centers with coordinates
const centers = [
  {
    id: "1",
    name: "Dasma Evacuation Center",
    lat: 14.3294,
    lon: 120.9367,
    address: "Dasmariñas, Cavite",
  },
  {
    id: "2",
    name: "Imus Evacuation Center",
    lat: 14.4064,
    lon: 120.9408,
    address: "Imus, Cavite",
  },
  {
    id: "3",
    name: "Indang Evacuation Center",
    lat: 14.1889,
    lon: 120.8775,
    address: "Indang, Cavite",
  },
];

export default function EvacuationCenters({ navigation }) {
  const [nearest, setNearest] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, distanceInterval: 50 },
        (loc) => {
          findNearest(loc.coords);
        }
      );
    })();
  }, []);

  const findNearest = (coords) => {
    let minDist = Infinity;
    let nearestCenter = null;

    centers.forEach((c) => {
      let d = getDistance(coords.latitude, coords.longitude, c.lat, c.lon);
      if (d < minDist) {
        minDist = d;
        nearestCenter = c;
      }
    });

    setNearest(nearestCenter);
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    let R = 6371; // km
    let dLat = ((lat2 - lat1) * Math.PI) / 180;
    let dLon = ((lon2 - lon1) * Math.PI) / 180;
    let a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const openRoute = (center) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${center.lat},${center.lon}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white" }}>Safe</Text>
              <Text style={{ color: "#E82222" }}>Link</Text>
            </Text>
          </View>
          <View style={styles.backBtn}>
            <Ionicons name="person-circle" size={32} color="white" />
          </View>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="location" size={22} color="#000" />
        <Text style={styles.title}>Evacuation Centers</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.list}>
        {nearest ? (
          <View style={styles.centerCard}>
            <Text style={styles.centerName}>{nearest.name}</Text>
            <Text style={styles.centerAddress}>{nearest.address}</Text>
            <TouchableOpacity
              style={styles.routeButton}
              onPress={() => openRoute(nearest)}
            >
              <Text style={styles.routeText}>Get Route</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text>Fetching nearest evacuation center...</Text>
        )}
      </ScrollView>
    </View>
  );
}
