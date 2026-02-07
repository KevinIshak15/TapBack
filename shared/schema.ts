import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").$type<"admin" | "business">().default("business").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  name: text("name").notNull(),
  googleReviewUrl: text("google_review_url").notNull(),
  category: text("category").notNull(),
  slug: text("slug").notNull().unique(),
  focusAreas: jsonb("focus_areas").$type<string[]>().default([]),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  businessId: integer("business_id").notNull(),
  experienceType: text("experience_type").notNull(),
  selectedTags: jsonb("selected_tags").$type<string[]>().default([]),
  content: text("content"),
  isGenerated: boolean("is_generated").default(false),
  regenerationCount: integer("regeneration_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(), // 'user', 'business'
  targetId: integer("target_id").notNull(),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  businesses: many(businesses),
}));

export const businessesRelations = relations(businesses, ({ one, many }) => ({
  owner: one(users, {
    fields: [businesses.ownerId],
    references: [users.id],
  }),
  reviews: many(reviews),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  business: one(businesses, {
    fields: [reviews.businessId],
    references: [businesses.id],
  }),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
  slug: true,
  isActive: true,
}).extend({
  googleReviewUrl: z.string().url().regex(/google\.com|g\.page/, "Must be a valid Google Review URL"),
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  regenerationCount: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type CreateBusinessRequest = InsertBusiness;
export type UpdateBusinessRequest = Partial<InsertBusiness> & { focusAreas?: string[]; isActive?: boolean };
