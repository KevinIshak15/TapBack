import { db } from "./db";
import { users, businesses, reviews } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  console.log("Seeding database...");

  // Check if data exists
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already seeded.");
    return;
  }

  // Create User
  const hashedPassword = await hashPassword("password123");
  const [user] = await db.insert(users).values({
    username: "demo_owner",
    password: hashedPassword,
  }).returning();

  console.log("Created user:", user.username);

  // Create Business
  const [business] = await db.insert(businesses).values({
    ownerId: user.id,
    name: "The Coffee Spot",
    googleReviewUrl: "https://g.page/r/example/review",
    category: "Cafe",
    slug: "the-coffee-spot",
    focusAreas: ["Coffee Quality", "Atmosphere", "Service", "Speed"],
  }).returning();

  console.log("Created business:", business.name);

  // Create Reviews (Mock Data)
  await db.insert(reviews).values([
    {
      businessId: business.id,
      experienceType: "great",
      selectedTags: ["Coffee Quality", "Atmosphere"],
      content: "Amazing latte art and cozy vibes!",
      isGenerated: false,
    },
    {
      businessId: business.id,
      experienceType: "great",
      selectedTags: ["Service"],
      content: "Staff was super friendly.",
      isGenerated: true,
    },
    {
      businessId: business.id,
      experienceType: "concern",
      selectedTags: [],
      content: "Wait time was a bit long.",
      isGenerated: false,
    },
  ]);

  console.log("Seeding complete!");
}

seed().catch(console.error).finally(() => process.exit(0));
