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

  // 🔹 Family Code System Styles
  codeSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  codeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  codeSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  codeInstructions: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 16,
  },
  codeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  familyCodeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2196F3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  copyButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  createFamilyButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    elevation: 2,
  },
  createFamilyButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  joinCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  joinCodeInput: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    fontFamily: "monospace",
    letterSpacing: 2,
    textAlign: "center",
    marginRight: 12,
  },
  joinButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  familyMembersSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  memberCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  memberInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  memberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  memberEmail: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  adminText: {
    fontSize: 10,
    color: "#FF9800",
    fontWeight: "600",
    marginLeft: 2,
  },
  memberStatus: {
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
});
