import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, Search, Shield, User as UserIcon } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

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

  const filteredUsers = users?.filter((user) =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/admin">
            <Button variant="ghost" className="mb-6 rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Admin Dashboard
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900">
                Manage Users
              </h1>
              <p className="text-lg text-slate-600 mt-1">
                View and manage all platform users
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search users by username or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 rounded-xl border-slate-200 bg-white"
            />
          </div>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <Card className="glass-strong border-slate-200/60 shadow-2xl">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">No users found</p>
                </CardContent>
              </Card>
            ) : (
              filteredUsers.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="modern-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              user.role === "admin"
                                ? "bg-gradient-to-br from-purple-600 to-pink-600"
                                : "bg-gradient-to-br from-blue-600 to-cyan-600"
                            }`}
                          >
                            {user.role === "admin" ? (
                              <Shield className="w-6 h-6 text-white" />
                            ) : (
                              <UserIcon className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {user.username}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  user.role === "admin"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {user.role === "admin" ? "Admin" : "User"}
                              </span>
                            </div>
                            {user.email && (
                              <p className="text-sm text-slate-600">{user.email}</p>
                            )}
                            <p className="text-xs text-slate-500 mt-1">
                              Joined: {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement user editing
                              alert(`Edit user ${user.username} - Coming soon!`);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Summary */}
        {users && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <Card className="glass-strong border-slate-200/60 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-xl font-display">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">
                      {users.length}
                    </div>
                    <div className="text-sm text-slate-600">Total Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">
                      {users.filter((u) => u.role === "admin").length}
                    </div>
                    <div className="text-sm text-slate-600">Admins</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {users.filter((u) => u.role === "user").length}
                    </div>
                    <div className="text-sm text-slate-600">Regular Users</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
