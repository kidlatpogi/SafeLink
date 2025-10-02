# URGENT: Manual Firebase Setup for TEST_ADMIN_001

## 🚨 Quick Fix - Create Barangay Collection Manually

The `TEST_ADMIN_001` verification code isn't working because the Firebase `barangay` collection doesn't exist yet. Here's how to fix it immediately:

### **Method 1: Firebase Console (Recommended)**

1. **Go to Firebase Console:**
   - Open https://console.firebase.google.com
   - Select your SafeLink project

2. **Navigate to Firestore:**
   - Click "Firestore Database" in the left sidebar
   - If prompted, make sure you're in the correct mode (Native mode)

3. **Create the Collection:**
   - Click "Start collection"
   - Collection ID: `barangay`
   - Click "Next"

4. **Add First Document:**
   - Document ID: `TEST_ADMIN_001` (or leave auto-generated)
   - Add these fields:

   ```
   Field Name: verificationCode
   Field Type: string
   Field Value: TEST_ADMIN_001

   Field Name: barangay  
   Field Type: string
   Field Value: Test Barangay

   Field Name: municipality
   Field Type: string
   Field Value: Test Municipality

   Field Name: province
   Field Type: string
   Field Value: Test Province

   Field Name: isActive
   Field Type: boolean
   Field Value: true

   Field Name: description
   Field Type: string
   Field Value: Test verification code for development
   ```

5. **Save the Document:**
   - Click "Save"
   - The collection is now created!

### **Method 2: Add Multiple Test Codes at Once**

After creating the first document, add these additional test codes:

**Document 2:**
- Document ID: `DEMO_CODE_123`
- verificationCode: `DEMO_CODE_123`
- barangay: `Demo Barangay`
- municipality: `Demo City`
- province: `Demo Province`
- isActive: `true`
- description: `Demo verification code for testing`

**Document 3:**
- Document ID: `BGY_SANTACATALINA_VAL001`
- verificationCode: `BGY_SANTACATALINA_VAL001`
- barangay: `Santa Catalina`
- municipality: `Valencia City`
- province: `Bukidnon`
- isActive: `true`
- description: `Main verification code for Santa Catalina Barangay`

## ✅ **After Setup:**

1. **Restart your app** (the verification codes will be fetched fresh)
2. **Try TEST_ADMIN_001** again in the Official Verification form
3. **Check console logs** for "Loaded verification codes:" message

## 🔍 **Troubleshooting:**

If it still doesn't work:
1. Check Firebase Console → Authentication → Make sure your user is logged in
2. Check Firestore Rules → Make sure read access is allowed
3. Check the app console for any error messages
4. Try clearing the app cache and restarting

## 🚀 **Quick Test:**

1. Create the `barangay` collection with `TEST_ADMIN_001` document
2. Restart the app
3. Go to Official Verification
4. Enter verification code: `TEST_ADMIN_001`
5. It should now validate successfully!

The fallback codes I added will work even if Firebase is empty, but creating the collection is the proper solution.