import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE0B2",
  },
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
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
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
    color: "#fff",
  },
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
  list: {
    paddingHorizontal: 12,
    marginTop: 10,
  },
  centerCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 3,
  },
  centerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  centerAddress: {
    fontSize: 13,
    color: "#555",
    marginVertical: 4,
  },
  routeButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  routeText: {
    color: "white",
    fontWeight: "bold",
  },
});
