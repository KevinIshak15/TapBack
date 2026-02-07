import { users, businesses, reviews, auditLogs, type User, type InsertUser, type Business, type InsertBusiness, type Review, type InsertReview, type AuditLog } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, count } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { randomBytes } from "crypto";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;

  // Businesses
  createBusiness(business: InsertBusiness & { ownerId: number }): Promise<Business>;
  getBusinessesByOwner(ownerId: number): Promise<Business[]>;
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  updateBusiness(id: number, updates: Partial<Business> & { focusAreas?: string[] }): Promise<Business>;
  listAllBusinesses(): Promise<Business[]>;
  
  // Reviews & Stats
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByBusiness(businessId: number): Promise<Review[]>;
  getStats(businessId: number): Promise<{ scans: number, reviewsGenerated: number, redirects: number, concerns: number }>;
  getGlobalStats(): Promise<{ totalUsers: number, totalBusinesses: number, totalReviews: number, totalConcerns: number }>;

  // Admin Logs
  createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog>;
  listAuditLogs(): Promise<AuditLog[]>;

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
    const [user] = await db.insert(users).values({ ...insertUser, role: insertUser.role || 'business' }).returning();
    return user;
  }

  async listUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return updated;
  }

  async createBusiness(business: InsertBusiness & { ownerId: number }): Promise<Business> {
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

  async updateBusiness(id: number, updates: Partial<Business> & { focusAreas?: string[] }): Promise<Business> {
    const [updated] = await db.update(businesses).set(updates).where(eq(businesses.id, id)).returning();
    return updated;
  }

  async listAllBusinesses(): Promise<Business[]> {
    return db.select().from(businesses).orderBy(desc(businesses.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getReviewsByBusiness(businessId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.businessId, businessId));
  }

  async getStats(businessId: number): Promise<{ scans: number, reviewsGenerated: number, redirects: number, concerns: number }> {
    const allReviews = await this.getReviewsByBusiness(businessId);
    return {
      scans: allReviews.length * 3 + 5,
      reviewsGenerated: allReviews.filter(r => r.isGenerated).length,
      redirects: allReviews.filter(r => r.experienceType === 'great').length,
      concerns: allReviews.filter(r => r.experienceType === 'concern').length,
    };
  }

  async getGlobalStats(): Promise<{ totalUsers: number, totalBusinesses: number, totalReviews: number, totalConcerns: number }> {
    const [usersCount] = await db.select({ count: count() }).from(users);
    const [businessesCount] = await db.select({ count: count() }).from(businesses);
    const [reviewsCount] = await db.select({ count: count() }).from(reviews);
    const [concernsCount] = await db.select({ count: count() }).from(reviews).where(eq(reviews.experienceType, 'concern'));
    
    return {
      totalUsers: Number(usersCount.count),
      totalBusinesses: Number(businessesCount.count),
      totalReviews: Number(reviewsCount.count),
      totalConcerns: Number(concernsCount.count),
    };
  }

  async createAuditLog(log: Omit<AuditLog, 'id' | 'createdAt'>): Promise<AuditLog> {
    const [newLog] = await db.insert(auditLogs).values(log).returning();
    return newLog;
  }

  async listAuditLogs(): Promise<AuditLog[]> {
    return db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt));
  }
}

export const storage = new DatabaseStorage();
