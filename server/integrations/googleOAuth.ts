/**
 * Google Business Profile OAuth: build auth URL and exchange code for tokens.
 * Uses a separate OAuth client from sign-in (GOOGLE_GBP_* only). Scope: business.manage, access_type=offline, prompt=consent.
 */

const SCOPE = "https://www.googleapis.com/auth/business.manage";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";

const DEFAULT_GBP_CALLBACK = `${process.env.BASE_URL || "http://localhost:5000"}/api/integrations/google/callback`;

// Prefer GOOGLE_GBP_*; accept GOOGLE_BUSINESS_PROFILE_* as alternate names (same OAuth client)
function getGbpClientId(): string | undefined {
  return process.env.GOOGLE_GBP_CLIENT_ID || process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_ID;
}
function getGbpClientSecret(): string | undefined {
  return process.env.GOOGLE_GBP_CLIENT_SECRET || process.env.GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET;
}

export function getGoogleOAuthConfig(): { clientId: string; clientSecret: string; redirectUri: string } {
  const clientId = getGbpClientId();
  const clientSecret = getGbpClientSecret();
  const redirectUri =
    process.env.GOOGLE_GBP_REDIRECT_URI ||
    process.env.GOOGLE_REDIRECT_URI_GBP ||
    process.env.GOOGLE_GBP_CALLBACK_URL ||
    process.env.GOOGLE_BUSINESS_PROFILE_REDIRECT_URI ||
    process.env.GOOGLE_BUSINESS_PROFILE_CALLBACK_URL ||
    DEFAULT_GBP_CALLBACK;
  if (!clientId || !clientSecret) {
    const cwd = typeof process.cwd === "function" ? process.cwd() : "";
    throw new Error(
      `Google Business Profile OAuth credentials missing. Add to the .env file in your project root (where you run "npm run dev"): GOOGLE_GBP_CLIENT_ID=... and GOOGLE_GBP_CLIENT_SECRET=... Use your GBP OAuth client from Cloud Console → APIs & Services → Credentials (separate from sign-in). Project root: ${cwd}. Restart the server after editing .env.`
    );
  }
  return { clientId, clientSecret, redirectUri };
}

/**
 * Build the URL to send the user to for Google OAuth (Business Profile).
 * Uses prompt=consent to force refresh token on first connect or re-auth.
 */
export function buildAuthUrl(state: string, promptConsent: boolean = true): string {
  const { clientId, redirectUri } = getGoogleOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPE,
    access_type: "offline",
    state,
    ...(promptConsent ? { prompt: "consent" } : {}),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Exchange authorization code for access and refresh tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = getGoogleOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${err}`);
  }
  return res.json();
}

/**
 * Refresh access token using refresh token.
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const { clientId, clientSecret } = getGoogleOAuthConfig();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data?.error === "invalid_grant" || data?.error === "invalid_request"
      ? data.error
      : `refresh failed: ${res.status}`;
    throw new Error(err);
  }
  return { access_token: data.access_token, expires_in: data.expires_in ?? 3600 };
}
