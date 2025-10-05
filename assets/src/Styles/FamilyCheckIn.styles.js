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
    marginTop: 55,
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
  
  // Status display styles
  statusContainer: {
    alignItems: "center",
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#424242",
    marginBottom: 10,
  },
  statusIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  
  // Options container
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#424242",
    marginBottom: 15,
    textAlign: "center",
  },
  
  // Status buttons
  statusButton: {
    marginVertical: 8,
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  
  // Instructions section
  instructionsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    backgroundColor: "#FFF8E1",
    marginHorizontal: 20,
    borderRadius: 8,
    padding: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#F57F17",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#424242",
    lineHeight: 20,
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
