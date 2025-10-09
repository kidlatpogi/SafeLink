import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: '#2196F3',
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  
  // Family Info Card
  familyInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  familyNameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  familyCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  familyCodeLabel: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  familyCodeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    letterSpacing: 2,
  },
  familyMemberCount: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },

  // Section Header
  sectionHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    textAlign: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Member Card
  memberCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  memberHeader: {
    marginBottom: 16,
  },
  memberBasicInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberNameSection: {
    flex: 1,
    marginLeft: 12,
  },
  memberNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  memberName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  adminText: {
    fontSize: 10,
    color: '#FF9800',
    fontWeight: 'bold',
    marginLeft: 2,
  },
  youBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  youText: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Contact Section
  contactSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  contactActions: {
    flexDirection: 'row',
  },
  contactButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },

  // Location Section
  locationSection: {
    marginBottom: 12,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  locationTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  mapsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mapsButtonText: {
    fontSize: 12,
    color: '#2196F3',
    marginLeft: 4,
    fontWeight: '500',
  },
  locationDetails: {
    paddingLeft: 24,
  },
  locationAddress: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  locationCoords: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  locationTime: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  locationSource: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  noLocationText: {
    fontSize: 14,
    color: '#999',
    paddingLeft: 24,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  noLocationContainer: {
    paddingLeft: 24,
  },
  enableLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  enableLocationText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
    marginLeft: 4,
  },

  // Last Seen Section
  lastSeenSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  lastSeenText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});