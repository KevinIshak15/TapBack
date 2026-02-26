import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertBusiness } from "@shared/routes";
import { useUser } from "./use-auth";

export function useBusinesses() {
  const { user } = useUser();
  
  return useQuery({
    queryKey: [api.businesses.list.path],
    queryFn: async () => {
      const res = await fetch(api.businesses.list.path, {
        credentials: "include", // Include cookies for session
      });
      if (!res.ok) throw new Error("Failed to fetch businesses");
      return api.businesses.list.responses[200].parse(await res.json());
    },
    enabled: !!user, // Only fetch when user is authenticated
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnMount: true, // Refetch when component mounts
  });
}

/** Total count of items needing attention: concerns + unreplied 1–2 star Google reviews. Used for top bar and sidebar notification badge. */
export function usePortfolioAlertCount(): number {
  const { user } = useUser();
  const { data: businesses } = useBusinesses();
  const fallbackCount = businesses?.reduce((sum, b) => sum + (b.totalConcerns ?? 0), 0) ?? 0;
  const { data, isFetched } = useQuery({
    queryKey: ["/api/portfolio/alerts"],
    queryFn: async () => {
      const res = await fetch("/api/portfolio/alerts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch alert count");
      const json = await res.json();
      return json as { count: number };
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000, // 1 minute so we don't hammer Google API on every focus
  });
  // Don't show fallback until we've fetched: avoids flash of "1" on first sign-in when businesses list has a different count than the alerts API
  if (!isFetched) return 0;
  return data?.count ?? fallbackCount;
}

const CONCERNS_LAST_VIEWED_KEY = (businessId: number) => `concernsLastViewed_${businessId}`;

/** Timestamp when the user last viewed the Concerns tab for this business (so we can show "new since then" count). */
export function getConcernsLastViewed(businessId: number): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CONCERNS_LAST_VIEWED_KEY(businessId));
}

/** Call when the user opens the Concerns tab so the "new concerns" badge resets after they've seen the list. */
export function setConcernsLastViewed(businessId: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CONCERNS_LAST_VIEWED_KEY(businessId), new Date().toISOString());
}

/** Count of pending concerns (not yet marked Contacted). Used for red badge on Concerns tab/sidebar; goes down when user marks as Contacted. */
export function useNewConcernsCount(businessId: number | undefined): number {
  const { data } = useQuery({
    queryKey: ["/api/businesses/concerns-count", businessId],
    queryFn: async () => {
      if (!businessId) return { count: 0 };
      const res = await fetch(`/api/businesses/${businessId}/concerns-count`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch concerns count");
      const json = await res.json();
      return json as { count: number };
    },
    enabled: !!businessId,
    refetchOnWindowFocus: true,
  });
  return data?.count ?? 0;
}

export function useBusiness(id: number) {
  return useQuery({
    queryKey: [api.businesses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.businesses.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return api.businesses.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useBusinessBySlug(slug: string) {
  return useQuery({
    queryKey: [api.businesses.getBySlug.path, slug],
    queryFn: async () => {
      const url = buildUrl(api.businesses.getBySlug.path, { slug });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch business");
      return api.businesses.getBySlug.responses[200].parse(await res.json());
    },
    enabled: !!slug,
  });
}

export function useBusinessStats(id: number) {
  return useQuery({
    queryKey: [api.businesses.getStats.path, id],
    queryFn: async () => {
      const url = buildUrl(api.businesses.getStats.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.businesses.getStats.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useBusinessReviews(
  businessId: number,
  options?: { refetchOnWindowFocus?: boolean }
) {
  return useQuery({
    queryKey: [api.businesses.listReviews.path, businessId],
    queryFn: async () => {
      const url = buildUrl(api.businesses.listReviews.path, { id: businessId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 403 || res.status === 404) throw new Error("Not found");
      if (!res.ok) throw new Error("Failed to fetch reviews");
      return api.businesses.listReviews.responses[200].parse(await res.json());
    },
    enabled: !!businessId,
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? true,
  });
}

/** Response from GET /api/businesses/:id/google-reviews */
export interface GoogleReviewsResponse {
  reviews: Array<{
    reviewId: string;
    reviewerDisplayName: string;
    reviewerProfilePhotoUrl?: string;
    starRating: number;
    comment: string;
    createTime: string;
    updateTime?: string;
    reviewReply?: string;
  }>;
  averageRating: number;
  totalReviewCount: number;
  nextPageToken?: string;
  error?: string;
  message?: string;
}

/** Google Business Profile reviews for a business (only for businesses linked to GBP). */
export function useGoogleReviews(businessId: number, enabled: boolean) {
  return useQuery({
    queryKey: ["/api/businesses/google-reviews", businessId],
    queryFn: async (): Promise<GoogleReviewsResponse> => {
      const res = await fetch(`/api/businesses/${businessId}/google-reviews`, { credentials: "include" });
      if (res.status === 403 || res.status === 404) throw new Error("Not found");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Failed to fetch Google reviews");
      return data;
    },
    enabled: !!businessId && enabled,
  });
}

/** Create business from Google locations. Pass locationResourceNames or leave empty to use stored selection. */
export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBusiness | { locationResourceNames?: string[] }) => {
      const res = await fetch(api.businesses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create business" }));
        const err = new Error(error.message || "Failed to create business") as Error & { alreadyAdded?: string[] };
        err.alreadyAdded = error.alreadyAdded;
        throw err;
      }
      const json = await res.json();
      return Array.isArray(json) ? json : [json];
    },
    onSuccess: (newBusinesses) => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
      queryClient.setQueryData(
        [api.businesses.list.path],
        (old: any) => {
          if (!old) return newBusinesses;
          return [...(Array.isArray(old) ? old : [old]), ...newBusinesses];
        }
      );
    },
  });
}

/** Update a concern's status (pending | contacted). Badge count excludes contacted. */
export function useUpdateConcernStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      businessId,
      reviewId,
      concernStatus,
    }: {
      businessId: number;
      reviewId: number;
      concernStatus: "pending" | "contacted";
    }) => {
      const res = await fetch(`/api/businesses/${businessId}/concerns/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ concernStatus }),
      });
      if (!res.ok) throw new Error("Failed to update concern status");
      return res.json();
    },
    onSuccess: (_data, { businessId }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/businesses/concerns-count", businessId] });
      queryClient.invalidateQueries({ queryKey: [api.businesses.listReviews.path, businessId] });
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/portfolio/alerts"] });
    },
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InsertBusiness> & { id: number, focusAreas?: string[] }) => {
      const url = buildUrl(api.businesses.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include", // Include cookies for session
      });
      if (!res.ok) throw new Error("Failed to update business");
      return api.businesses.update.responses[200].parse(await res.json());
    },
    onSuccess: (updatedBusiness) => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.get.path, updatedBusiness.id] });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0]?.toString() || "";
          return key.startsWith(api.businesses.getBySlug.path);
        }
      });
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
    },
  });
}

/** URL we set when creating from GBP before we have a Place ID. Used to detect when to auto-refresh. */
export const PLACEHOLDER_GOOGLE_URL = "https://g.page/r/imported";

/** Response from refresh-google-review-url: { updated, business, message? }. */
export type RefreshGoogleReviewUrlResponse = {
  updated: boolean;
  business: Record<string, unknown>;
  message?: string;
};

/** Refresh Google Review URL from Google Business Profile. Use when business has GBP linked but URL is still placeholder. */
export function useRefreshGoogleReviewUrl(slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (businessId: number): Promise<RefreshGoogleReviewUrlResponse> => {
      const res = await fetch(`/api/businesses/${businessId}/refresh-google-review-url`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || "Failed to refresh Google Review URL");
      }
      return res.json();
    },
    onSuccess: (data, businessId) => {
      queryClient.invalidateQueries({ queryKey: [api.businesses.get.path, businessId] });
      queryClient.invalidateQueries({ queryKey: [api.businesses.getBySlug.path, slug] });
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
    },
  });
}

/** Delete a business (owner only). Removes the business and its reviews; unlinks the GBP location so it can be re-added. */
export function useDeleteBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (businessId: number) => {
      const url = buildUrl(api.businesses.get.path, { id: businessId }).replace(/\?.*$/, "");
      const res = await fetch(`${url}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 403) throw new Error("Not authorized to delete this business");
      if (res.status === 404) throw new Error("Business not found");
      if (!res.ok) throw new Error("Failed to delete business");
    },
    onSuccess: (_, businessId) => {
      queryClient.removeQueries({ queryKey: [api.businesses.get.path, businessId] });
      queryClient.removeQueries({ queryKey: ["/api/businesses/google-reviews", businessId] });
      queryClient.removeQueries({ queryKey: [api.businesses.listReviews.path, businessId] });
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
      queryClient.invalidateQueries({ predicate: (q) => (q.queryKey[0]?.toString() ?? "").startsWith(api.businesses.getBySlug.path) });
    },
  });
}
