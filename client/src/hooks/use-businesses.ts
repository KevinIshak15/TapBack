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

export function useBusiness(id: number) {
  return useQuery({
    queryKey: [api.businesses.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.businesses.get.path, { id });
      const res = await fetch(url);
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
      const res = await fetch(url);
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
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.businesses.getStats.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBusiness) => {
      const res = await fetch(api.businesses.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies for session
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Failed to create business" }));
        throw new Error(error.message || "Failed to create business");
      }
      return api.businesses.create.responses[201].parse(await res.json());
    },
    onSuccess: (newBusiness) => {
      // Invalidate and refetch the businesses list
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
      // Also optimistically add the new business to the cache
      queryClient.setQueryData<typeof newBusiness[]>(
        [api.businesses.list.path],
        (old) => {
          if (!old) return [newBusiness];
          return [...old, newBusiness];
        }
      );
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
