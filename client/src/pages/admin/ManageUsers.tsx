import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Users, Search, Shield, User as UserIcon, Building2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Link } from "wouter";

interface User {
  id: number;
  username: string;
  email?: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt?: string;
}

export default function ManageUsers() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });

  const filteredUsers = useMemo(() => {
    const list = users ?? [];
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    const qNum = Number(searchQuery.trim());
    return list.filter(
      (user) =>
        user.username.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        (!Number.isNaN(qNum) && user.id === qNum)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Users</h1>
        <p className="text-sm text-slate-600 mt-0.5">View and manage all platform users</p>
      </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input
            placeholder="Search by username, email, or user ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 rounded-lg border-slate-200 bg-white"
          />
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
                <CardContent className="py-12 text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-slate-500" />
                  </div>
                  <p className="text-sm text-slate-600">No users found</p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <Card key={user.id} className="bg-white border border-slate-200 shadow-sm rounded-xl">
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {user.role === "admin" ? (
                          <Shield className="h-5 w-5 text-primary" />
                        ) : (
                          <UserIcon className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-slate-900 truncate">{user.username}</h3>
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                              user.role === "admin" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {user.role === "admin" ? "Admin" : "User"}
                          </span>
                        </div>
                        {user.email && <p className="text-sm text-slate-500 truncate">{user.email}</p>}
                        <p className="text-xs text-slate-400 mt-0.5">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/admin/businesses?owner=${user.id}`}>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Building2 className="h-4 w-4" />
                          Businesses
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => alert(`Edit user ${user.username} – Coming soon`)}
                      >
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {users && users.length > 0 && (
          <Card className="bg-white border border-slate-200 shadow-sm rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-slate-900">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-xl font-semibold text-slate-900">{users.length}</div>
                  <div className="text-xs text-slate-500">Total</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-primary">{users.filter((u) => u.role === "admin").length}</div>
                  <div className="text-xs text-slate-500">Admins</div>
                </div>
                <div>
                  <div className="text-xl font-semibold text-slate-900">{users.filter((u) => u.role === "user").length}</div>
                  <div className="text-xs text-slate-500">Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
