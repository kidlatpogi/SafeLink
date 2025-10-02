// Barangay Document Creator Utility
// Use this in Firebase Console or through a one-time script

// Sample barangay documents for your Firebase collection
const sampleBarangayDocuments = [
  {
    verificationCode: "BGY_SANTACATALINA_VAL001",
    barangay: "Santa Catalina",
    municipality: "Valencia City",
    province: "Bukidnon",
    isActive: true,
    description: "Main verification code for Santa Catalina Barangay"
  },
  {
    verificationCode: "BGY_POBLACION_VAL002", 
    barangay: "Poblacion",
    municipality: "Valencia City",
    province: "Bukidnon",
    isActive: true,
    description: "Verification code for Poblacion Barangay officials"
  },
  {
    verificationCode: "BGY_LUMBO_VAL003",
    barangay: "Lumbo", 
    municipality: "Valencia City",
    province: "Bukidnon",
    isActive: true,
    description: "Verification code for Lumbo Barangay officials"
  },
  {
    verificationCode: "TEST_ADMIN_001",
    barangay: "Test Barangay",
    municipality: "Test Municipality", 
    province: "Test Province",
    isActive: true,
    description: "Test verification code for development"
  },
  {
    verificationCode: "DEMO_CODE_123",
    barangay: "Demo Barangay",
    municipality: "Demo City",
    province: "Demo Province", 
    isActive: true,
    description: "Demo verification code for testing"
  },
  // Add more barangays as needed
  {
    verificationCode: "BGY_MAGSAYSAY_MAL001",
    barangay: "Magsaysay",
    municipality: "Malaybalay City",
    province: "Bukidnon",
    isActive: true,
    description: "Verification code for Magsaysay Barangay, Malaybalay"
  },
  {
    verificationCode: "BGY_SUMPONG_MAL002",
    barangay: "Sumpong",
    municipality: "Malaybalay City", 
    province: "Bukidnon",
    isActive: true,
    description: "Verification code for Sumpong Barangay, Malaybalay"
  }
];

// Instructions:
// 1. Go to Firebase Console
// 2. Navigate to Firestore Database
// 3. Create a new collection named "barangay"
// 4. Add each document manually using the structure above
// 5. OR use the batch script below if you have Firebase Admin SDK access

/*
// Batch Script for Firebase Admin SDK (Node.js)
const admin = require('firebase-admin');

// Initialize Firebase Admin (make sure you have service account key)
const serviceAccount = require('./path-to-your-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Your Firebase project config
});

const db = admin.firestore();

async function addBarangayDocuments() {
  const batch = db.batch();
  
  sampleBarangayDocuments.forEach((doc, index) => {
    const docRef = db.collection('barangay').doc(); // Auto-generate document ID
    batch.set(docRef, {
      ...doc,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: 'admin_setup'
    });
  });

  try {
    await batch.commit();
    console.log('Successfully added all barangay documents!');
  } catch (error) {
    console.error('Error adding documents:', error);
  }
}

// Uncomment the line below to run the batch script
// addBarangayDocuments();
*/

module.exports = { sampleBarangayDocuments };