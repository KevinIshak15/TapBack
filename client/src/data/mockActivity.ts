/**
 * Mock activity/timeline entries for Admin business detail → Activity Log.
 * Replace with real API later.
 */

export interface MockActivityEntry {
  id: string;
  timestamp: string;
  type: "scan" | "review" | "concern" | "settings" | "integration" | "billing";
  message: string;
  metadata?: Record<string, string | number>;
}

export function getMockActivityForBusiness(_businessId: number): MockActivityEntry[] {
  return [
    { id: "a1", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: "scan", message: "QR code scanned", metadata: { source: "mobile" } },
    { id: "a2", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: "review", message: "Review submitted to Google", metadata: { experienceType: "great" } },
    { id: "a3", timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), type: "settings", message: "Business settings updated" },
    { id: "a4", timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: "scan", message: "QR code scanned", metadata: { source: "tablet" } },
    { id: "a5", timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), type: "concern", message: "Concern form submitted (private)" },
    { id: "a6", timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), type: "integration", message: "Google Business Profile connection checked" },
  ];
}
