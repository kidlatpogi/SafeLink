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

  selector: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 2,
  },
  selectorText: {
    color: "#666",
  },
  optionsBox: {
    backgroundColor: "#fff",
    marginTop: 6,
    borderRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  optionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    color: "#333",
  },

  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 14,
    color: "#000",
    elevation: 2,
  },
  messageInput: {
    height: 120,
    marginTop: 6,
  },

  broadcastButton: {
    backgroundColor: "#FF6F00",
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  broadcastText: {
    color: "white",
    fontWeight: "bold",
  },
});
