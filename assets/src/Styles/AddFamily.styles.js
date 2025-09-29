import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE0B2", // same as EmergencyBroadcast
  },

  // 🔹 Header
  header: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "#FF6F00",
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
  },
  backBtn: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoImage: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 18,
  },

  // 🔹 Title
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    marginLeft: 8,
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },

  // 🔹 Content
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 6,
    color: "#333",
  },

  // 🔹 Card-like Selectors
  selector: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
    marginBottom: 6,
  },
  selectorText: {
    color: "#666",
  },

  // 🔹 Input
  searchInput: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    marginRight: 8,
  },
});
