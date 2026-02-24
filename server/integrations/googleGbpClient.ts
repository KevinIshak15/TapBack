/**
 * Google Business Profile API wrappers: accounts list (Account Management v1), locations list (Business Information v1).
 * Uses googleTokenService for valid access token (refresh when needed).
 *
 * Locations are fetched via My Business Business Information API v1 (recommended). The old
 * My Business API v4 (mybusiness.googleapis.com/v4) often returns 404; enable "My Business
 * Business Information API" in Google Cloud Console if you get errors.
 */

import { getValidAccessToken } from "./googleTokenService";

const ACCOUNT_MANAGEMENT_BASE = "https://mybusinessaccountmanagement.googleapis.com/v1";
const BUSINESS_INFO_BASE = "https://mybusinessbusinessinformation.googleapis.com/v1";

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

/** Format storefrontAddress from Business Information API v1 into a single line. */
function formatStorefrontAddress(addr: {
  addressLines?: string[];
  locality?: string;
  administrativeArea?: string;
  regionCode?: string;
  postalCode?: string;
}): string {
  if (!addr) return "";
  const parts = [...(addr.addressLines || []), addr.locality, addr.administrativeArea, addr.regionCode, addr.postalCode].filter(Boolean);
  return parts.join(", ");
}

/**
 * GET locations for an account using Business Information API v1.
 * Requires "My Business Business Information API" to be enabled in Google Cloud Console.
 */
export async function listLocations(userId: number, accountName: string): Promise<GbpLocation[]> {
  const tokenResult = await getValidAccessToken(userId);
  if (!tokenResult.ok) {
    throw new Error(tokenResult.message ?? "Google integration needs reauth");
  }
  const readMask = "name,title,storeCode,storefrontAddress";
  const url = `${BUSINESS_INFO_BASE}/${accountName}/locations?readMask=${encodeURIComponent(readMask)}&pageSize=100`;
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
      return (data.locations ?? []).map((loc: any) => mapV1Location(loc));
    }
  }
  if (!res.ok) {
    const text = await res.text();
    let errMsg = `Google API error: ${res.status}`;
    try {
      const json = JSON.parse(text) as { error?: { message?: string; status?: string } };
      if (json?.error?.message) errMsg += ` — ${json.error.message}`;
      else if (text.length < 300) errMsg += ` — ${text}`;
    } catch {
      if (text.length < 300) errMsg += ` — ${text}`;
    }
    throw new Error(errMsg);
  }
  const data = await res.json();
  return (data.locations ?? []).map((loc: any) => mapV1Location(loc));
}

function mapV1Location(loc: {
  name?: string;
  title?: string;
  storeCode?: string;
  storefrontAddress?: { addressLines?: string[]; locality?: string; administrativeArea?: string; regionCode?: string; postalCode?: string };
}): GbpLocation {
  const name = loc.name || "";
  const storeAddress = loc.storefrontAddress ? formatStorefrontAddress(loc.storefrontAddress) : undefined;
  return {
    name,
    title: loc.title,
    locationName: loc.title,
    storeCode: loc.storeCode,
    storeAddress: storeAddress || undefined,
  };
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

// ---------------------------------------------------------------------------
// Google Business Profile Reviews (My Business API v4 - reviews still on v4)
// GET .../v4/{parent=accounts/*/locations/*}/reviews
// ---------------------------------------------------------------------------

const MYBUSINESS_V4_BASE = "https://mybusiness.googleapis.com/v4";

const STAR_RATING_TO_NUMBER: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export interface GoogleReviewItem {
  reviewId: string;
  reviewerDisplayName: string;
  reviewerProfilePhotoUrl?: string;
  starRating: number;
  comment: string;
  createTime: string;
  updateTime?: string;
  reviewReply?: string;
}

export interface ListLocationReviewsResult {
  reviews: GoogleReviewItem[];
  averageRating: number;
  totalReviewCount: number;
  nextPageToken?: string;
}

/**
 * Resolve location resource name to full form accounts/{accountId}/locations/{locationId}.
 * Business Information API v1 can return name as "locations/{id}"; v4 reviews requires the full path.
 */
async function resolveFullLocationName(userId: number, locationResourceName: string): Promise<string> {
  if (locationResourceName.startsWith("accounts/") && locationResourceName.includes("/locations/")) {
    return locationResourceName;
  }
  const result = await listAllLocations(userId);
  for (const { accountName, location } of result.locations) {
    const locName = (location.name || "").replace(/^\//, "");
    if (!locName) continue;
    const full = locName.startsWith("accounts/") ? locName : `${accountName.replace(/\/$/, "")}/${locName}`;
    if (full === locationResourceName || locName === locationResourceName) {
      return full;
    }
  }
  return locationResourceName;
}

/**
 * List reviews for a single GBP location (My Business API v4).
 * locationResourceName must be of the form accounts/{accountId}/locations/{locationId}.
 * Requires business.manage scope (same as other GBP calls).
 *
 * Google Cloud Console: enable "My Business API" (mybusiness.googleapis.com) for this project
 * so the v4 reviews endpoint works. Same OAuth client as Account Management and Business Information.
 */
export async function listLocationReviews(
  userId: number,
  locationResourceName: string
): Promise<ListLocationReviewsResult> {
  const tokenResult = await getValidAccessToken(userId);
  if (!tokenResult.ok) {
    throw new Error(tokenResult.message ?? "Google integration needs reauth");
  }
  const fullName = await resolveFullLocationName(userId, locationResourceName);
  const url = `${MYBUSINESS_V4_BASE}/${fullName}/reviews?pageSize=50&orderBy=updateTime%20desc`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${tokenResult.accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    let errMsg = `Google Reviews API error: ${res.status}`;
    try {
      const json = JSON.parse(text) as { error?: { message?: string } };
      if (json?.error?.message) errMsg += ` — ${json.error.message}`;
      else if (text.length < 300) errMsg += ` — ${text}`;
    } catch {
      if (text.length < 300) errMsg += ` — ${text}`;
    }
    if (res.status === 404) {
      errMsg += " Enable the My Business API (mybusiness.googleapis.com) in Google Cloud Console: APIs & Services → Library, search 'My Business API'. It is separate from My Business Account Management API and My Business Business Information API.";
    }
    throw new Error(errMsg);
  }
  const data = (await res.json()) as {
    reviews?: Array<{
      name?: string;
      reviewId?: string;
      reviewer?: { displayName?: string; profilePhotoUrl?: string; isAnonymous?: boolean };
      starRating?: string;
      comment?: string;
      createTime?: string;
      updateTime?: string;
      reviewReply?: { comment?: string };
    }>;
    averageRating?: number;
    totalReviewCount?: number;
    nextPageToken?: string;
  };
  const reviews: GoogleReviewItem[] = (data.reviews ?? []).map((r) => ({
    reviewId: r.reviewId ?? r.name ?? "",
    reviewerDisplayName: r.reviewer?.isAnonymous ? "Anonymous" : (r.reviewer?.displayName ?? "Anonymous"),
    reviewerProfilePhotoUrl: r.reviewer?.isAnonymous ? undefined : r.reviewer?.profilePhotoUrl,
    starRating: STAR_RATING_TO_NUMBER[r.starRating ?? ""] ?? 0,
    comment: r.comment ?? "",
    createTime: r.createTime ?? "",
    updateTime: r.updateTime,
    reviewReply: r.reviewReply?.comment,
  }));
  return {
    reviews,
    averageRating: data.averageRating ?? 0,
    totalReviewCount: data.totalReviewCount ?? 0,
    nextPageToken: data.nextPageToken,
  };
}
