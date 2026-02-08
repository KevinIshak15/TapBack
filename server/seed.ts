import { db, collections } from "./db";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { Timestamp } from "firebase-admin/firestore";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding Firestore database...");

  // Check if data exists
  const usersSnapshot = await db.collection(collections.users).limit(1).get();
  if (!usersSnapshot.empty) {
    console.log("Database already seeded.");
    return;
  }

  // Create User
  const hashedPassword = await hashPassword("password123");
  const userId = 1;
  const userData = {
    username: "demo_owner",
    password: hashedPassword,
  };

  await db.collection(collections.users).doc(userId.toString()).set(userData);
  console.log("Created user: demo_owner");

  // Create Business
  const businessId = 1;
  const businessData = {
    ownerId: userId,
    name: "The Coffee Spot",
    googleReviewUrl: "https://g.page/r/example/review",
    category: "Cafe",
    slug: "the-coffee-spot",
    focusAreas: ["Coffee Quality", "Atmosphere", "Service", "Speed"],
    createdAt: Timestamp.fromDate(new Date()),
  };

  await db.collection(collections.businesses).doc(businessId.toString()).set(businessData);
  console.log("Created business: The Coffee Spot");

  // Create Reviews (Mock Data)
  const reviews = [
    {
      businessId: businessId,
      experienceType: "great",
      selectedTags: ["Coffee Quality", "Atmosphere"],
      content: "Amazing latte art and cozy vibes!",
      isGenerated: false,
      regenerationCount: 0,
      createdAt: Timestamp.fromDate(new Date()),
    },
    {
      businessId: businessId,
      experienceType: "great",
      selectedTags: ["Service"],
      content: "Staff was super friendly.",
      isGenerated: true,
      regenerationCount: 0,
      createdAt: Timestamp.fromDate(new Date()),
    },
    {
      businessId: businessId,
      experienceType: "concern",
      selectedTags: [],
      content: "Wait time was a bit long.",
      isGenerated: false,
      regenerationCount: 0,
      createdAt: Timestamp.fromDate(new Date()),
    },
  ];

  for (let i = 0; i < reviews.length; i++) {
    await db.collection(collections.reviews).doc((i + 1).toString()).set(reviews[i]);
  }

  console.log("Seeding complete!");
}

seed()
  .catch(console.error)
  .finally(() => process.exit(0));
