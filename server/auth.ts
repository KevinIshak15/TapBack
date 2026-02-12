import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, createHash } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { sendPasswordResetEmail } from "./email";
import { z } from "zod";
import { User as SelectUser, insertUserSchema } from "@shared/schema";

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
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (usernameOrEmail, password, done) => {
      try {
        const input = (usernameOrEmail && typeof usernameOrEmail === "string")
          ? usernameOrEmail.trim()
          : "";
        if (!input) return done(null, false);

        let user: Awaited<ReturnType<typeof storage.getUserByUsername>>;
        if (input.includes("@")) {
          user = await storage.getUserByEmail(input);
          if (!user) {
            const localPart = input.split("@")[0]?.trim();
            if (localPart) user = await storage.getUserByUsername(localPart);
          }
          if (!user) user = await storage.getUserByUsername(input);
        } else {
          user = await storage.getUserByUsername(input);
        }
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        }
        return done(null, user);
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
      const parsed = insertUserSchema.safeParse(req.body);
      if (!parsed.success) {
        const first = parsed.error.flatten().fieldErrors;
        const message = first.username?.[0] ?? first.password?.[0] ?? first.email?.[0] ?? "Invalid signup data";
        return res.status(400).json({ message });
      }
      const body = parsed.data;

      // Check if username already exists
      if (body.username) {
        const existingUser = await storage.getUserByUsername(body.username);
        if (existingUser) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }

      // Check if email already exists
      if (body.email) {
        const existingUserByEmail = await storage.getUserByEmail(body.email);
        if (existingUserByEmail) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Check admin code if provided
      let userRole: "user" | "admin" = "user";
      if (body.adminCode) {
        const adminCode = process.env.ADMIN_SIGNUP_CODE || "admin-secret-2024";
        if (body.adminCode === adminCode) {
          userRole = "admin";
        } else {
          return res.status(400).json({ message: "Invalid admin code" });
        }
      }

      const hashedPassword = await hashPassword(body.password);
      const { adminCode, ...userData } = body;
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
        role: userRole,
      });

      // Log the user in and establish session
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return next(err);
        }
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

  app.post("/api/login", (req, res, next) => {
    const body = req.body as Record<string, unknown>;
    const username = typeof body?.username === "string" ? body.username.trim() : "";
    const password = typeof body?.password === "string" ? body.password : "";
    if (!username) return res.status(400).json({ message: "Email or username is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });
    passport.authenticate("local", (err: any, user: Express.User | false) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Incorrect username or password." });
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        const serialized = { ...user, createdAt: (user as Express.User).createdAt.toISOString() };
        if ((user as Express.User).updatedAt) {
          serialized.updatedAt = (user as Express.User).updatedAt!.toISOString();
        }
        res.status(200).json(serialized);
      });
    })(req, res, next);
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
    const user = req.user;
    const { password: _p, ...safe } = user as Express.User & { password?: string };
    const serialized = { ...safe, createdAt: user.createdAt.toISOString() };
    if (user.updatedAt) {
      serialized.updatedAt = user.updatedAt.toISOString();
    }
    res.json(serialized);
  });

  app.patch("/api/user", async (req, res, next) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const userId = (req.user as Express.User).id;
    const body = req.body as Record<string, unknown>;
    const updates: Partial<Pick<Express.User, "firstName" | "lastName" | "email" | "phoneNumber">> = {};
    if (typeof body.firstName === "string") updates.firstName = body.firstName;
    if (typeof body.lastName === "string") updates.lastName = body.lastName;
    if (typeof body.email === "string") updates.email = body.email;
    if (typeof body.phoneNumber === "string") updates.phoneNumber = body.phoneNumber;
    try {
      const updated = await storage.updateUser(userId, updates);
      const { password: _p, ...safe } = updated as Express.User & { password?: string };
      res.json({ ...safe, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt?.toISOString() });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Update failed" });
    }
  });

  app.post("/api/account/change-password", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) return res.sendStatus(401);
    const userId = (req.user as Express.User).id;
    const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    try {
      const user = await storage.getUser(userId);
      if (!user || !(await comparePasswords(currentPassword, user.password))) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      const hashed = await hashPassword(newPassword);
      await storage.setUserPassword(userId, hashed);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Failed to update password" });
    }
  });

  // Forgot password: send reset link to email
  app.post("/api/forgot-password", async (req, res) => {
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(200).json({ message: "If an account exists for that email, you will receive a reset link." });
      }
      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      await storage.createPasswordReset(user.id, tokenHash, expiresAt);
      const baseUrl = (process.env.PUBLIC_APP_URL || process.env.BASE_URL || "http://localhost:5000").replace(/\/$/, "");
      const resetLink = `${baseUrl}/reset-password?token=${rawToken}`;
      await sendPasswordResetEmail(user.email, resetLink);
      res.status(200).json({ message: "If an account exists for that email, you will receive a reset link." });
    } catch (e: any) {
      console.error("Forgot password error:", e?.message || e);
      const msg =
        process.env.NODE_ENV === "development" && e?.message
          ? e.message
          : "Something went wrong. Please try again.";
      res.status(500).json({ message: msg });
    }
  });

  // Reset password: validate token and set new password
  app.post("/api/reset-password", async (req, res) => {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const tokenHash = createHash("sha256").update(token).digest("hex");
    try {
      const reset = await storage.getPasswordResetByToken(tokenHash);
      if (!reset) {
        return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
      }
      if (reset.expiresAt < new Date()) {
        await storage.deletePasswordResetToken(tokenHash);
        return res.status(400).json({ message: "This reset link has expired. Please request a new one." });
      }
      const hashed = await hashPassword(newPassword);
      await storage.setUserPassword(reset.userId, hashed);
      await storage.deletePasswordResetToken(tokenHash);
      res.json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ message: e.message || "Failed to reset password" });
    }
  });

  // Google Identity Services - Verify ID token endpoint
  if (process.env.GOOGLE_CLIENT_ID) {
    console.log("✅ Google Identity Services configured");
    
    app.post("/api/auth/google/verify", async (req, res, next) => {
      try {
        const { OAuth2Client } = await import("google-auth-library");
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        const { credential } = req.body;
        if (!credential) {
          return res.status(400).json({ message: "No credential provided" });
        }

        // Verify the ID token
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          return res.status(400).json({ message: "Invalid token or no email provided" });
        }

        const email = payload.email;
        const firstName = payload.given_name;
        const lastName = payload.family_name;

        // Check if user exists by email
        let user = await storage.getUserByEmail(email);

        if (!user) {
          // Create new user from Google profile
          const username = email.split("@")[0] || `user_${Date.now()}`;
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
            firstName: firstName,
            lastName: lastName,
            role: "user",
          });
        }

        // Log the user in
        req.login(user, (err) => {
          if (err) return next(err);
          // Convert dates to ISO strings for JSON response
          const serialized = { ...user, createdAt: user.createdAt.toISOString() };
          if (user.updatedAt) {
            serialized.updatedAt = user.updatedAt.toISOString();
          }
          res.status(200).json(serialized);
        });
      } catch (err: any) {
        console.error("Google token verification error:", err);
        res.status(401).json({ message: err.message || "Failed to verify Google token" });
      }
    });
  } else {
    console.log("⚠️  Google Identity Services not configured - GOOGLE_CLIENT_ID required");
  }

  // Google OAuth routes (legacy redirect-based - kept for backward compatibility)
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
