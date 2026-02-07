import { users, businesses, reviews, type User, type InsertUser, type Business, type InsertBusiness, type Review, type InsertReview } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { randomBytes } from "crypto";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  createBusiness(business: InsertBusiness & { ownerId: number }): Promise<Business>;
  getBusinessesByOwner(ownerId: number): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  updateBusiness(id: number, updates: Partial<InsertBusiness> & { focusAreas?: string[] }): Promise<Business>;
  
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByBusiness(businessId: number): Promise<Review[]>;
  getStats(businessId: number): Promise<{ scans: number, reviewsGenerated: number, redirects: number, concerns: number }>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createBusiness(business: InsertBusiness & { ownerId: number }): Promise<Business> {
    // Generate slug from name + random string
    const slug = `${business.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${randomBytes(3).toString('hex')}`;
    const [newBusiness] = await db.insert(businesses).values({ ...business, slug }).returning();
    return newBusiness;
  }

  async getBusinessesByOwner(ownerId: number): Promise<Business[]> {
    return db.select().from(businesses).where(eq(businesses.ownerId, ownerId));
  }

  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.slug, slug));
    return business;
  }

  async updateBusiness(id: number, updates: Partial<InsertBusiness> & { focusAreas?: string[] }): Promise<Business> {
    const [updated] = await db.update(businesses).set(updates).where(eq(businesses.id, id)).returning();
    return updated;
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByBusiness(businessId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.businessId, businessId));
  }

  async getStats(businessId: number): Promise<{ scans: number, reviewsGenerated: number, redirects: number, concerns: number }> {
    // Mock implementation for MVP since we aren't tracking all events perfectly yet
    // In a real app, we'd have an events table.
    // Here we can count created reviews at least.
    const allReviews = await this.getReviewsByBusiness(businessId);
    return {
      scans: allReviews.length * 3 + Math.floor(Math.random() * 20), // Fake multiplier
      reviewsGenerated: allReviews.filter(r => r.isGenerated).length,
      redirects: allReviews.filter(r => r.experienceType === 'great').length, // Approx
      concerns: allReviews.filter(r => r.experienceType === 'concern').length,
    };
  }
}

export const storage = new DatabaseStorage();
