import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";
import styles from "../Styles/AddFamily.styles";
import Logo from "../Images/SafeLink_LOGO.png";

export default function AddFamily({ navigation }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [family, setFamily] = useState([]);
  const [notFound, setNotFound] = useState(false);

  const userId = auth.currentUser?.uid;

  // Fetch current family
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

  // 🔹 Search users when button clicked
  const handleSearch = async () => {
    setNotFound(false); // reset
    setResults([]); // reset previous results
    if (!searchQuery.trim()) {
      Alert.alert("Please type a name or phone number to search.");
      return;
    }

    try {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);

      // Filter locally (startsWith for name or phone)
      const users = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
          phoneNumber: doc.data().phoneNumber,
        }))
        .filter(
          (user) =>
            user.id !== userId &&
            (user.displayName.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
              (user.phoneNumber && user.phoneNumber.startsWith(searchQuery)))
        );

      setResults(users);
      if (users.length === 0) setNotFound(true); // only show after search
    } catch (err) {
      console.log(err);
      setResults([]);
      setNotFound(true);
    }
  };

  // Add family member
  const sendRequest = async (person) => {
    if (!userId) return;
    try {
      await addDoc(collection(db, "users", userId, "family"), {
        name: person.displayName,
        phoneNumber: person.phoneNumber || "",
        status: "Safe",
      });

      setFamily((prev) => [...prev, { ...person, status: "Safe" }]);
      Alert.alert("✅ Added", `${person.displayName} was added to your family.`);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Failed to add family member.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.logoWrapper}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.logo}>
              <Text style={{ color: "white", fontWeight: "bold", fontSize: 18 }}>Safe</Text>
              <Text style={{ color: "#E82222", fontWeight: "bold", fontSize: 18 }}>Link</Text>
            </Text>
          </View>
          <View style={styles.backBtn}>
            <Ionicons name="person-circle" size={32} color="white" />
          </View>
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleRow}>
        <Ionicons name="people" size={24} color="#E65100" />
        <Text style={styles.title}>Add A Family</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Search */}
        <Text style={styles.label}>Search by Name or Phone</Text>
        <View style={styles.selector}>
          <TextInput
            placeholder="Type name or phone..."
            value={searchQuery}
            onChangeText={(text) => setSearchQuery(text)}
            style={styles.searchInput}
            placeholderTextColor="#888"
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={20} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Not Found (only after search button clicked) */}
        {notFound && <Text style={{ color: "red", marginTop: 4 }}>User not found.</Text>}

        {/* Results */}
        {results.length > 0 && (
          <FlatList
            style={{ marginTop: 12 }}
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.selector}>
                <View>
                  <Text style={{ color: "#000" }}>{item.displayName}</Text>
                  {item.phoneNumber && (
                    <Text style={{ color: "#555", fontSize: 12 }}>{item.phoneNumber}</Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => sendRequest(item)}>
                  <Ionicons name="person-add" size={22} color="#E65100" />
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* Current Family */}
        {family.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.label}>Your Family</Text>
            {family.map((f) => (
              <View key={f.id} style={styles.selector}>
                <Text style={{ color: "#000" }}>{f.name}</Text>
                {f.phoneNumber && <Text style={{ color: "#555", fontSize: 12 }}>{f.phoneNumber}</Text>}
                <Ionicons name="checkmark-circle" size={22} color="green" />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
