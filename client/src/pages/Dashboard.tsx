import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Building2, MessageSquare, BarChart, Settings, QrCode, ChevronRight, TrendingUp, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { GoogleStars } from "@/components/app/GoogleStars";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-24 rounded-xl" />
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
      <div className="space-y-3">
        {/* Hero: Boost Google ranking + stars (compact) */}
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm overflow-hidden google-gradient-soft">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[var(--google-c-green)]" />
                Boost your Google ranking
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Get more reviews, stand out in search, and grow your business.
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <GoogleStars size="sm" />
                <span className="text-[11px] font-medium text-slate-500">Google Reviews</span>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <span className="w-1.5 rounded-full bg-[var(--google-c-blue)]" />
              <span className="w-1.5 rounded-full bg-[var(--google-c-red)]" />
              <span className="w-1.5 rounded-full bg-[var(--google-c-yellow)]" />
              <span className="w-1.5 rounded-full bg-[var(--google-c-green)]" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-600 mt-0.5">Manage your account and businesses</p>
          </div>
        </div>
        <DashboardInsights businesses={businesses} />
        <BusinessList businesses={businesses} />
      </div>
    </AppShell>
  );
}

function DashboardInsights({ businesses }: { businesses: any[] | undefined }) {
  const totalReviews = businesses?.reduce((sum, b) => sum + (b.totalReviews ?? 0), 0) ?? 0;
  const totalConcerns = businesses?.reduce((sum, b) => sum + (b.totalConcerns ?? 0), 0) ?? 0;
  const totalBusinesses = businesses?.length ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      <Card className="app-card">
        <CardContent className="py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <MessageSquare className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalReviews}</p>
            <p className="text-xs text-slate-600">Reviews</p>
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardContent className="py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
            <AlertCircle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalConcerns}</p>
            <p className="text-xs text-slate-600">Complaints</p>
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardContent className="py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Building2 className="h-5 w-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{totalBusinesses}</p>
            <p className="text-xs text-slate-600">Locations</p>
          </div>
        </CardContent>
      </Card>
      <Card className="app-card">
        <CardContent className="py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <BarChart className="h-5 w-5 text-slate-500" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">—</p>
            <p className="text-xs text-slate-600">This month (coming soon)</p>
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
    <div className="space-y-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs text-slate-600">
          Manage your locations and track review performance.
        </p>
        <Link href="/business/new">
          <Button className="font-medium h-8 text-sm">
            <Plus className="h-4 w-4 mr-1.5" />
            Add business
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {businesses.map((business) => (
          <BusinessCard key={business.id} business={business} />
        ))}
      </div>
    </div>
  );
}

function BusinessCard({ business }: { business: any }) {
  const [, setLocation] = useLocation();
  const totalReviews = business.totalReviews ?? 0;
  const totalConcerns = business.totalConcerns ?? 0;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => setLocation(`/business/${business.slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setLocation(`/business/${business.slug}`);
        }
      }}
      className="cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-[14px]"
    >
      <Card className="app-card h-full transition-colors hover:border-primary/40">
        <CardHeader className="pb-2 pt-4 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-base text-slate-900 truncate">{business.name}</CardTitle>
                <CardDescription className="text-xs mt-0.5 truncate">{business.category}</CardDescription>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 pt-0 px-4 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <div>
                <p className="text-base font-semibold text-slate-900 leading-tight">{totalReviews}</p>
                <p className="text-[11px] text-slate-500">Reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-md bg-amber-50/80 px-2 py-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-base font-semibold text-slate-900 leading-tight">{totalConcerns}</p>
                <p className="text-[11px] text-slate-500">Complaints</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-0" onClick={(e) => e.stopPropagation()}>
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" asChild>
              <Link href={`/business/${business.slug}`}>
                <Settings className="h-3 w-3" />
                Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="gap-1 h-7 text-xs" asChild>
              <Link href={`/business/${business.slug}/qr`}>
                <QrCode className="h-3 w-3" />
                QR Code
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
