# How to Run TapBack

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Firebase (required)

The app uses **Firebase Firestore**. You must provide credentials or the server will exit on startup.

**Easiest:** Put a service account key file in the project root:

- File name: `firebase-service-account.json`
- Get it from [Firebase Console](https://console.firebase.google.com/) → Project **tapback-232a1** (or your project) → Project settings → Service accounts → Generate new private key.

**Or** use an environment variable:

- `GOOGLE_APPLICATION_CREDENTIALS` = path to that JSON file, or  
- `FIREBASE_SERVICE_ACCOUNT` = the JSON content as a string.

See `FIREBASE_SETUP.md` for more options.

## 3. Optional environment variables

Create a `.env` in the project root if you want:

| Variable | Purpose |
|----------|---------|
| `PORT` | Server port (default: **5000**) |
| `SESSION_SECRET` | Session signing (default: revues_secret_key) |
| `OPENAI_API_KEY` or `AI_INTEGRATIONS_OPENAI_API_KEY` | Required for **AI review generation** (otherwise that feature will fail) |
| `OPENAI_MODEL` | Model name (default: gpt-4o-mini) |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | **Sign-in only** – "Sign in with Google" on login (optional) |
| `GOOGLE_GBP_CLIENT_ID` + `GOOGLE_GBP_CLIENT_SECRET` | **Google Business Profile only** – "Connect Google Business Profile" on Add Business (separate OAuth client) |
| `BASE_URL` | e.g. http://localhost:5000 (used for default callback URLs) |
| `GOOGLE_GBP_REDIRECT_URI`, `GOOGLE_REDIRECT_URI_GBP`, or `GOOGLE_GBP_CALLBACK_URL` | GBP callback URL (default: `BASE_URL/api/integrations/google/callback`) |
| `INTEGRATION_ENCRYPTION_KEY` | **Required for GBP.** 32+ chars or 64 hex — used to encrypt refresh tokens. Without it, "Connect Google Business Profile" will fail after you return from Google. Generate one: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_SIGNUP_CODE` | Secret code for creating admin accounts (default: admin-secret-2024) |

If you see **"Google Business Profile OAuth credentials missing"**: add `GOOGLE_GBP_CLIENT_ID` and `GOOGLE_GBP_CLIENT_SECRET` to `.env` (from your GBP OAuth client in Cloud Console). See `.env.example` for a template.

If you see **"INTEGRATION_ENCRYPTION_KEY must be set and at least 32 characters"**: add `INTEGRATION_ENCRYPTION_KEY` to `.env`. Run `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` to generate a 64-char hex value, then set `INTEGRATION_ENCRYPTION_KEY=<that value>` in `.env` and restart the server.

### Google Cloud Console – fix "redirect_uri_mismatch" (Error 400)

You use **two OAuth clients**: one for sign-in, one for Google Business Profile. Add the redirect URI to the **correct** client.

1. **Sign-in client** (GOOGLE_CLIENT_ID): **APIs & Services** → **Credentials** → that OAuth 2.0 Client ID → **Authorized redirect URIs** → add `http://localhost:5000/api/auth/google/callback`.
2. **GBP client** (GOOGLE_GBP_CLIENT_ID): **APIs & Services** → **Credentials** → that OAuth 2.0 Client ID → **Authorized redirect URIs** → add `http://localhost:5000/api/integrations/google/callback`.
3. Save each client. In production use `https://` and your domain (e.g. `https://yourapp.com/api/auth/google/callback` and `https://yourapp.com/api/integrations/google/callback`).

## 4. Run the app

**Development** (Express + Vite dev server, hot reload):

```bash
npm run dev
```

Then open: **http://localhost:5000**

**Production** (build first, then run):

```bash
npm run build
npm start
```

---

## Quick test without OpenAI

You can run with only Firebase set up. The app will start; the **customer review flow** will error when you click "Generate Review" if `OPENAI_API_KEY` is not set. You can still use signup, login, dashboard, create business, and QR page.

## Seed data (optional)

To add a demo user and business:

```bash
npx tsx server/seed.ts
```

- User: `demo_owner` / password: `password123`
- Business: "The Coffee Spot" with slug `the-coffee-spot` (review URL: `/r/the-coffee-spot`)

---

## Google Business Profile integration – manual test checklist

1. **Connect** – Go to Add Business; click "Connect Google Business Profile"; complete OAuth; return to Add Business and confirm "Connected to Google" and location list load.
2. **Select location** – Choose at least one location; confirm "Add Business" becomes enabled.
3. **Create business** – Click "Add Business"; confirm redirect to dashboard and new business(es) appear.
4. **Duplicate** – Try adding the same location again; confirm "This location is already added." and submit blocked.
5. **Token longevity** – Use the app (e.g. sync reviews, reply); wait 1+ hour (or revoke access token in DB for a quick test); trigger an action that calls Google (e.g. open Add Business and load locations); confirm it still works via refresh token (no reconnect prompt unless refresh token is invalid/revoked).
