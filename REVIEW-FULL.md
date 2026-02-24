# TapBack — Full Directory-by-Directory Review

This document is a file-by-file, directory-by-directory review of the TapBack codebase (excluding `node_modules`, `.poster-cache`, `.local`).

---

## Project root

| File | Purpose | Notes |
|------|--------|------|
| **package.json** | Scripts: `dev` (tsx server), `build`, `start`, `check`, `db:push`. Dependencies: React 18, Vite, Express 5, Drizzle, Passport, Firebase Admin, TanStack Query, Radix UI, OpenAI, etc. | Monorepo-style single package. `nanoid` used by server/vite.ts and script/build.ts is a transitive dependency. |
| **tsconfig.json** | TypeScript: strict, ESNext, paths `@/*` → client/src, `@shared/*` → shared. | Includes client, shared, server. |
| **vite.config.ts** | Vite config: React plugin, aliases (@, @shared, @assets), root = client, build outDir = dist/public. Replit plugins loaded only when REPL_ID set. | Dev-only Replit plugins; local runs without them. |
| **tailwind.config.ts** | Tailwind: content from client, darkMode class, extended colors (background, primary, chart, sidebar, status), typography plugin. | Uses CSS variables for theming. |
| **drizzle.config.ts** | Drizzle Kit: schema path `./shared/schema.ts`, dialect PostgreSQL, DATABASE_URL. | **Note:** App uses Firestore (server/db.ts), not Postgres. This config may be legacy or for a future/optional DB. shared/schema.ts is Zod-only (no pgTable). |
| **postcss.config.js** | PostCSS config. | Standard for Tailwind. |
| **components.json** | shadcn/ui config: style new-york, tailwind baseColor neutral, aliases. | Used for UI component generation. |
| **.gitignore** | Ignores node_modules, dist, .env, .env.local, .poster-cache, firebase-service-account.json, .local. | .env and secrets correctly ignored. |
| **.env.example** | Example env vars. | Template only; not committed. |
| **RUN.md** | How to run: install, Firebase setup, env vars, dev/prod, seed. | Clear; documents SESSION_SECRET, ADMIN_SIGNUP_CODE, GBP, INTEGRATION_ENCRYPTION_KEY. |
| **FIREBASE_SETUP.md** | Firebase setup instructions. | Referenced from RUN.md. |
| **SCHEMA_IMPROVEMENTS.md** | Schema notes. | Documentation. |
| **.replit** | Replit project config. | For Replit deployment. |

---

## shared/

| File | Purpose | Notes |
|------|--------|------|
| **schema.ts** | Zod schemas and types: User, Business, Review, GoogleIntegration, GoogleLocationLink; internal (Date) vs API (string dates); COLLECTIONS; ExperienceType, UserRole. | Single source of truth for domain types and validation. Business has optional totalReviews, totalConcerns, etc. |
| **routes.ts** | API route definitions: paths, methods, input/response Zod schemas; `buildUrl(path, params)`. Used by client and server. | Central API contract. errorSchemas for validation/notFound/unauthorized. |
| **models/chat.ts** | Drizzle pgTable definitions: conversations, messages. createInsertSchema, types. | **Note:** Not used by main app (app uses Firestore). Likely for a chat feature or legacy; no references in server routes/storage. |

---

## server/

### Root

| File | Purpose | Notes |
|------|--------|------|
| **index.ts** | Loads dotenv from app root, warns if GBP/INTEGRATION_ENCRYPTION_KEY missing. Creates Express app, json (2mb for logos), urlencoded. Request logging for /api. Verifies Firestore, then registerRoutes, then static or Vite dev. Listens on PORT (default 5000). | Firebase health check before routes. Windows: host localhost, no reusePort. |
| **routes.ts** | Registers: setupAuth, registerBusinessRoutes, registerIntegrationRoutes, registerReviewRoutes, registerAdminRoutes, registerPosterRoutes; then errorHandler. | Auth first, then feature routes, global error handler last. |
| **db.ts** | Firebase Admin init: GOOGLE_APPLICATION_CREDENTIALS → FIREBASE_SERVICE_ACCOUNT → firebase-service-account.json. getFirestore, collections (users, businesses, reviews, googleIntegrations, googleLocationLinks, passwordResets). | Throws if no credentials. Index recommendations in comments. |
| **auth.ts** | Passport (local + Google OAuth), express-session (httpOnly, secure in prod, memory store). register, login, logout, GET /api/user, PATCH user, change-password, forgot-password, reset-password, Google verify (One Tap), Google OAuth routes. | **Security:** SESSION_SECRET and ADMIN_SIGNUP_CODE default warnings in production added. Scrypt + timing-safe compare for passwords. |
| **storage.ts** | IStorage implementation over Firestore: users, password resets, businesses, reviews, Google integration, location links. MemorySessionStore for sessions. getNextId by scanning collection. getStats: scans heuristic (reviews*3 + random), real counts for reviewsGenerated/redirects/concerns. | Session store in-memory (not multi-instance safe). getStats scans documented as placeholder. |
| **email.ts** | Nodemailer transporter (SMTP_*). sendPasswordResetEmail, sendNewConcernNotification. Logo attachment from client/public or public. | If SMTP not set, logs reset link in dev. |
| **seed.ts** | Seeds Firestore: demo user, business, reviews. Uses db + collections directly, hashed password. | Only runs if users collection empty. |
| **static.ts** | Serves dist/public static files; SPA fallback to index.html. | Used in production after build. |
| **vite.ts** | Vite middleware mode for dev; HMR; catch-all serves transformed index.html (nanoid cache bust). | nanoid from transitive dep (e.g. vite). |
| **passport-google-oauth20.d.ts** | Type declaration for passport-google-oauth20. | Typing for Google strategy. |

### server/middleware/

| File | Purpose | Notes |
|------|--------|------|
| **auth.ts** | requireAuth (401 if not authenticated), requireAdmin (401 then 403 if not admin), requireOwnership(getOwnerId) (401 then 403 if ownerId !== user.id). | Used by businesses, integrations, posters, admin. |
| **errorHandler.ts** | Central error handler: ZodError → 400 with errors; err.status/statusCode → res.status; logs error. asyncHandler(fn) wraps async routes and forwards rejections to next. | Prevents unhandled rejections. |

### server/utils/

| File | Purpose | Notes |
|------|--------|------|
| **serialize.ts** | serializeDates(obj): recurses objects/arrays, converts Date to ISO string. | Used by route handlers for JSON responses. Does not handle circular refs. |
| **db.ts** | requireDb(): throws if db not initialized. | Compatibility helper; Firestore from db.ts. |

### server/routes/

| File | Purpose | Notes |
|------|--------|------|
| **businesses.ts** | POST create (requireAuth, from GBP), GET list (requireAuth), GET get by id (public), GET get by slug (public), PATCH update (requireAuth + ownership), GET stats (requireAuth), GET listReviews (requireAuth + ownership). serializeDates on responses. | Get by id/slug intentionally public (e.g. review landing). Create returns GOOGLE_NOT_CONNECTED, NO_LOCATION_SELECTED, LOCATION_ALREADY_ADDED. |
| **integrations.ts** | GET status, GET start (requireAuth, sets session state), GET callback (validates state + userId, exchanges code, stores tokens), POST disconnect, GET locations (requireAuth, listAllLocations), POST locations/select. | Callback uses (req.session as any) for Google state; consider extending session type. |
| **reviews.ts** | POST create (public — customer review flow; sends concern email if configured), POST generateAI (public; 404 if business not found). | **Note:** generateAI is unauthenticated; anyone with businessId can trigger OpenAI. Consider rate limit or token. |
| **admin.ts** | GET users, businesses, reviews, stats — all requireAuth + requireAdmin. Serializes Firestore docs (id, dates to ISO). | Direct Firestore reads; no ownership filter (admin sees all). |
| **posters.ts** | All requireAuth + ensureBusinessAndOwnership. GET templates, GET preview html/image, GET download pdf/png (optional cache). buildPosterData uses business.logo ?? business.logoUrl. | Origin from req for QR URL; trust proxy set in auth for prod. |

### server/integrations/

| File | Purpose | Notes |
|------|--------|------|
| **googleOAuth.ts** | getGoogleOAuthConfig (GOOGLE_GBP_* or GOOGLE_BUSINESS_PROFILE_*), buildAuthUrl(state, promptConsent), exchangeCodeForTokens(code), refreshAccessToken(refreshToken). | Uses business.manage scope, offline access. |
| **googleTokenService.ts** | getValidAccessToken(userId): refresh if expired; on invalid_grant sets needs_reauth. storeTokensFromCallback: encrypts refresh token, upserts integration. | 120s expiry buffer. Keeps existing refresh token if Google doesn’t return new one. |
| **googleGbpClient.ts** | listAccounts(userId), listLocations(userId, accountName). Uses getValidAccessToken, retries on 401. | My Business Account Management + v4 APIs. |
| **tokenCrypto.ts** | AES-256-GCM encrypt/decrypt for refresh tokens. INTEGRATION_ENCRYPTION_KEY required (32+ chars or 64 hex). | Derives key from env; used by googleTokenService. |

### server/services/

| File | Purpose | Notes |
|------|--------|------|
| **openai.ts** | Lazy OpenAI client (OPENAI_API_KEY or AI_INTEGRATIONS_OPENAI_API_KEY). generateReview(params): prompt for 2–5 sentence review, tags, experienceType; variation for regeneration. | Throws if no API key. Model from OPENAI_MODEL (default gpt-4o-mini). |

### server/posters/

| File | Purpose | Notes |
|------|--------|------|
| **types.ts** | PosterData (businessName, logoUrl, qrUrl, qrDataUrl, ctaLine, website, phone). PaperSize, PosterRenderOptions, TemplateMetadata. escapeHtml, truncateName. | All user strings must be escaped in templates. |
| **templateRegistry.ts** | Registers 10 templates (minimal-professional, google-corners, modern-cafe, etc.). listTemplates, getTemplateMetadata, renderTemplate. | Each template: metadata + render(data, options). |
| **renderer.ts** | renderToPdf, renderToPng (Playwright; HTML to PDF/PNG). | Browser-based rendering. |
| **qr.ts** | generateQrDataUrl(url). | QR code data URL for embedding. |
| **cache.ts** | getCachedPath, readCached, writeCached for poster outputs. | File-based cache. |
| **designSystem.ts** | Design tokens for poster templates. | Shared by templates. |
| **templates/*.ts** | One file per template (minimal-professional, dark-premium, elegant-boutique, etc.): metadata + render function returning HTML. | Each uses PosterData, escapeHtml, designSystem. |

### server/replit_integrations/

| Directory | Purpose | Notes |
|-----------|--------|------|
| **audio/** | client.ts, index.ts, routes.ts — audio playback/recording routes. | Optional Replit integration. |
| **batch/** | index.ts, utils.ts. | Batch processing. |
| **chat/** | index.ts, routes.ts, storage.ts. | Chat feature; may use shared/models/chat. |
| **image/** | client.ts, index.ts, routes.ts. | Image integration. |

---

## client/

### Root

| File | Purpose | Notes |
|------|--------|------|
| **index.html** | Root HTML, viewport, fonts, Google GSI script, root div, /src/main.tsx. | Favicon revsboost-logo.png. |
| **requirements.md** | Client requirements doc. | Product/UX notes. |
| **public/** | favicon.png, revsboost-logo.png, tapback-logo.png. | Static assets. |

### client/src/

| File | Purpose | Notes |
|------|--------|------|
| **main.tsx** | createRoot, renders App, imports index.css. | Standard React entry. |
| **App.tsx** | QueryClientProvider, TooltipProvider, Header (hidden on /r/*), Router (wouter). Routes: Home, HowItWorks, Features, Insights, Pricing, About, Articles, Contact, Privacy, Terms, Auth, Forgot/Reset password, Dashboard, Admin (overview, businesses, users, etc.), Settings, CreateBusiness, BusinessQR, BusinessDetails, /r/:slug (ReviewLanding), RedirectToReviewSlug for old /review and /feedback, NotFound. AdminRoute wraps admin pages with AdminLayout. ScrollToTop on location change. | Comprehensive routing. Admin redirects /admin → /admin/overview. |
| **index.css** | Global CSS, Tailwind, CSS variables (e.g. --background, --primary). | Theme variables. |
| **styles/landing-tokens.css** | Landing-page-specific CSS variables. | Used by landing/marketing. |

### client/src/hooks/

| File | Purpose | Notes |
|------|--------|------|
| **use-auth.ts** | useUser (GET /api/user, credentials include, 401 → null), useLogin, useRegister, useLogout. On success invalidates/removes businesses and /api/businesses queries. | Session-based; credentials: "include" on all. |
| **use-businesses.ts** | useBusinesses (list, enabled when user), useBusiness(id), useBusinessBySlug(slug), useBusinessStats(id), useBusinessReviews(businessId), useCreateBusiness, useUpdateBusiness. credentials: "include" on all (fixed in prior review). | List enabled: !!user. Create exposes alreadyAdded on error. |
| **use-reviews.ts** | useGenerateReview (POST generateAI), useCreateReview (POST create, invalidates listReviews). | No credentials on create/generate (public endpoints). |
| **use-google-integration.ts** | useGoogleIntegrationStatus, useGoogleLocations(enabled), useSelectGoogleLocations, useDisconnectGoogle. All credentials include. | Status and locations keys for cache. |
| **use-toast.ts** | Toast hook (likely around sonner/Radix toast). | UI feedback. |
| **use-mobile.tsx** | Detects mobile viewport (e.g. for sidebar/drawer). | Responsive behavior. |

### client/src/lib/

| File | Purpose | Notes |
|------|--------|------|
| **api.ts** | ApiError class. fetchApi with credentials + JSON. apiClient: register, login, logout, getCurrentUser, createBusiness, listBusinesses, getBusiness, getBusinessBySlug, updateBusiness, getBusinessStats, createReview, generateReview. | Centralized API client; all with credentials. |
| **queryClient.ts** | apiRequest, getQueryFn (on401 returnNull or throw), QueryClient with default staleTime Infinity, retry false. | Default queryFn is getQueryFn({ on401: "throw" }); hooks override per-query. |
| **featureFlags.ts** | FeatureFlagKey (google_integration_enabled, billing_enabled, etc.), localStorage persistence, getFlag, setFlag, getAllFlags, setAllFlags, invalidateFlagsCache. | Admin-only flags; defaults false. |
| **utils.ts** | cn(...inputs) — clsx + tailwind-merge. | Class name helper. |
| **categoriesAndTags.ts** | CATEGORIES list, CATEGORY_DEFAULT_TAGS (5 per category), optional extras. | Used in business settings and review flow. |
| **reviewThemes.ts** | ReviewThemeId, ReviewTheme (colors, card, buttonVariant), REVIEW_THEMES map. | For /r/:slug theming. |
| **logoToTransparent.ts** | Utility for logo image processing. | Used for logo upload/display. |

### client/src/content/

| File | Purpose | Notes |
|------|--------|------|
| **homeCopy.ts** | Copy for home/landing: brand, nav, etc. | Centralized marketing text. |

### client/src/data/

| File | Purpose | Notes |
|------|--------|------|
| **mockActivity.ts** | Mock activity data. | Demos or placeholders. |
| **mockErrors.ts** | Mock error data. | Demos or placeholders. |

### client/src/pages/

| File | Purpose | Notes |
|------|--------|------|
| **Home.tsx** | Landing/home page. | Marketing. |
| **Auth.tsx** | Login/signup form; Google One Tap if VITE_GOOGLE_CLIENT_ID; mode = login \| signup. | Uses useUser, useLogin, useRegister. |
| **Dashboard.tsx** | Redirect if !user; loading skeleton; DashboardInsights (reviews, concerns, locations, “This month” placeholder); BusinessList + BusinessCard. | Typed with Business from @shared/schema (prior review). |
| **CreateBusiness.tsx** | Add business flow: Google integration status, connect GBP, select locations, create. | Uses useGoogleIntegrationStatus, useGoogleLocations, useCreateBusiness. |
| **BusinessDetails.tsx** | Business settings/details; BusinessLayout; tabs: settings, review-options, qr, posters, insights, feedback. | Uses useBusinessBySlug, useUpdateBusiness. |
| **BusinessQR.tsx** | QR code display and download for a business. | Uses useBusinessBySlug. |
| **BusinessPosters.tsx** | Poster templates and download (PDF/PNG). | Uses poster API with businessId. |
| **Settings.tsx** | User account settings. | Uses useUser, profile update. |
| **Insights.tsx** | Insights page (may be marketing or app). | Content. |
| **Landing.tsx** | Alternative or main landing. | Marketing. |
| **ForgotPassword.tsx** | Forgot password form; calls /api/forgot-password. | Email-based reset. |
| **ResetPassword.tsx** | Reset password form (token from query); calls /api/reset-password. | Token + newPassword. |
| **Pricing.tsx** | Pricing page. | Marketing. |
| **About.tsx** | About page. | Marketing. |
| **Features.tsx** | Features page. | Marketing. |
| **HowItWorks.tsx** | How it works. | Marketing. |
| **Articles.tsx** | Articles list. | Marketing. |
| **ArticleDetail.tsx** | Single article by slug. | Marketing. |
| **Contact.tsx** | Contact page. | Marketing. |
| **Privacy.tsx** | Privacy policy. | Legal. |
| **Terms.tsx** | Terms of service. | Legal. |
| **not-found.tsx** | 404 component. | Fallback route. |
| **AdminDashboard.tsx** | Admin dashboard (if used; App uses AdminOverview). | Admin. |
| **admin/AdminOverview.tsx** | Admin overview/stats. | requireAdmin. |
| **admin/ManageUsers.tsx** | List/edit users. | requireAdmin. |
| **admin/ManageBusinesses.tsx** | List businesses (Business type). | requireAdmin. |
| **admin/AdminBusinessDetail.tsx** | Single business detail (admin). | requireAdmin. |
| **admin/AdminSystemErrors.tsx** | System errors UI. | requireAdmin. |
| **admin/AdminFeatureFlags.tsx** | Feature flags toggle. | requireAdmin. |
| **admin/AdminSettings.tsx** | Admin settings. | requireAdmin. |
| **admin/ComingSoonPage.tsx** | Placeholder for gated features (flag). | Admin. |
| **review/ReviewLanding.tsx** | Customer review flow at /r/:slug: business by slug, theme, steps (experience, tags, generate/submit). | Public; uses useBusinessBySlug, useGenerateReview, useCreateReview. |
| **review/ReviewFeedback.tsx** | Feedback step (if separate). | Review flow. |
| **review/ReviewGenerator.tsx** | AI review generation UI. | Review flow. |

### client/src/components/

| File | Purpose | Notes |
|------|--------|------|
| **Header.tsx** | Nav: brand, links; user menu (dashboard, admin if admin, logout). Hidden on /r/*. Scroll style change. | Uses useUser, useLogout, homeCopy. |
| **AdminRoute.tsx** | Guard: loading skeleton, redirect to /login if !user, to /dashboard if !admin. | Wraps all admin routes in App. |
| **BusinessLayout.tsx** | AppShell + tab bar (Settings, Review Options, QR, Posters, Insights, Reviews & Concerns). | Uses slug and business name/category. |
| **CustomerSidebar.tsx** | Sidebar for customer-facing flow. | Review flow. |
| **ReviewFlowLayout.tsx** | Layout for review flow pages. | Review flow. |
| **ReviewCard.tsx** | Single review display. | UI. |
| **LandingNavbar.tsx** | Landing navbar. | Marketing. |
| **LandingFooter.tsx** | Landing footer. | Marketing. |
| **LaptopMockup.tsx** | Device mockup. | Marketing. |
| **PricingCard.tsx** | Pricing tier card. | Marketing. |
| **PricingFAQ.tsx** | Pricing FAQ. | Marketing. |
| **app/AppShell.tsx** | App shell (sidebar/layout for dashboard). | Layout. |
| **app/AppCard.tsx** | Card styling. | UI. |
| **app/EmptyState.tsx** | Empty state message + CTA. | UI. |
| **app/GoogleStars.tsx** | Google stars visual. | UI. |
| **app/PageHeader.tsx** | Page title/header. | UI. |
| **app/StatusBadge.tsx** | Status badge. | UI. |
| **admin/AdminLayout.tsx** | Admin layout/sidebar. | Admin. |
| **admin/FeatureGate.tsx** | Feature gate by flag. | Admin. |
| **settings/ColorPickerField.tsx** | Color picker. | Settings. |
| **settings/IntegrationStatusRow.tsx** | Integration status row. | Settings. |
| **settings/LogoUploader.tsx** | Logo upload. | Settings. |
| **settings/SaveButtonRow.tsx** | Save button row. | Settings. |
| **settings/SettingsSection.tsx** | Settings section wrapper. | Settings. |
| **settings/index.ts** | Settings exports. | Barrel. |
| **slides/DashboardSlide.tsx** | Slide content (e.g. onboarding). | Slides. |
| **slides/InsightsSlide.tsx** | Insights slide. | Slides. |
| **slides/QRTemplatesSlide.tsx** | QR templates slide. | Slides. |
| **slides/ReviewFlowSlide.tsx** | Review flow slide. | Slides. |
| **ui/*.tsx** | Radix-based UI primitives (accordion, alert, button, card, dialog, dropdown, input, tabs, toast, etc.). | shadcn/ui style; ~35 components. |

### client/replit_integrations/audio/

| File | Purpose | Notes |
|------|--------|------|
| **audio-playback-worklet.js** | Audio worklet. | Replit audio. |
| **audio-utils.ts**, **index.ts** | Audio utilities and exports. | |
| **useAudioPlayback.ts**, **useVoiceRecorder.ts**, **useVoiceStream.ts** | Audio hooks. | |

---

## script/

| File | Purpose | Notes |
|------|--------|------|
| **build.ts** | Build script (references nanoid). | Used by npm run build. |

---

## Summary of findings

### Security
- **Auth:** SESSION_SECRET and ADMIN_SIGNUP_CODE default warnings in production (auth.ts). Set both in production.
- **Reviews:** POST /api/reviews and POST /api/generate-review are public (by design for customer flow). generateAI can be called by anyone with a businessId; consider rate limiting or CAPTCHA/token to limit abuse/cost.
- **Business get by id/slug:** Public; appropriate for review landing. If you add sensitive fields, consider a separate public DTO or auth.

### Consistency
- **Credentials:** All session-based API calls on client use `credentials: "include"` (use-businesses, use-auth, use-google-integration, api.ts, queryClient).
- **Types:** Dashboard uses `Business` from @shared/schema; AdminRoute and layouts are typed.

### Optional improvements
- **drizzle.config.ts** points at shared/schema.ts but app uses Firestore; shared/schema is Zod-only. Remove or repurpose Drizzle config if not using Postgres.
- **shared/models/chat.ts** (Drizzle) is unused by main app; remove or wire to chat feature.
- **Express session:** Extend type for `googleIntegrationState`, `googleIntegrationReturnUserId` to avoid `(req.session as any)`.
- **Posters:** Unify business logo field (logo vs logoUrl) in schema and buildPosterData.
- **Feature flags:** Stored in localStorage; admin-only. For multi-device or server-driven flags, consider API + DB.

### Infrastructure
- **Session store:** In-memory; not shared across processes. For production scale-out, use a persistent session store (e.g. Redis).
- **getStats scans:** Placeholder heuristic; document or replace with real scan/redirect tracking when available.

---

*Generated from a full directory-by-directory, file-by-file review of the TapBack codebase.*
