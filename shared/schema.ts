import { z } from "zod";

// ============================================================================
// Type Definitions & Enums
// ============================================================================

export const ExperienceType = z.enum(["great", "concern"]);
export type ExperienceType = z.infer<typeof ExperienceType>;

// ============================================================================
// User Schema
// ============================================================================

export const UserRole = z.enum(["user", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

export const insertUserSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  email: z.string().email().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  role: UserRole.default("user").optional(), // Default to "user", can be "admin"
  adminCode: z.string().optional(), // Secret code for admin signup (not stored in DB)
});

// Internal schema (for database/storage) - uses Date objects
const userSchemaInternal = insertUserSchema.extend({
  id: z.number(),
  role: UserRole.default("user"), // Ensure role is always present
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

// API response schema (for JSON) - dates are always strings in JSON
export const userSchema = insertUserSchema.extend({
  id: z.number(),
  role: UserRole.default("user"), // Ensure role is always present
  createdAt: z.string(), // JSON always serializes dates as strings
  updatedAt: z.string().optional(),
});

export type User = z.infer<typeof userSchemaInternal>; // Use internal schema for types
export type InsertUser = z.infer<typeof insertUserSchema>;

// ============================================================================
// Business Schema
// ============================================================================

export const insertBusinessSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  googleReviewUrl: z.string().url().regex(/google\.com|g\.page/, "Must be a valid Google Review URL"),
  focusAreas: z.array(z.string()).default([]),
  // Additional optional fields
  description: z.string().max(1000).optional(),
  address: z.string().max(500).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional(),
});

// Internal schema (for database/storage) - uses Date objects
const businessSchemaInternal = insertBusinessSchema.extend({
  id: z.number(),
  ownerId: z.number(),
  slug: z.string(), // Generated: name-slugified + random
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  // Analytics fields (computed/cached)
  totalScans: z.number().default(0).optional(),
  totalReviews: z.number().default(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
});

// API response schema (for JSON) - dates are always strings in JSON
export const businessSchema = insertBusinessSchema.extend({
  id: z.number(),
  ownerId: z.number(),
  slug: z.string(), // Generated: name-slugified + random
  createdAt: z.string(), // JSON always serializes dates as strings
  updatedAt: z.string().optional(),
  // Analytics fields (computed/cached)
  totalScans: z.number().default(0).optional(),
  totalReviews: z.number().default(0).optional(),
  averageRating: z.number().min(0).max(5).optional(),
});

export type Business = z.infer<typeof businessSchemaInternal>; // Use internal schema for types
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;

// ============================================================================
// Review Schema
// ============================================================================

export const insertReviewSchema = z.object({
  businessId: z.number(),
  experienceType: ExperienceType,
  selectedTags: z.array(z.string()).default([]),
  content: z.string().optional(),
  isGenerated: z.boolean().default(false),
  // Additional metadata
  rating: z.number().min(1).max(5).optional(), // If user provides rating
  customerEmail: z.string().email().optional(), // For follow-up
});

// Internal schema (for database/storage) - uses Date objects
const reviewSchemaInternal = insertReviewSchema.extend({
  id: z.number(),
  regenerationCount: z.number().default(0),
  createdAt: z.date(),
  // Analytics metadata
  ipAddress: z.string().optional(), // For rate limiting (hashed)
  userAgent: z.string().optional(), // Device info
});

// API response schema (for JSON) - dates are always strings in JSON
export const reviewSchema = insertReviewSchema.extend({
  id: z.number(),
  regenerationCount: z.number().default(0),
  createdAt: z.string(), // JSON always serializes dates as strings
  // Analytics metadata
  ipAddress: z.string().optional(), // For rate limiting (hashed)
  userAgent: z.string().optional(), // Device info
});

export type Review = z.infer<typeof reviewSchemaInternal>; // Use internal schema for types
export type InsertReview = z.infer<typeof insertReviewSchema>;

// ============================================================================
// Request Types
// ============================================================================

export type CreateBusinessRequest = InsertBusiness;
export type UpdateBusinessRequest = Partial<InsertBusiness> & { 
  focusAreas?: string[];
  description?: string;
  address?: string;
  phone?: string;
  website?: string;
};

// ============================================================================
// Firestore Collection Helpers
// ============================================================================

/**
 * Firestore collection names
 */
export const COLLECTIONS = {
  users: "users",
  businesses: "businesses",
  reviews: "reviews",
} as const;

/**
 * Firestore index recommendations (create these in Firebase Console)
 * 
 * Composite Indexes needed:
 * 1. businesses: ownerId (ascending) + createdAt (descending)
 * 2. businesses: slug (ascending) - for unique lookups
 * 3. reviews: businessId (ascending) + createdAt (descending)
 * 4. reviews: businessId (ascending) + experienceType (ascending)
 * 5. users: username (ascending) - for unique lookups
 */
