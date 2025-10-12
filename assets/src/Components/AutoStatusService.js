import { db } from '../firebaseConfig';
import { doc, updateDoc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';

class AutoStatusService {
  constructor() {
    this.listeners = new Map();
    this.statusTimers = new Map();
  }

  // Initialize automatic status monitoring for a family
  initializeAutoStatusForFamily(familyCode) {
    if (this.listeners.has(familyCode)) {
      console.log('AutoStatusService - Already monitoring family:', familyCode);
      return;
    }

    console.log('AutoStatusService - Initializing auto status for family:', familyCode);

    // Listen to family members for status changes
    const familyRef = doc(db, 'families', familyCode);
    const unsubscribe = onSnapshot(familyRef, (doc) => {
      if (doc.exists()) {
        const familyData = doc.data();
        const members = familyData.members || [];
        
        members.forEach(member => {
          this.setupStatusMonitoring(member, familyCode);
        });
      }
    });

    this.listeners.set(familyCode, unsubscribe);
  }

  // Setup monitoring for individual family member
  setupStatusMonitoring(member, familyCode) {
    const userId = member.userId;
    const memberId = `${familyCode}_${userId}`;

    // Clear existing timer if any
    if (this.statusTimers.has(memberId)) {
      clearTimeout(this.statusTimers.get(memberId));
    }

    // Don't monitor if user is already "Not Yet Responded" or "Unknown"
    if (member.status === "Not Yet Responded" || member.status === "Unknown") {
      return;
    }

    // Set timer for "Not Yet Responded" (2 hours of inactivity)
    const notRespondedTimer = setTimeout(() => {
      this.updateMemberStatus(userId, familyCode, "Not Yet Responded", "Auto: 2h inactivity");
      
      // Set another timer for "Unknown" (6 hours additional = 8h total)
      const unknownTimer = setTimeout(() => {
        this.updateMemberStatus(userId, familyCode, "Unknown", "Auto: 8h inactivity + no location");
      }, 6 * 60 * 60 * 1000); // Additional 6 hours = 8h total
      
      this.statusTimers.set(`${memberId}_unknown`, unknownTimer);
    }, 2 * 60 * 60 * 1000); // 2 hours

    this.statusTimers.set(memberId, notRespondedTimer);
    console.log('AutoStatusService - Set timer for member:', userId);
  }

  // Update member status automatically
  async updateMemberStatus(userId, familyCode, newStatus, reason) {
    try {
      console.log('AutoStatusService - Auto updating status:', {
        userId,
        familyCode,
        newStatus,
        reason
      });

      // Update the family member status
      const familyRef = doc(db, 'families', familyCode);
      
      // Get current family data
      const familyDoc = await familyRef.get();
      if (!familyDoc.exists()) {
        console.error('AutoStatusService - Family not found:', familyCode);
        return;
      }

      const familyData = familyDoc.data();
      const members = familyData.members || [];
      
      // Find and update the specific member
      const updatedMembers = members.map(member => {
        if (member.userId === userId) {
          return {
            ...member,
            status: newStatus,
            lastUpdate: Timestamp.now(),
            autoUpdated: true,
            autoUpdateReason: reason
          };
        }
        return member;
      });

      // Update the family document
      await updateDoc(familyRef, {
        members: updatedMembers,
        lastUpdate: Timestamp.now()
      });

      console.log('AutoStatusService - Status auto-updated successfully:', newStatus);
    } catch (error) {
      console.error('AutoStatusService - Failed to auto-update status:', error);
    }
  }

  // Reset timer when user manually updates status
  resetTimerForUser(userId, familyCode) {
    const memberId = `${familyCode}_${userId}`;
    
    // Clear existing timers
    if (this.statusTimers.has(memberId)) {
      clearTimeout(this.statusTimers.get(memberId));
      this.statusTimers.delete(memberId);
    }
    
    if (this.statusTimers.has(`${memberId}_unknown`)) {
      clearTimeout(this.statusTimers.get(`${memberId}_unknown`));
      this.statusTimers.delete(`${memberId}_unknown`);
    }

    console.log('AutoStatusService - Timers reset for user:', userId);
  }

  // Check if user has been inactive (no location updates)
  async checkLocationActivity(userId) {
    try {
      // Check user's last location update
      const userRef = doc(db, 'users', userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists()) return false;
      
      const userData = userDoc.data();
      const lastLocationUpdate = userData.locationData?.timestamp;
      
      if (!lastLocationUpdate) return false;
      
      const now = new Date();
      // Handle both Firestore Timestamp and string formats
      const lastUpdate = lastLocationUpdate.toDate 
        ? lastLocationUpdate.toDate() 
        : new Date(lastLocationUpdate);
      const timeDiff = now.getTime() - lastUpdate.getTime();
      
      // Consider inactive if no location update in 4 hours (half of unknown threshold)
      return timeDiff > (4 * 60 * 60 * 1000);
    } catch (error) {
      console.error('AutoStatusService - Error checking location activity:', error);
      return true; // Assume inactive if error
    }
  }

  // Stop monitoring a family
  stopMonitoring(familyCode) {
    // Clear listener
    if (this.listeners.has(familyCode)) {
      this.listeners.get(familyCode)();
      this.listeners.delete(familyCode);
    }

    // Clear all timers for this family
    for (const [key, timer] of this.statusTimers.entries()) {
      if (key.startsWith(`${familyCode}_`)) {
        clearTimeout(timer);
        this.statusTimers.delete(key);
      }
    }

    console.log('AutoStatusService - Stopped monitoring family:', familyCode);
  }

  // Cleanup all monitoring
  cleanup() {
    // Clear all listeners
    for (const unsubscribe of this.listeners.values()) {
      unsubscribe();
    }
    this.listeners.clear();

    // Clear all timers
    for (const timer of this.statusTimers.values()) {
      clearTimeout(timer);
    }
    this.statusTimers.clear();

    console.log('AutoStatusService - Cleanup completed');
  }
}

// Export singleton instance
export default new AutoStatusService();