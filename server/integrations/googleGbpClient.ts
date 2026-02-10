/**
 * Google Business Profile API wrappers: accounts list, locations list.
 * Uses googleTokenService for valid access token (refresh when needed).
 */

import { getValidAccessToken } from "./googleTokenService";

const ACCOUNT_MANAGEMENT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const MYBUSINESS_BASE = "https://mybusiness.googleapis.com/v4";

export interface GbpAccount {
  name: string;
  accountName?: string;
  type?: string;
  role?: string;
}

export interface GbpLocation {
  name: string;
  locationName?: string;
  storeCode?: string;
  storeAddress?: string;
  title?: string;
  address?: any;
}

/**
 * GET accounts. Returns list of accounts the user has access to.
 */
export async function listAccounts(userId: number): Promise<GbpAccount[]> {
  const tokenResult = await getValidAccessToken(userId);
  if (!tokenResult.ok) {
    throw new Error(tokenResult.message ?? "Google integration needs reauth");
  }
  const url = `${ACCOUNT_MANAGEMENT_BASE}/accounts`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
  });
  if (res.status === 401) {
    const retry = await getValidAccessToken(userId);
    if (retry.ok) {
      const retryRes = await fetch(url, {
        headers: { Authorization: `Bearer ${retry.accessToken}` },
      });
      if (!retryRes.ok) throw new Error(`Google API error: ${retryRes.status}`);
      const data = await retryRes.json();
      return data.accounts ?? [];
    }
  }
  if (!res.ok) throw new Error(`Google API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.accounts ?? [];
}

/**
 * GET locations for an account. API: GET .../v4/{parent=accounts/*}/locations
 * parent is the account resource name (e.g. "accounts/123") — use as path, do not encode the slash.
 */
export async function listLocations(userId: number, accountName: string): Promise<GbpLocation[]> {
  const tokenResult = await getValidAccessToken(userId);
  if (!tokenResult.ok) {
    throw new Error(tokenResult.message ?? "Google integration needs reauth");
  }
  const url = `${MYBUSINESS_BASE}/${accountName}/locations?pageSize=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
  });
  if (res.status === 401) {
    const retry = await getValidAccessToken(userId);
    if (retry.ok) {
      const retryRes = await fetch(url, {
        headers: { Authorization: `Bearer ${retry.accessToken}` },
      });
      if (!retryRes.ok) throw new Error(`Google API error: ${retryRes.status}`);
      const data = await retryRes.json();
      return data.locations ?? [];
    }
  }
  if (!res.ok) throw new Error(`Google API error: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return data.locations ?? [];
}

export interface ListAllLocationsResult {
  locations: { accountName: string; location: GbpLocation }[];
  /** Set when we have accounts but listing locations failed (e.g. API not enabled). */
  error?: string;
}

/**
 * Fetch all accounts and their locations for the user. Returns flat list of { accountName, location }.
 */
export async function listAllLocations(userId: number): Promise<ListAllLocationsResult> {
  const accounts = await listAccounts(userId);
  const out: { accountName: string; location: GbpLocation }[] = [];
  let firstError: string | undefined;
  for (const acc of accounts) {
    const name = acc.name || acc.accountName;
    if (!name) continue;
    try {
      const locations = await listLocations(userId, name);
      for (const loc of locations) {
        out.push({ accountName: name, location: loc });
      }
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      if (!firstError) firstError = err;
      console.warn(`[GBP] listLocations failed for account ${name}:`, err);
    }
  }
  return { locations: out, error: out.length === 0 && firstError ? firstError : undefined };
}
