import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import path from "path";
import fs from "fs";

// Firebase configuration
const firebaseConfig = {
  projectId: "tapback-232a1",
};

// Initialize Firebase Admin (only if not already initialized)
let app;
if (getApps().length === 0) {
  try {
    let serviceAccount: any = null;
    let initialized = false;

    // Priority 1: Check environment variable for file path
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      if (fs.existsSync(serviceAccountPath)) {
        const content = fs.readFileSync(serviceAccountPath, "utf8");
        serviceAccount = JSON.parse(content);
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: firebaseConfig.projectId,
        });
        console.log("✅ Firebase initialized with service account from GOOGLE_APPLICATION_CREDENTIALS");
        initialized = true;
      }
    }

    // Priority 2: Check environment variable for JSON string
    if (!initialized && process.env.FIREBASE_SERVICE_ACCOUNT) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      app = initializeApp({
        credential: cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
      console.log("✅ Firebase initialized with service account from FIREBASE_SERVICE_ACCOUNT");
      initialized = true;
    }

    // Priority 3: Try to load from local firebase-service-account.json file
    if (!initialized) {
      const serviceAccountPath = path.join(process.cwd(), "firebase-service-account.json");
      if (fs.existsSync(serviceAccountPath)) {
        const content = fs.readFileSync(serviceAccountPath, "utf8");
        serviceAccount = JSON.parse(content);
        app = initializeApp({
          credential: cert(serviceAccount),
          projectId: firebaseConfig.projectId,
        });
        console.log("✅ Firebase initialized with service account from firebase-service-account.json");
        initialized = true;
      }
    }

    // If still not initialized, throw error (don't fall back to default credentials)
    if (!initialized) {
      throw new Error(
        "Firebase service account not found. Please ensure firebase-service-account.json exists in the project root."
      );
    }
  } catch (error: any) {
    console.error("❌ Firebase initialization error:", error.message);
    console.error(
      "Please ensure firebase-service-account.json exists in the project root."
    );
    throw error;
  }
} else {
  app = getApps()[0];
}

// Ensure app is initialized
if (!app) {
  throw new Error("Firebase app failed to initialize");
}

// Get Firestore instance
export const db = getFirestore(app);

// Verify Firestore connection
db.settings({ ignoreUndefinedProperties: true });

// Firestore collections (matches shared/schema.ts)
export const collections = {
  users: "users",
  businesses: "businesses",
  reviews: "reviews",
} as const;

/**
 * Firestore Index Recommendations:
 * 
 * Create these composite indexes in Firebase Console for optimal performance:
 * 
 * 1. businesses collection:
 *    - ownerId (Ascending) + createdAt (Descending)
 *    - slug (Ascending) [for unique lookups]
 * 
 * 2. reviews collection:
 *    - businessId (Ascending) + createdAt (Descending)
 *    - businessId (Ascending) + experienceType (Ascending)
 * 
 * 3. users collection:
 *    - username (Ascending) [for unique lookups]
 */

// Test Firestore connection on startup
(async () => {
  try {
    // Try a simple read to verify connection
    await db.collection("_test").limit(1).get();
    console.log("✅ Firestore connection successful");
  } catch (error: any) {
    // Connection errors are expected if credentials are wrong, but we'll log it
    if (error.code === "permission-denied" || error.code === "unauthenticated") {
      console.error("❌ Firestore authentication failed. Please check your service account credentials.");
    } else {
      console.log("ℹ️  Firestore connection test completed (this is normal)");
    }
  }
})();
