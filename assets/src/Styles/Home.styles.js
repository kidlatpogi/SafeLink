import { StyleSheet } from "react-native";

export default StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFE0B2",
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FF6F00",
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginHorizontal: 0,
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "green",
  },
  logoWrapper: {
  flexDirection: "row",
  alignItems: "center",
},

logoImage: {
  width: 30,
  height: 30,
  marginRight: 8,
},

  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 15,
    marginLeft: 30,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  column: {
    flex: 1,
  },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    margin: 5,
    overflow: "hidden",
    elevation: 2,
    minHeight: 120,
    justifyContent: "space-between",
  },
  sectionHeader: {
    backgroundColor: "#FF6F00",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    color: "black",
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  sectionContent: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    flex: 1,
    backgroundColor: "#fff",
  },
  evacIcon: {
    width: 38,
    height: 38,
  },
  sectionFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  nearestCenterText: {
    fontSize: 10,
    color: "black",
    fontWeight: "bold",
    backgroundColor: "#fff",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  seeAllButton: {
    backgroundColor: "green",
    borderRadius: 3,
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  seeAllGreen: {
    color: "black",
    fontSize: 10,
    fontWeight: "bold",
  },
  seeAllWrapper: {
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingBottom: 6,
    marginTop: -4,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    margin: 5,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemText: {
    marginLeft: 8,
    fontSize: 12,
    flexShrink: 1,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 10,
    fontWeight: "500",
    marginTop: 2,
  },
  itemTextCentered: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
  },

  familyCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginTop: 25,
    elevation: 4,
    marginHorizontal: 20, 
  },

  familyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  familyStatusTitle: {
    color: "black",
    fontWeight: "bold",
    fontSize: 16,
  },
  familyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingHorizontal: 15,
  },
  familyMember: {
    alignItems: "center",
  },
  name: {
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 5,
  },
  safe: { color: "green", fontSize: 12 },
  danger: { color: "red", fontSize: 12 },
  unknown: { color: "gray", fontSize: 12 },

  // Hamburger Menu Styles
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  menuBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 280,
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menuGradient: {
    flex: 1,
    paddingTop: 0,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  menuClose: {
    padding: 5,
  },
  menuContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#fff',
    marginLeft: 15,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  
  // Logo text styles
  logoTextWhite: {
    color: "white",
  },
  logoTextRed: {
    color: "#E82222",
  },
  
  // Menu animation styles
  menuBackdropTouchable: {
    flex: 1,
  },

  // Family Status List View Styles
  familyListContainer: {
    marginTop: 10,
  },
  emptyFamilyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  emptyFamilyText: {
    color: "#888",
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyFamilySubtext: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  familyMemberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  familyMemberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  familyMemberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  familyMemberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  familyMemberEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  familyAdminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  familyAdminText: {
    fontSize: 9,
    color: '#FF9800',
    fontWeight: '600',
    marginLeft: 2,
  },
  familyMemberStatus: {
    alignItems: 'center',
  },
  familyStatusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 4,
  },
  familyStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});