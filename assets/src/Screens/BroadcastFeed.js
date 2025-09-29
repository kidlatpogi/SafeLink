import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function BroadcastFeed() {
  const [broadcasts, setBroadcasts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "broadcasts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBroadcasts(data);
    });

    return unsubscribe;
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency Alerts</Text>
      <FlatList
        data={broadcasts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.type}>{item.alertType}</Text>
            <Text>{item.location} - {item.barangay}</Text>
            <Text>{item.message}</Text>
            <Text style={styles.time}>
              {item.createdAt?.toDate().toLocaleString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFE0B2" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  card: { backgroundColor: "#fff", padding: 12, borderRadius: 8, marginBottom: 10 },
  type: { fontWeight: "bold", color: "#E65100" },
  time: { fontSize: 12, color: "#555", marginTop: 4 },
});
