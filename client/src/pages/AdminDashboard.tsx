import { motion } from "framer-motion";
import { useUser } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Users, 
  Building2, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

interface AdminStats {
  users: {
    total: number;
    admins: number;
    regular: number;
  };
  businesses: {
    total: number;
  };
  reviews: {
    total: number;
    great: number;
    concerns: number;
    generated: number;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch admin stats");
      return res.json();
    },
    enabled: user?.role === "admin",
  });

  if (userLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Skeleton className="h-12 w-48" />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (user.role !== "admin") {
    setLocation("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-display font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-lg text-slate-600 mt-1">
                Platform overview and management
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {/* Total Users */}
            <Card className="modern-card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Users
                  </CardTitle>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stats.users.total}
                </div>
                <div className="text-xs text-slate-500">
                  {stats.users.admins} admin{stats.users.admins !== 1 ? "s" : ""}, {stats.users.regular} regular
                </div>
              </CardContent>
            </Card>

            {/* Total Businesses */}
            <Card className="modern-card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Businesses
                  </CardTitle>
                  <Building2 className="w-5 h-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stats.businesses.total}
                </div>
                <div className="text-xs text-slate-500">
                  Active businesses
                </div>
              </CardContent>
            </Card>

            {/* Total Reviews */}
            <Card className="modern-card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Total Reviews
                  </CardTitle>
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {stats.reviews.total}
                </div>
                <div className="text-xs text-slate-500">
                  {stats.reviews.generated} AI-generated
                </div>
              </CardContent>
            </Card>

            {/* Review Breakdown */}
            <Card className="modern-card-hover">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-600">
                    Review Types
                  </CardTitle>
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-slate-600">Great</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {stats.reviews.great}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="w-4 h-4 text-red-600" />
                      <span className="text-sm text-slate-600">Concerns</span>
                    </div>
                    <span className="text-lg font-bold text-slate-900">
                      {stats.reviews.concerns}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-strong border-slate-200/60 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl font-display">Quick Actions</CardTitle>
              <CardDescription>Manage platform users and businesses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link href="/admin/users">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex-col gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 rounded-xl transition-all"
                  >
                    <Users className="w-6 h-6" />
                    <span className="font-semibold">Manage Users</span>
                    <span className="text-xs text-slate-500">View and manage all users</span>
                  </Button>
                </Link>
                <Link href="/admin/businesses">
                  <Button
                    variant="outline"
                    className="w-full h-auto py-6 flex-col gap-2 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 rounded-xl transition-all"
                  >
                    <Building2 className="w-6 h-6" />
                    <span className="font-semibold">Manage Businesses</span>
                    <span className="text-xs text-slate-500">View and manage all businesses</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
