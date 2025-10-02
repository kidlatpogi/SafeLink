# Firebase Barangay Collection Setup Guide

## Collection Name: `barangay`

This collection stores the verification codes and barangay information for official verification.

## Document Structure

Each document in the `barangay` collection should have the following fields:

```json
{
  "verificationCode": "BGY_SANTACATALINA_VAL001",
  "barangay": "Santa Catalina",
  "municipality": "Valencia City", 
  "province": "Bukidnon",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "createdBy": "admin_user_id",
  "description": "Verification code for Santa Catalina Barangay officials"
}
```

## Required Fields

- **verificationCode** (string): Unique verification code (e.g., "BGY_SANTACATALINA_VAL001")
- **barangay** (string): Name of the barangay
- **municipality** (string): Municipality name
- **province** (string): Province name
- **isActive** (boolean): Whether the code is currently active (true/false)

## Optional Fields

- **createdAt** (timestamp): When the code was created
- **createdBy** (string): User ID who created the code
- **description** (string): Additional description or notes

## Sample Documents

Here are sample documents you can add to test the system:

### Document 1
```json
{
  "verificationCode": "BGY_SANTACATALINA_VAL001",
  "barangay": "Santa Catalina",
  "municipality": "Valencia City",
  "province": "Bukidnon",
  "isActive": true,
  "description": "Main verification code for Santa Catalina Barangay"
}
```

### Document 2
```json
{
  "verificationCode": "BGY_POBLACION_VAL002",
  "barangay": "Poblacion",
  "municipality": "Valencia City",
  "province": "Bukidnon", 
  "isActive": true,
  "description": "Verification code for Poblacion Barangay officials"
}
```

### Document 3
```json
{
  "verificationCode": "BGY_LUMBO_VAL003",
  "barangay": "Lumbo",
  "municipality": "Valencia City",
  "province": "Bukidnon",
  "isActive": true,
  "description": "Verification code for Lumbo Barangay officials"
}
```

### Test Document
```json
{
  "verificationCode": "TEST_ADMIN_001",
  "barangay": "Test Barangay",
  "municipality": "Test Municipality",
  "province": "Test Province",
  "isActive": true,
  "description": "Test verification code for development"
}
```

## How to Add Documents

1. **Using Firebase Console:**
   - Go to Firebase Console → Firestore Database
   - Navigate to Collections
   - Create a new collection named `barangay`
   - Add documents with the structure above

2. **Using Firebase CLI or Admin SDK:**
   - You can batch import these documents using Firebase Admin SDK

## Notes

- Verification codes should be unique across all documents
- Use meaningful naming conventions (BGY_BARANGAYNAME_CITYCODE)
- Set `isActive: false` to temporarily disable a code without deleting it
- The app will automatically fetch all active codes on component mount

## Security Considerations

- Only admin users should be able to create/modify these documents
- Consider implementing Firestore security rules to protect this collection
- Verification codes should be distributed securely to actual barangay officials

## Example Firestore Security Rules

```javascript
// In firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Barangay collection - read access for all users, write access for admins only
    match /barangay/{document} {
      allow read: if true; // Anyone can read verification codes
      allow write: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.profile.isAdmin == true;
    }
  }
}
```