import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "revues_secret_key",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    }),
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL = process.env.GOOGLE_CALLBACK_URL || 
      `${process.env.BASE_URL || "http://localhost:5000"}/api/auth/google/callback`;
    
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error("No email provided by Google"), null);
            }

            // Check if user exists by email
            let user = await storage.getUserByEmail(email);

            if (!user) {
              // Create new user from Google profile
              const username = profile.emails?.[0]?.value.split("@")[0] || `user_${Date.now()}`;
              // Check if username is taken, if so append a number
              let finalUsername = username;
              let counter = 1;
              while (await storage.getUserByUsername(finalUsername)) {
                finalUsername = `${username}_${counter}`;
                counter++;
              }

              user = await storage.createUser({
                username: finalUsername,
                email: email,
                password: randomBytes(32).toString("hex"), // Random password for OAuth users
                firstName: profile.name?.givenName,
                lastName: profile.name?.familyName,
                role: "user",
              });
            }

            return done(null, user);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        // User was deleted from database, invalidate session
        return done(null, false);
      }
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      // Check admin code if provided
      let userRole: "user" | "admin" = "user";
      if (req.body.adminCode) {
        const adminCode = process.env.ADMIN_SIGNUP_CODE || "admin-secret-2024";
        if (req.body.adminCode === adminCode) {
          userRole = "admin";
        } else {
          return res.status(400).json({ message: "Invalid admin code" });
        }
      }

      const hashedPassword = await hashPassword(req.body.password);
      const { adminCode, ...userData } = req.body; // Remove adminCode before storing
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userRole,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        // Convert dates to ISO strings for JSON response
        const serialized = { ...user, createdAt: user.createdAt.toISOString() };
        if (user.updatedAt) {
          serialized.updatedAt = user.updatedAt.toISOString();
        }
        res.status(201).json(serialized);
      });
    } catch (err) {
      next(err);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    // Convert dates to ISO strings for JSON response
    const user = req.user!;
    const serialized = { ...user, createdAt: user.createdAt.toISOString() };
    if (user.updatedAt) {
      serialized.updatedAt = user.updatedAt.toISOString();
    }
    res.status(200).json(serialized);
  });

  app.post("/api/logout", (req, res, next) => {
    // Destroy the session regardless of authentication state
    req.logout((err) => {
      // Even if logout fails, destroy the session
      req.session.destroy((destroyErr) => {
        if (err || destroyErr) {
          // If there's an error, still send success to client
          // The session will be cleared on next request anyway
          return res.sendStatus(200);
        }
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      // If user doesn't exist (was deleted), clear the session
      if (req.session) {
        req.session.destroy(() => {});
      }
      return res.sendStatus(401);
    }
    // Convert dates to ISO strings for JSON response
    const user = req.user;
    const serialized = { ...user, createdAt: user.createdAt.toISOString() };
    if (user.updatedAt) {
      serialized.updatedAt = user.updatedAt.toISOString();
    }
    res.json(serialized);
  });

  // Google OAuth routes
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    console.log("✅ Google OAuth configured");
    app.get(
      "/api/auth/google",
      passport.authenticate("google", { scope: ["profile", "email"] })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", { failureRedirect: "/login?error=google_auth_failed" }),
      (req, res) => {
        // Successful authentication, redirect to dashboard
        res.redirect("/dashboard");
      }
    );
  } else {
    console.log("⚠️  Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET required");
    // Fallback route if Google OAuth is not configured
    app.get("/api/auth/google", (req, res) => {
      res.status(503).json({ 
        error: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
        message: "To enable Google Sign-In, you need to set up Google OAuth credentials in your environment variables."
      });
    });
  }
}
