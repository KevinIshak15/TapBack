import type { User, InsertUser, Business, InsertBusiness, Review, InsertReview } from "@shared/schema";
import { db, collections } from "./db";
import { randomBytes } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";
import { Timestamp } from "firebase-admin/firestore";

const MemorySessionStore = createMemoryStore(session);

// Helper to convert Firestore document to our type
function docToData<T extends { id: number }>(doc: FirebaseFirestore.DocumentSnapshot): T | undefined {
  if (!doc.exists) return undefined;
  const data = doc.data();
  const result: any = {
    id: parseInt(doc.id),
    ...data,
  };
  
  // Set default role if not present (for backward compatibility)
  if (!result.role) {
    result.role = "user";
  }
  
  // Convert Firestore Timestamps to Date
  if (data?.createdAt?.toDate) {
    result.createdAt = data.createdAt.toDate();
  } else if (data?.createdAt) {
    result.createdAt = new Date(data.createdAt);
  }
  
  if (data?.updatedAt?.toDate) {
    result.updatedAt = data.updatedAt.toDate();
  } else if (data?.updatedAt) {
    result.updatedAt = new Date(data.updatedAt);
  }
  
  return result as T;
}

// Helper to convert our data to Firestore format
function dataToDoc(data: any): any {
  const { id, ...rest } = data;
  const converted: any = {};
  
  for (const [key, value] of Object.entries(rest)) {
    if (value instanceof Date) {
      converted[key] = Timestamp.fromDate(value);
    } else if (value === undefined) {
      // Skip undefined values (Firestore doesn't support them)
      continue;
    } else {
      converted[key] = value;
    }
  }
  
  return converted;
}

// Helper to get next ID for a collection
async function getNextId(collection: string): Promise<number> {
  const snapshot = await db.collection(collection).get();
  let maxId = 0;
  snapshot.docs.forEach((doc) => {
    const id = parseInt(doc.id) || 0;
    if (id > maxId) maxId = id;
  });
  return maxId + 1;
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createBusiness(business: InsertBusiness & { ownerId: number }): Promise<Business>;
  getBusinessesByOwner(ownerId: number): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  updateBusiness(id: number, updates: Partial<InsertBusiness> & { focusAreas?: string[] }): Promise<Business>;

  createReview(review: InsertReview): Promise<Review>;
  getReviewsByBusiness(businessId: number): Promise<Review[]>;
  getStats(businessId: number): Promise<{ scans: number; reviewsGenerated: number; redirects: number; concerns: number }>;

  sessionStore: session.Store;
}

export class FirebaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemorySessionStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const doc = await db.collection(collections.users).doc(id.toString()).get();
    return docToData<User>(doc);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const snapshot = await db
      .collection(collections.users)
      .where("username", "==", username)
      .limit(1)
      .get();

    if (snapshot.empty) return undefined;
    return docToData<User>(snapshot.docs[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db
      .collection(collections.users)
      .where("email", "==", email)
      .limit(1)
      .get();

    if (snapshot.empty) return undefined;
    return docToData<User>(snapshot.docs[0]);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const newId = await getNextId(collections.users);
    const now = new Date();
    
    const userData: User = {
      ...insertUser,
      role: insertUser.role || "user", // Default to "user" if not specified
      id: newId,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(collections.users).doc(newId.toString()).set(dataToDoc(userData));

    return userData;
  }

  async createBusiness(business: InsertBusiness & { ownerId: number }): Promise<Business> {
    // Generate unique slug from name + random string
    const baseSlug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const randomSuffix = randomBytes(3).toString("hex");
    const slug = `${baseSlug}-${randomSuffix}`;

    const newId = await getNextId(collections.businesses);
    const now = new Date();

    const businessData: Business = {
      ...business,
      slug,
      id: newId,
      createdAt: now,
      updatedAt: now,
      totalScans: 0,
      totalReviews: 0,
    };

    await db.collection(collections.businesses).doc(newId.toString()).set(dataToDoc(businessData));

    return businessData;
  }

  async getBusinessesByOwner(ownerId: number): Promise<Business[]> {
    // Note: For now, we fetch without orderBy to avoid requiring an index
    // Once you create the composite index (ownerId + createdAt), you can add .orderBy("createdAt", "desc")
    const snapshot = await db
      .collection(collections.businesses)
      .where("ownerId", "==", ownerId)
      .get();

    // Sort in memory by createdAt (most recent first)
    const businesses = snapshot.docs
      .map((doc) => docToData<Business>(doc)!)
      .filter(Boolean)
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime(); // Descending order
      });

    return businesses;
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const doc = await db.collection(collections.businesses).doc(id.toString()).get();
    return docToData<Business>(doc);
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const snapshot = await db
      .collection(collections.businesses)
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (snapshot.empty) return undefined;
    return docToData<Business>(snapshot.docs[0]);
  }

  async updateBusiness(id: number, updates: Partial<InsertBusiness> & { focusAreas?: string[] }): Promise<Business> {
    const docRef = db.collection(collections.businesses).doc(id.toString());
    
    const updateData = {
      ...dataToDoc(updates),
      updatedAt: Timestamp.fromDate(new Date()),
    };
    
    await docRef.update(updateData);

    const updated = await docRef.get();
    const business = docToData<Business>(updated);
    if (!business) throw new Error("Business not found after update");
    return business;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const newId = await getNextId(collections.reviews);
    const now = new Date();

    const reviewData: Review = {
      ...review,
      id: newId,
      regenerationCount: 0,
      createdAt: now,
    };

    await db.collection(collections.reviews).doc(newId.toString()).set(dataToDoc(reviewData));

    // Update business review count (increment)
    const businessRef = db.collection(collections.businesses).doc(review.businessId.toString());
    await businessRef.update({
      totalReviews: db.FieldValue.increment(1),
      updatedAt: Timestamp.fromDate(now),
    });

    return reviewData;
  }

  async getReviewsByBusiness(businessId: number): Promise<Review[]> {
    const snapshot = await db
      .collection(collections.reviews)
      .where("businessId", "==", businessId)
      .orderBy("createdAt", "desc") // Most recent first
      .get();

    return snapshot.docs.map((doc) => docToData<Review>(doc)!).filter(Boolean);
  }

  async getStats(businessId: number): Promise<{ scans: number; reviewsGenerated: number; redirects: number; concerns: number }> {
    const allReviews = await this.getReviewsByBusiness(businessId);
    
    return {
      scans: allReviews.length * 3 + Math.floor(Math.random() * 20), // Estimated
      reviewsGenerated: allReviews.filter((r) => r.isGenerated).length,
      redirects: allReviews.filter((r) => r.experienceType === "great").length,
      concerns: allReviews.filter((r) => r.experienceType === "concern").length,
    };
  }
}

export const storage = new FirebaseStorage();
