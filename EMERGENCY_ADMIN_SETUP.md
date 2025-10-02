# 🚨 EMERGENCY ADMIN SETUP - Fix TEST_ADMIN_001 Issue

## The Problem
You submitted a verification request, but you need admin access to approve it - creating a circular dependency!

## 🔧 **IMMEDIATE FIX - Manual Admin Setup**

### **Step 1: Find Your User ID**
1. In your app, check the console logs when you log in
2. OR go to Firebase Console → Authentication → Users
3. Copy your **User UID** (long string like: `abc123def456...`)

### **Step 2: Manually Make Yourself Admin**
1. **Go to Firebase Console** → **Firestore Database**
2. **Navigate to `users` collection**
3. **Find your user document** (should match your User UID)
4. **Edit the document** and add/update these fields:

```json
{
  "profile": {
    "isVerifiedOfficial": true,
    "officialRole": "barangay_captain",
    "verificationStatus": "approved",
    "canBroadcast": true,
    "barangayAssignment": "Test Barangay, Test Municipality, Test Province"
  }
}
```

### **Step 3: Restart App**
1. Close and reopen your app
2. The hamburger menu should now show **"Admin Panel"**
3. You can now approve other verification requests!

## 🔄 **Alternative: Quick Admin Toggle**

I can also create a temporary admin toggle in the app. Would you like me to add a secret button to instantly make yourself admin for testing?

## 📋 **Manual Firebase Steps in Detail:**

1. **Firebase Console** → **Firestore Database**
2. **Collection: `users`**
3. **Document: [your-user-id]**
4. **Click "Edit"**
5. **Add/Modify Fields:**
   - `profile.isVerifiedOfficial` → `true` (boolean)
   - `profile.officialRole` → `barangay_captain` (string)
   - `profile.verificationStatus` → `approved` (string)
   - `profile.canBroadcast` → `true` (boolean)
   - `profile.barangayAssignment` → `Test Barangay, Test Municipality, Test Province` (string)

6. **Save the document**
7. **Restart your app**

## ✅ **After Setup:**
- Hamburger menu will show "Admin Panel"
- You can approve verification requests
- You can send emergency broadcasts
- Full admin functionality enabled

This is a one-time setup - once you're admin, you can approve other legitimate requests normally!