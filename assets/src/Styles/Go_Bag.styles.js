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
  logo: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 5,
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
  },
  list: {
    paddingHorizontal: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginVertical: 5,
    borderRadius: 8,
    elevation: 2,
  },
  itemText: {
    marginLeft: 10,
    fontSize: 14,
    color: "black",
  },
  downloadButton: {
    backgroundColor: "#E64A19",
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
  downloadText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
});
