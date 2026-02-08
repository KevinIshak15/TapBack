import type { Express } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { serializeDates } from "../utils/serialize";
import { db, collections } from "../db";

export function registerAdminRoutes(app: Express) {
  // Get all users (admin only)
  app.get(
    "/api/admin/users",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const snapshot = await db.collection(collections.users).get();
      const users = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          username: data.username,
          email: data.email,
          role: data.role || "user",
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });
      res.json(users);
    })
  );

  // Get all businesses (admin only)
  app.get(
    "/api/admin/businesses",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const snapshot = await db.collection(collections.businesses).get();
      const businesses = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
        };
      });
      res.json(businesses.map(b => serializeDates(b)));
    })
  );

  // Get all reviews (admin only)
  app.get(
    "/api/admin/reviews",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const snapshot = await db.collection(collections.reviews).get();
      const reviews = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        };
      });
      res.json(reviews);
    })
  );

  // Get admin stats
  app.get(
    "/api/admin/stats",
    requireAuth,
    requireAdmin,
    asyncHandler(async (req, res) => {
      const [usersSnapshot, businessesSnapshot, reviewsSnapshot] = await Promise.all([
        db.collection(collections.users).get(),
        db.collection(collections.businesses).get(),
        db.collection(collections.reviews).get(),
      ]);

      const totalUsers = usersSnapshot.size;
      const totalBusinesses = businessesSnapshot.size;
      const totalReviews = reviewsSnapshot.size;
      const adminUsers = usersSnapshot.docs.filter(doc => doc.data().role === "admin").length;

      // Calculate reviews by type
      const reviews = reviewsSnapshot.docs.map(doc => doc.data());
      const greatReviews = reviews.filter(r => r.experienceType === "great").length;
      const concernReviews = reviews.filter(r => r.experienceType === "concern").length;
      const generatedReviews = reviews.filter(r => r.isGenerated).length;

      res.json({
        users: {
          total: totalUsers,
          admins: adminUsers,
          regular: totalUsers - adminUsers,
        },
        businesses: {
          total: totalBusinesses,
        },
        reviews: {
          total: totalReviews,
          great: greatReviews,
          concerns: concernReviews,
          generated: generatedReviews,
        },
      });
    })
  );
}
