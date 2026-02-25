# TapBack / RevsBoost — Project Summary

This document gives a full overview of the project so any contributor or AI (e.g. Gemini) can understand structure, pages, flows, and constraints.

---

## 1. What the app is

- **Product name:** RevsBoost (marketing); codebase is TapBack.
- **Purpose:** Google review collection and management for businesses. Business owners connect a Google Business Profile (GBP), get a unique review link and QR code, and customers who scan the QR (or open the link) land on a **customer review flow** where they can leave a “great” experience (with an AI-suggested draft to copy to Google) or submit a **private concern** to management.
- **Single source of truth:** All edits for this product are made in **this repo only** (Desktop TapBack). No duplication in other workspaces.

---

## 2. Tech stack

- **Frontend:** React, Vite, TypeScript, TanStack Query, wouter (routing), Tailwind CSS, Radix UI, Plus Jakarta Sans.
- **Backend:** Node.js, Express, TypeScript (tsx in dev). Session-based auth.
- **Database:** Firebase Firestore (primary). No Drizzle in use for main app data.
- **APIs:** Google (sign-in + Google Business Profile), OpenAI (review draft generation).
- **Routing:** wouter. Use **`useLocation()`** and **`setLocation(path)`** for navigation — there is no `useNavigate` in wouter.

---

## 3. Users and flows

- **Business owner (logged in):** Dashboard → businesses → per-business: Settings, Review Options, QR, Posters, Insights, Reviews & Concerns. They connect GBP, customize review page theme, get QR/posters, view Google reviews and in-app feedback.
- **Customer (no login):** Scans QR or opens link → **`/r/:slug`** (e.g. `/r/clinimedia`) → single-page review flow: “Review us on Google” → “How was your experience?” → **It was Great!** (tags + AI draft → copy & post to Google) or **I have concerns** (private form; optional link to “Post a public review (any rating)”).
- **Admin:** `/admin/*` — overview, businesses, users, system errors, feature flags, settings. Some routes are “coming soon” (integrations, billing, jobs).

---

## 4. All routes and pages

### Public (no auth)

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Marketing landing |
| `/how-it-works` | HowItWorks | Product explanation |
| `/features` | Features | Feature list |
| `/insights` | Insights | **Marketing** insights page (not the per-business Insights tab) |
| `/pricing` | Pricing | Plans and pricing |
| `/about` | About | About the company |
| `/articles` | Articles | Blog listing |
| `/articles/:slug` | ArticleDetail | Single article |
| `/contact` | Contact | Contact form |
| `/privacy` | Privacy | Privacy policy |
| `/terms` | Terms | Terms of service |
| `/login` | AuthPage (login) | Login |
| `/signup` | AuthPage (signup) | Sign up |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Set new password |

### App (auth required)

| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | List of user’s businesses; each card can show Google review count, link to business |
| `/settings` | Settings | User account settings |
| `/business/new` | CreateBusiness | Add business: connect GBP, pick location, set name/slug/category etc. |
| `/business/:slug/qr` | BusinessQR | QR code for that business’s review link |
| `/business/:slug` | BusinessDetails | **Main business hub** — tabbed: Settings, Review Options, QR, Posters, Insights, Reviews & Concerns |
| `/business/:slug/settings` | BusinessDetails (tab) | Business name, slug, category, logo, Google review URL, delete business |
| `/business/:slug/review-options` | BusinessDetails (tab) | Focus areas (tags), review page theme, live preview of customer flow |
| `/business/:slug/qr` | BusinessQR | Dedicated QR page (also a tab inside BusinessDetails) |
| `/business/:slug/posters` | BusinessDetails (tab) | Poster/QR templates: counter card, poster, table tent, stickers; customize headline, subheadline, export PNG |
| `/business/:slug/insights` | BusinessDetails (tab) | **Insights:** Google reviews for this location (stars, reviewer name, date, comment, **your reply**), sort (newest/oldest/highest/lowest), reviewer profile pics when API returns them. Requires GBP linked and My Business API enabled. |
| `/business/:slug/feedback` | BusinessDetails (tab) | **Reviews & Concerns:** In-app reviews (great/concern) from the review link + Google reviews block; filters (all / concerns only / great only), date range, sort; concerns notification email |

### Customer review flow (no auth, no app header)

| Path | Page | Description |
|------|------|-------------|
| `/r/:slug` | ReviewLanding | **Only page customers see** after scanning QR. Layout: ReviewFlowLayout (“Review us on Google”, “Love your experience? Share it on Google — you post directly.”, stars). Card: “How was your experience at {business}?” → “Your review helps others. You choose your rating when you post on Google.” → [It was Great! \| I have concerns]. **Great path:** What stood out (tags) + optional extra text → “Suggest a draft” → AI draft (editable) → “Copy & Post on Google” + “Suggest a different draft”. **Concern path:** Private form (name, phone, email, message) + “Send feedback”, “Post a public review instead (any rating)”, “← Back” (big button). |
| `/r/:slug/review` | Redirect | Redirects to `/r/:slug` |
| `/r/:slug/feedback` | Redirect | Redirects to `/r/:slug` |

### Admin

| Path | Page |
|------|------|
| `/admin` | Redirect to `/admin/overview` |
| `/admin/overview` | AdminOverview |
| `/admin/businesses` | ManageBusinesses |
| `/admin/businesses/:businessId` | AdminBusinessDetail |
| `/admin/users` | ManageUsers |
| `/admin/integrations/google` | ComingSoonPage |
| `/admin/billing/subscriptions` | ComingSoonPage |
| `/admin/system/jobs` | ComingSoonPage |
| `/admin/system/errors` | AdminSystemErrors |
| `/admin/system/feature-flags` | AdminFeatureFlags |
| `/admin/settings` | AdminSettings |

---

## 5. Customer review flow in detail (what the customer sees)

- **URL:** `https://<origin>/r/<business-slug>` (e.g. `/r/clinimedia`). QR code points here.
- **Layout:** `ReviewFlowLayout` — no main app header; header “Review us on Google” (Google-colored), subline “Love your experience? Share it on Google — you post directly.”, 5 stars; footer “Want this for your business?” (RevsBoost).
- **Card (theme from business.reviewTheme):** “How was your experience at **{business.name}**?” → “Your review helps others. You choose your rating when you post on Google.” → Two buttons: **It was Great!** | **I have concerns**.

  - **If Great:** Step 2 “What stood out?” — tags (from category + focus areas) + “Help others know what you loved — pick any (optional).” + optional text area → **Suggest a draft** → AI generates a draft (max 3: 1 initial + 2 regenerations). Step 3 “Copy & post to Google” — “Here’s a suggested draft”, “Your review helps others. Edit with your own words and post on Google — you choose your rating.”, editable textarea, **Copy & Post on Google** (opens `business.googleReviewUrl` + copies to clipboard), **Suggest a different draft**.

  - **If I have concerns:** “Tell us what went wrong — this goes privately to management.”, shield “Private — not posted publicly”, form (Name, Phone, Email, Message), **Send feedback** (POST in-app, no Google), link “Post a public review instead (any rating)”, **← Back** (prominent button).

- **Google policy alignment:** No incentives; “genuine experience” and “you post directly”; draft is “suggested” / “your own words”; “you choose your rating” and “any rating” on concern path. See RUN.md “Google review policy alignment”.

---

## 6. Insights and Reviews & Concerns (business owner)

- **Insights tab** (`/business/:slug/insights`): Shows **Google reviews** for the linked GBP location: average rating, total count, sort (Newest first, Oldest first, Highest rated, Lowest rated). Each review: reviewer photo (if API provides), name, stars, date, comment, **your reply** (if any). If GBP not linked or My Business API not enabled, shows setup/error copy and link to enable API (one-time in the app’s Cloud project).
- **Reviews & Concerns tab** (`/business/:slug/feedback`): Two blocks: (1) **Google reviews** (same as Insights, compact list) and (2) **In-app feedback** — list of reviews from the review link (experienceType: great vs concern), with filters (all / concerns only / great only), date range, sort. “Receive concerns at” email for notifications. Data from Firestore `reviews` (businessId, experienceType, content, customerName, etc.) and from GBP API for Google block.

---

## 7. Key backend / API points

- **Auth:** Session-based; `requireAuth` middleware; login/signup, optional Google sign-in.
- **Businesses:** CRUD; `GET /api/businesses`, `GET /api/businesses/:id`, `GET /api/businesses/slug/:slug`, `PATCH`, `POST`, `DELETE` (delete business removes business and its reviews/links).
- **Google Business Profile:** OAuth (GBP client), token storage (encrypted), `listAccounts`, `listLocations`, `listLocationReviews` (v4). Location resource name must be full path `accounts/.../locations/...` for reviews.
- **Google reviews:** `GET /api/businesses/:id/google-reviews` → returns reviews (reviewerDisplayName, reviewerProfilePhotoUrl when available, starRating, comment, createTime, updateTime, reviewReply).
- **In-app reviews:** `GET /api/businesses/:id/reviews`, `POST /api/reviews` (for concern/great from customer flow).
- **AI review draft:** `POST /api/generate-review` (businessId, tags, experienceType: "great", customText, variation). Uses OpenAI.
- **Stats:** `GET /api/businesses/:id/stats` (scans, reviewsGenerated, redirects, concerns) for dashboard/insights.

---

## 8. Important files (for context)

- **Routes:** `client/src/App.tsx` (all Route paths).
- **Customer flow:** `client/src/pages/review/ReviewLanding.tsx`, `client/src/components/ReviewFlowLayout.tsx`, `client/src/lib/reviewThemes.ts` (themes: classic, modern-bold, clean-clinic, warm-friendly, dark-luxe, fresh-minimal).
- **Business hub:** `client/src/pages/BusinessDetails.tsx` (tabs: settings, review-options, qr, posters, insights, feedback).
- **Dashboard:** `client/src/pages/Dashboard.tsx`.
- **Google reviews client:** `server/integrations/googleGbpClient.ts` (listLocationReviews, resolveFullLocationName).
- **Storage:** `server/storage.ts` (businesses, reviews, Google links).
- **Run/setup:** `RUN.md` (env, Firebase, Google APIs, Google review policy alignment).

---

## 9. Conventions and gotchas

- **Navigation:** Use `useLocation()` and `setLocation(path)` (wouter). No `useNavigate`.
- **Delete business:** Implemented; uses `ConfirmDeleteBusinessDialog` and `useDeleteBusiness`; redirect after delete via `setLocation("/dashboard")` or `onDeleted` callback.
- **Review flow styling:** Themed by `business.reviewTheme`; Plus Jakarta Sans; “Review us on Google” and card copy are tuned for clarity and Google policy.
- **Slug:** Each business has a `slug`; review URL is `/r/:slug`; `useBusinessBySlug(slug)` loads business for the customer flow.
- **Port:** Default 5000; override with `PORT` in `.env`. If you see EADDRINUSE, another process is using the port — kill it or change PORT.

---

## 10. Summary for AI (Gemini, etc.)

- **App:** RevsBoost/TapBack — Google review collection and management; business owners connect GBP, get QR/link; customers go to `/r/:slug` and choose “Great” (AI draft → copy to Google) or “Concern” (private form).
- **Pages:** Public marketing (/, pricing, about, …), app (dashboard, business/:slug with tabs: settings, review-options, qr, posters, insights, feedback), customer flow (`/r/:slug` only), admin (/admin/*).
- **Insights:** Per-business tab showing Google reviews (and owner reply); requires GBP linked and My Business API enabled.
- **Concerns:** Private feedback path on `/r/:slug` (“I have concerns” → form); stored in-app; shown in business “Reviews & Concerns” tab with filters.
- **Google:** No incentives; “genuine experience,” “you post directly,” “suggested draft,” “you choose your rating,” “any rating” for public review option; RUN.md has policy alignment notes.

Use this summary plus RUN.md and the listed files to reason about the codebase and suggest or implement changes.
