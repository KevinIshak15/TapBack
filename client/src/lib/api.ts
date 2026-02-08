import { z } from "zod";
import { api, buildUrl } from "@shared/routes";

/**
 * Centralized API client utilities
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetch wrapper with error handling
 */
async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    credentials: "include", // Include cookies for session auth
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.message || `HTTP ${response.status}`,
      data
    );
  }

  return data as T;
}

/**
 * API client methods
 */
export const apiClient = {
  // Auth
  register: (input: z.infer<typeof api.auth.register.input>) =>
    fetchApi(api.auth.register.path, {
      method: api.auth.register.method,
      body: JSON.stringify(input),
    }),

  login: (input: z.infer<typeof api.auth.login.input>) =>
    fetchApi(api.auth.login.path, {
      method: api.auth.login.method,
      body: JSON.stringify(input),
    }),

  logout: () =>
    fetchApi(api.auth.logout.path, {
      method: api.auth.logout.method,
    }),

  getCurrentUser: () =>
    fetchApi(api.auth.me.path, {
      method: api.auth.me.method,
    }),

  // Businesses
  createBusiness: (input: z.infer<typeof api.businesses.create.input>) =>
    fetchApi(api.businesses.create.path, {
      method: api.businesses.create.method,
      body: JSON.stringify(input),
    }),

  listBusinesses: () =>
    fetchApi(api.businesses.list.path, {
      method: api.businesses.list.method,
    }),

  getBusiness: (id: number) =>
    fetchApi(buildUrl(api.businesses.get.path, { id }), {
      method: api.businesses.get.method,
    }),

  getBusinessBySlug: (slug: string) =>
    fetchApi(buildUrl(api.businesses.getBySlug.path, { slug }), {
      method: api.businesses.getBySlug.method,
    }),

  updateBusiness: (id: number, input: z.infer<typeof api.businesses.update.input>) =>
    fetchApi(buildUrl(api.businesses.update.path, { id }), {
      method: api.businesses.update.method,
      body: JSON.stringify(input),
    }),

  getBusinessStats: (id: number) =>
    fetchApi(buildUrl(api.businesses.getStats.path, { id }), {
      method: api.businesses.getStats.method,
    }),

  // Reviews
  createReview: (input: z.infer<typeof api.reviews.create.input>) =>
    fetchApi(api.reviews.create.path, {
      method: api.reviews.create.method,
      body: JSON.stringify(input),
    }),

  generateReview: (input: z.infer<typeof api.reviews.generateAI.input>) =>
    fetchApi(api.reviews.generateAI.path, {
      method: api.reviews.generateAI.method,
      body: JSON.stringify(input),
    }),
};
