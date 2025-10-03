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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  
  // Error and loading states
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#E82222",
    elevation: 2,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    color: "#E82222",
    fontSize: 14,
    fontWeight: "500",
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  
  // Filter info
  filterInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    elevation: 2,
  },
  filterText: {
    flex: 1,
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  settingsButton: {
    padding: 8,
    backgroundColor: "#f1f3f4",
    borderRadius: 6,
  },
  
  // List container
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  
  // Broadcast item styles
  broadcastItem: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  
  // Official broadcast styling
  officialBroadcastItem: {
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
    backgroundColor: "#F8FFF8",
  },
  
  // Unseen broadcast styling
  unseenBroadcastItem: {
    borderWidth: 2,
    borderColor: "#FF4444",
    backgroundColor: "#FFF5F5",
  },
  
  broadcastHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  
  analyticsButton: {
    backgroundColor: "#E3F2FD",
    padding: 6,
    borderRadius: 6,
  },
  
  emergencyTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  
  emergencyType: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "bold",
  },
  
  timeAgo: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  
  broadcastMessage: {
    fontSize: 15,
    color: "#333",
    lineHeight: 20,
    marginBottom: 8,
  },
  
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  
  locationText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  
  broadcastFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  
  broadcasterInfo: {
    flex: 1,
  },
  
  broadcasterName: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  
  barangayText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginTop: 2,
  },
  
  broadcastStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  
  seenCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  
  seenCountText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
    fontWeight: "500",
  },
  
  distanceText: {
    fontSize: 12,
    color: "#999",
    fontWeight: "500",
  },
  
  // Official broadcast badges
  officialBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  
  officialBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    marginLeft: 2,
  },
  
  // Unread indicator
  unreadIndicator: {
    marginLeft: 8,
  },
  
  // Empty state
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
  
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 40,
  },
  
  // Create broadcast button (if used)
  createBroadcastBtn: {
    backgroundColor: "#FF5722",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 10,
    elevation: 3,
  },
  
  createBroadcastText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
});