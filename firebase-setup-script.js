// Quick Firebase Setup Script
// Run this file to automatically populate your barangay collection

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// Import your Firebase config (adjust path as needed)
// Make sure to replace this with your actual Firebase config
const firebaseConfig = {
  // Your Firebase config object
  // You can find this in Firebase Console > Project Settings > General > Your apps
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const barangayDocuments = [
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
  }
];

async function setupBarangayCollection() {
  console.log('Setting up barangay collection...');
  
  try {
    for (const barangayData of barangayDocuments) {
      // Use verification code as document ID for easy lookup
      const docRef = doc(db, 'barangay', barangayData.verificationCode);
      await setDoc(docRef, {
        ...barangayData,
        createdAt: new Date(),
        createdBy: 'setup_script'
      });
      console.log(`✅ Added: ${barangayData.verificationCode} - ${barangayData.barangay}`);
    }
    
    console.log('🎉 Barangay collection setup complete!');
    console.log(`Added ${barangayDocuments.length} verification codes`);
    
  } catch (error) {
    console.error('❌ Error setting up barangay collection:', error);
  }
}

// To run this script:
// 1. Update the firebaseConfig with your actual config
// 2. Run: node firebase-setup-script.js
// 3. Or copy the documents manually to Firebase Console

// Uncomment to run automatically
// setupBarangayCollection();

export { setupBarangayCollection, barangayDocuments };