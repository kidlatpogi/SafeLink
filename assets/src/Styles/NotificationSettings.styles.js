import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  // Header styles
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
  backBtn: {
    padding: 5,
  },

  // Title section
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#333",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Status section
  statusSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statusInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  testButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  testButtonText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 6,
  },

  // Settings section
  settingsSection: {
    marginBottom: 20,
  },
  settingCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  settingInfo: {
    flexDirection: "row",
    flex: 1,
    alignItems: "flex-start",
  },
  settingText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  settingDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginLeft: 36,
  },

  // Info section
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#F57F17",
    marginBottom: 6,
  },
  infoDescription: {
    fontSize: 14,
    color: "#795548",
    lineHeight: 20,
  },

  // Test section
  testSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  testButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  testButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  testDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },

  // Debug section
  debugButton: {
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  debugButtonText: {
    color: "#666",
    fontWeight: "600",
    marginLeft: 8,
  },
});