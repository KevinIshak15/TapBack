/**
 * Mock error log entries for Admin → System → Error Logs.
 * Replace with real API later.
 */

export interface MockErrorEntry {
  id: string;
  timestamp: string;
  service: "api" | "webhook" | "google" | "billing" | "sync";
  message: string;
  businessId?: number;
  businessName?: string;
}

export const MOCK_ERRORS: MockErrorEntry[] = [
  { id: "1", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), service: "api", message: "Validation failed: invalid slug format", businessId: 3, businessName: "Milton Dental" },
  { id: "2", timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), service: "webhook", message: "Webhook signature verification failed" },
  { id: "3", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), service: "google", message: "GBP API rate limit exceeded (429)" },
  { id: "4", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), service: "billing", message: "Stripe webhook timeout" },
  { id: "5", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), service: "api", message: "Failed to send concern notification email", businessId: 1, businessName: "CliniMedia" },
  { id: "6", timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), service: "sync", message: "Location sync job failed: token expired" },
  { id: "7", timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), service: "google", message: "Place not found for locationResourceName" },
  { id: "8", timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), service: "api", message: "Database connection pool exhausted" },
];
