import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE0B2",
    paddingBottom: 20,
  },
  header: {
    width: "100%",
    flexDirection: "column",
    justifyContent: "flex-end",
    backgroundColor: "#FF6F00",
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 30,
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
    marginRight: 5,
  },
  logo: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerProfile: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  /* ✅ Title Row */
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "black",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  profilePic: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    borderWidth: 3,
  },
  memberName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    color: "white",
    fontWeight: "bold",
  },
  buttonGroup: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginVertical: 6,
    borderRadius: 8,
  },
  optionText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
