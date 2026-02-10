import { useUser } from "@/hooks/use-auth";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, MessageSquare, TrendingUp, ThumbsUp, ThumbsDown } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";

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
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        </div>
      </AppShell>
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
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Admin"
          description="Platform overview and management"
        />
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="app-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">Total users</CardTitle>
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-900">{stats.users.total}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stats.users.admins} admin{stats.users.admins !== 1 ? "s" : ""}, {stats.users.regular} regular</div>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">Total businesses</CardTitle>
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-900">{stats.businesses.total}</div>
                <div className="text-xs text-slate-500 mt-0.5">Active businesses</div>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">Total reviews</CardTitle>
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-slate-900">{stats.reviews.total}</div>
                <div className="text-xs text-slate-500 mt-0.5">{stats.reviews.generated} AI-generated</div>
              </CardContent>
            </Card>
            <Card className="app-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-slate-500">Review types</CardTitle>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600"><ThumbsUp className="h-4 w-4 text-green-600" /> Great</span>
                  <span className="font-semibold text-slate-900">{stats.reviews.great}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-600"><ThumbsDown className="h-4 w-4 text-red-600" /> Concerns</span>
                  <span className="font-semibold text-slate-900">{stats.reviews.concerns}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <Card className="app-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">Quick actions</CardTitle>
            <CardDescription>Manage platform users and businesses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/admin/users">
                <a className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Manage users</p>
                    <p className="text-sm text-slate-500">View and manage all users</p>
                  </div>
                </a>
              </Link>
              <Link href="/admin/businesses">
                <a className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Manage businesses</p>
                    <p className="text-sm text-slate-500">View and manage all businesses</p>
                  </div>
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
