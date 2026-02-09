import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { z } from "zod";

export function useUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, {
        credentials: "include", // Include cookies for session
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  return { user, isLoading, error };
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch(api.auth.login.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // Include cookies for session
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Invalid username or password");
        }
        throw new Error("Login failed");
      }
      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user);
      // Invalidate businesses query to refetch after login
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // Include cookies for session
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      const user = api.auth.register.responses[201].parse(await res.json());
      
      // Verify the session by fetching the user endpoint
      const userRes = await fetch(api.auth.me.path, {
        credentials: "include",
      });
      if (userRes.ok) {
        const verifiedUser = api.auth.me.responses[200].parse(await userRes.json());
        return verifiedUser;
      }
      
      return user;
    },
    onSuccess: (user) => {
      // Set the user data and invalidate to ensure fresh data
      queryClient.setQueryData([api.auth.me.path], user);
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      // Invalidate businesses query to refetch after registration
      queryClient.invalidateQueries({ queryKey: [api.businesses.list.path] });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, { 
        method: "POST",
        credentials: "include", // Include cookies for session
      });
      if (!res.ok) throw new Error("Logout failed");
    },
    onSuccess: () => {
      // Clear user data
      queryClient.setQueryData([api.auth.me.path], null);
      // Clear all business-related queries to prevent showing another user's data
      queryClient.removeQueries({ queryKey: [api.businesses.list.path] });
      // Clear all queries that start with business API paths
      queryClient.removeQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0]?.toString() || "";
          return key.startsWith("/api/businesses");
        }
      });
    },
  });
}
