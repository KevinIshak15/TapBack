/**
 * Ensures we always have a valid access token: refresh if expired or on 401.
 * Never wipes existing refresh_token if Google doesn't return a new one.
 */

import { storage } from "../storage";
import { encryptRefreshToken, decryptRefreshToken } from "./tokenCrypto";
import { refreshAccessToken } from "./googleOAuth";

const EXPIRY_BUFFER_SECONDS = 120;

export type TokenResult =
  | { ok: true; accessToken: string }
  | { ok: false; needsReauth: true; message?: string };

/**
 * Get a valid access token for the user. Refreshes if expiresAt < now + 120s.
 * On refresh failure (invalid_grant or missing refresh token), marks integration as needs_reauth.
 */
export async function getValidAccessToken(userId: number): Promise<TokenResult> {
  const integration = await storage.getGoogleIntegration(userId);
  if (!integration) {
    return { ok: false, needsReauth: true, message: "Google not connected" };
  }
  if (integration.status === "needs_reauth") {
    return { ok: false, needsReauth: true, message: "Google connection expired or revoked" };
  }
  if (!integration.encryptedRefreshToken) {
    await storage.setGoogleIntegrationNeedsReauth(userId);
    return { ok: false, needsReauth: true, message: "No refresh token; please reconnect" };
  }

  const now = new Date();
  const expiresAt = integration.expiresAt ? new Date(integration.expiresAt) : null;
  const needRefresh = !integration.accessToken || !expiresAt || expiresAt.getTime() < now.getTime() + EXPIRY_BUFFER_SECONDS * 1000;

  if (!needRefresh && integration.accessToken) {
    return { ok: true, accessToken: integration.accessToken };
  }

  let refreshToken: string;
  try {
    refreshToken = decryptRefreshToken(integration.encryptedRefreshToken);
  } catch {
    await storage.setGoogleIntegrationNeedsReauth(userId);
    return { ok: false, needsReauth: true, message: "Token decryption failed" };
  }

  try {
    const { access_token, expires_in } = await refreshAccessToken(refreshToken);
    const newExpiresAt = new Date(Date.now() + expires_in * 1000);
    await storage.upsertGoogleIntegration({
      userId,
      status: "active",
      accessToken: access_token,
      expiresAt: newExpiresAt,
      encryptedRefreshToken: integration.encryptedRefreshToken, // keep existing unless we get a new one
    });
    return { ok: true, accessToken: access_token };
  } catch (err: any) {
    const msg = err?.message ?? "";
    const isInvalidGrant = /invalid_grant|invalid_request|Token has been expired|refresh token/i.test(msg);
    if (isInvalidGrant) {
      await storage.setGoogleIntegrationNeedsReauth(userId);
      return { ok: false, needsReauth: true, message: "Google connection expired or revoked" };
    }
    throw err;
  }
}

/**
 * After OAuth callback: store tokens. Only overwrite refresh_token if Google returned a new one.
 */
export async function storeTokensFromCallback(
  userId: number,
  accessToken: string,
  expiresIn: number,
  refreshTokenFromGoogle: string | undefined,
  connectedEmail?: string
): Promise<void> {
  const existing = await storage.getGoogleIntegration(userId);
  let encryptedRefresh = existing?.encryptedRefreshToken;
  if (refreshTokenFromGoogle) {
    encryptedRefresh = encryptRefreshToken(refreshTokenFromGoogle);
  }
  if (!encryptedRefresh) {
    throw new Error("No refresh token from Google; user may need to reconnect with prompt=consent");
  }
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  await storage.upsertGoogleIntegration({
    userId,
    status: "active",
    connectedEmail,
    accessToken,
    expiresAt,
    encryptedRefreshToken: encryptedRefresh,
  });
}
