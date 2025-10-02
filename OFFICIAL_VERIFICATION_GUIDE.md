# 🏛️ Barangay Official Authentication System - Setup Guide

## 🎯 **System Overview**
This system implements a comprehensive authentication mechanism for barangay officials to send emergency broadcasts with "seen" counter functionality.

## 🚀 **Features Implemented**

### **1. Official Verification System**
- ✅ User role-based authentication
- ✅ Verification code system for barangays
- ✅ Admin approval workflow
- ✅ Official badges and status indicators

### **2. Emergency Broadcasting Controls**
- ✅ Only verified officials can broadcast
- ✅ Official role and barangay displayed on broadcasts
- ✅ Enhanced broadcast data structure

### **3. Seen Counter & Analytics**
- ✅ Track who viewed each broadcast
- ✅ Real-time seen counter
- ✅ Detailed analytics for officials
- ✅ View timestamps and user details

### **4. Admin Panel**
- ✅ Approve/reject verification requests
- ✅ Role-based access (Barangay Captain only)
- ✅ Review notes and audit trail

## 📱 **How to Test**

### **Step 1: Apply for Official Verification**
1. Open hamburger menu
2. Click "Apply for Official Verification"
3. Select role (e.g., "Barangay Captain")
4. Use verification code: `BGY_SANTACATALINA_VAL001`
5. Fill in contact details
6. Submit request

### **Step 2: Approve Verification (Admin)**
1. Login as a different user
2. Manually set them as admin in database:
```javascript
// In Firebase Console > users collection
profile: {
  isVerifiedOfficial: true,
  officialRole: "barangay_captain",
  canBroadcast: true
}
```
3. Access "Admin Panel" from hamburger menu
4. Approve pending requests

### **Step 3: Test Emergency Broadcasting**
1. Login as verified official
2. Access "Emergency Broadcast" from menu
3. Should see "Verified Official" status
4. Send broadcast - includes official role and barangay
5. Broadcast shows "OFFICIAL" badge

### **Step 4: Test Seen Counter**
1. View broadcast as regular user
2. Counter increments automatically
3. Official can view analytics from BroadcastFeed
4. See detailed view data in analytics

## 🔧 **Verification Codes Available**
```
BGY_SANTACATALINA_VAL001 - Santa Catalina, Valencia City, Bukidnon
BGY_POBLACION_VAL002 - Poblacion, Valencia City, Bukidnon
BGY_LUMBO_VAL003 - Lumbo, Valencia City, Bukidnon
```

## 📊 **Database Structure Changes**

### **User Profile (Enhanced)**
```javascript
{
  profile: {
    // Existing fields...
    isVerifiedOfficial: boolean,
    officialRole: string, // "barangay_captain", "councilor", etc.
    barangayAssignment: string,
    canBroadcast: boolean,
    verificationStatus: string, // "none", "pending", "approved", "rejected"
    verificationCode: string,
    contactNumber: string,
    officeName: string
  }
}
```

### **Broadcast Document (Enhanced)**
```javascript
{
  // Existing fields...
  isOfficialBroadcast: boolean,
  officialRole: string,
  barangayAssignment: string,
  seenBy: [userId1, userId2...],
  seenCount: number,
  seenDetails: {
    userId1: timestamp,
    userId2: timestamp
  },
  targetRadius: number
}
```

### **New Collections**
```javascript
// officialVerificationRequests
{
  userId: string,
  displayName: string,
  email: string,
  officialRole: string,
  barangayAssignment: string,
  contactNumber: string,
  status: "pending" | "approved" | "rejected",
  requestedAt: timestamp,
  reviewedBy: string,
  reviewedAt: timestamp
}
```

## 🎯 **Next Steps**
1. Test the verification workflow
2. Add more verification codes as needed
3. Consider adding email domain verification
4. Implement push notifications for approvals
5. Add broadcast scheduling capabilities

## 🔐 **Security Features**
- ✅ Role-based access control
- ✅ Verification code validation
- ✅ Admin approval required
- ✅ Audit trail for all actions
- ✅ Official badge verification

The system is now ready for testing! 🚀