import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: "#FF6F00",
    paddingBottom: 20,
    paddingTop: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 55,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  hamburgerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 18,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  
  // Progress Card Styles
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    margin: 16,
    marginBottom: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressHeader: {
    marginBottom: 16,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  
  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  reminderButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#757575',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  
  // Category Styles
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  categoryProgress: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  categoryProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  categoryItems: {
    paddingHorizontal: 8,
  },
  
  // List Item Styles
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 2,
  },
  checkedItem: {
    backgroundColor: '#F1F8E9',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginLeft: 12,
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  checkedText: {
    color: '#4CAF50',
    textDecorationLine: 'line-through',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  
  // Tips Card
  tipsCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#5D4037',
    lineHeight: 18,
    marginBottom: 4,
  },
  
  // Photo Section Styles
  photoSection: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E3F2FD',
  },
  
  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  photoHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  
  photoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  photoThumbnail: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  photoActions: {
    flexDirection: 'row',
    gap: 12,
  },
  
  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    gap: 4,
  },
  
  changePhotoText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  
  removePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    gap: 4,
  },
  
  removePhotoText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E3F2FD',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  
  addPhotoIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  addPhotoContent: {
    flex: 1,
  },
  
  addPhotoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  
  addPhotoSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  
  privacyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  
  // Photo Modal Styles
  photoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  photoModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  
  photoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  photoModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  
  photoModalClose: {
    padding: 4,
  },
  
  photoModalImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  
  photoModalActions: {
    gap: 12,
  },
  
  photoModalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    gap: 8,
  },
  
  photoModalRemoveButton: {
    backgroundColor: '#FFEBEE',
  },
  
  photoModalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  
  photoModalRemoveText: {
    color: '#F44336',
  },
});
