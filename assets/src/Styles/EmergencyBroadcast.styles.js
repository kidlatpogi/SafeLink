import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#FF6F00",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logoImage: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  logo: {
    fontWeight: "bold",
    fontSize: 20,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", 
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    marginLeft: 8,
    fontSize: 20,
    fontWeight: "bold",
    color: "#E65100",
  },

  content: {
    padding: 16,
    paddingBottom: 100,
  },

  // Form sections
  formSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Status banners
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#E82222",
    elevation: 2,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#E82222",
    fontSize: 14,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: "#E82222",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  loadingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#FF6F00",
    elevation: 2,
  },
  loadingText: {
    marginLeft: 8,
    color: "#FF6F00",
    fontSize: 14,
    fontWeight: '500',
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },

  selector: {
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 12,
  },
  
  selectorText: {
    color: "#495057",
    fontSize: 16,
    flex: 1,
  },

  optionsBox: {
    backgroundColor: "#fff",
    marginTop: 6,
    borderRadius: 8,
    elevation: 2,
    overflow: "hidden",
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  
  optionText: {
    color: "#333",
    fontSize: 16,
    fontWeight: '400',
  },

  input: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 12,
  },
  
  messageInput: {
    height: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  
  characterCount: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
    marginBottom: 16,
  },

  broadcastButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
    elevation: 3,
    shadowColor: "#FF6F00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  broadcastButtonDisabled: {
    backgroundColor: "#BDBDBD",
    elevation: 0,
    shadowOpacity: 0,
  },
  
  broadcastText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // BroadcastFeed specific styles
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
  },
  locationBannerText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  createBroadcastBtn: {
    backgroundColor: "#FF5722",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#FF5722",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  
  createBroadcastText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  
  broadcastCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#f1f3f4",
  },

  broadcastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  alertTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  alertTypeText: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 6,
  },

  timeText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },

  locationText: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    fontWeight: "500",
  },

  messageText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },

  coordinatesText: {
    fontSize: 11,
    color: "#999",
    fontFamily: "monospace",
  },

  timestampText: {
    fontSize: 11,
    color: "#999",
    fontStyle: "italic",
    textAlign: "right",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },

  containerLoadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#666",
    marginTop: 16,
  },

  emptySubtitle: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
