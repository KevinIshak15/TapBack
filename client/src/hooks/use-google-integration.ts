import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const STATUS_KEY = "/api/integrations/google/status";
const LOCATIONS_KEY = "/api/integrations/google/locations";

export type GoogleIntegrationStatus = "disconnected" | "connecting" | "active" | "needs_reauth";

export interface GoogleStatusResponse {
  status: "disconnected" | "active" | "needs_reauth";
  connectedEmail: string | null;
}

export interface GoogleLocationOption {
  locationResourceName: string;
  accountName?: string;
  locationName?: string;
  storeAddress?: string;
}

export function useGoogleIntegrationStatus() {
  return useQuery({
    queryKey: [STATUS_KEY],
    queryFn: async (): Promise<GoogleStatusResponse> => {
      const res = await fetch(STATUS_KEY, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch Google integration status");
      return res.json();
    },
  });
}

export function useGoogleLocations(enabled: boolean) {
  return useQuery({
    queryKey: [LOCATIONS_KEY],
    queryFn: async (): Promise<{ locations: GoogleLocationOption[]; error?: string; activationUrl?: string }> => {
      const res = await fetch(LOCATIONS_KEY, { credentials: "include" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to fetch locations");
      }
      return res.json();
    },
    enabled,
  });
}

export function useSelectGoogleLocations() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (locations: GoogleLocationOption[]) => {
      const res = await fetch("/api/integrations/google/locations/select", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ locations }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to save selection");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STATUS_KEY] });
    },
  });
}

export function useDisconnectGoogle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/integrations/google/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to disconnect");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STATUS_KEY] });
      queryClient.invalidateQueries({ queryKey: [LOCATIONS_KEY] });
    },
  });
}
