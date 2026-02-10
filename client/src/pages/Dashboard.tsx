import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, MessageSquare, BarChart, Settings, QrCode, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app/AppShell";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/app/EmptyState";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, isLoading: userLoading } = useUser();
  const { data: businesses, isLoading: businessesLoading } = useBusinesses();

  useEffect(() => {
    if (!userLoading && !user) {
      setLocation("/login");
    }
  }, [user, userLoading, setLocation]);

  if (userLoading || businessesLoading) {
    return (
      <AppShell>
        <div className="space-y-6">
          <Skeleton className="h-9 w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <PageHeader
          title="Dashboard"
          description="Manage your account and businesses"
        />
        <DashboardInsights businesses={businesses} />
        <BusinessList businesses={businesses} />
      </div>
    </AppShell>
  );
}

function DashboardInsights({ businesses }: { businesses: any[] | undefined }) {
  const totalReviews = businesses?.reduce((sum, b) => sum + (b.totalReviews ?? 0), 0) ?? 0;
  const totalBusinesses = businesses?.length ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="app-card">
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalReviews}</p>
            <p className="text-sm text-slate-600">Total reviews (all businesses)</p>
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">{totalBusinesses}</p>
            <p className="text-sm text-slate-600">Locations</p>
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardContent className="pt-5 pb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <BarChart className="h-6 w-6 text-slate-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900">—</p>
            <p className="text-sm text-slate-600">Reviews this month (coming soon)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BusinessList({ businesses }: { businesses: any[] | undefined }) {
  if (!businesses || businesses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-sm text-slate-600">
            Manage your locations and track review performance.
          </p>
          <Link href="/business/new">
            <Button className="font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add business
            </Button>
          </Link>
        </div>
        <EmptyState
          icon={Building2}
          title="No businesses yet"
          description="Add your first business to start collecting reviews and analyzing feedback."
          primaryAction={
            <Link href="/business/new">
              <Button className="font-medium">
                <Plus className="h-5 w-5 mr-2" />
                Add business
              </Button>
            </Link>
          }
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-slate-600">
          Manage your locations and track review performance.
        </p>
        <Link href="/business/new">
          <Button className="font-medium">
            <Plus className="h-5 w-5 mr-2" />
            Add business
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}

function BusinessCard({ business }: { business: any }) {
  const totalReviews = business.totalReviews ?? 0;

  return (
    <Link href={`/business/${business.slug}`}>
      <Card className="app-card h-full transition-colors hover:border-primary/40 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-lg text-slate-900 truncate">{business.name}</CardTitle>
                <CardDescription className="text-sm mt-0.5 truncate">{business.category}</CardDescription>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-slate-400 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <MessageSquare className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-lg font-semibold text-slate-900">{totalReviews}</p>
                <p className="text-xs text-slate-500">Total reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <BarChart className="h-4 w-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-lg font-semibold text-slate-900">—</p>
                <p className="text-xs text-slate-500">This month</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link href={`/business/${business.slug}`} onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Button>
            </Link>
            <Link href={`/business/${business.slug}/qr`} onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" className="gap-1.5 h-8">
                <QrCode className="h-3.5 w-3.5" />
                QR Code
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
