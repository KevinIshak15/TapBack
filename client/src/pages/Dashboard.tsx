import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import type { Business } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, AlertCircle, CheckCircle2, ArrowRight, MapPin, MoreVertical, Settings, QrCode, Trash2, Building2 } from "lucide-react";
import { ConfirmDeleteBusinessDialog } from "@/components/ConfirmDeleteBusinessDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";


function getPortfolioStats(businesses: Business[] | undefined) {
  const list = businesses ?? [];
  return { totalLocations: list.length };
}

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
        <div className="min-h-[60vh] bg-background p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <div className="flex gap-6 bg-card px-6 py-3 rounded-2xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] w-fit">
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
                <Skeleton className="h-12 w-20" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[280px] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!user) {
    return null;
  }

  const stats = getPortfolioStats(businesses);

  return (
    <AppShell>
      <div className="min-h-[60vh] bg-background p-6 md:p-8 font-display text-foreground">
        <div className="max-w-7xl mx-auto">
          {/* 1. Welcome header + Empire stats */}
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground mt-1 md:mt-2 text-sm">Overview of your businesses.</p>
            </div>
            <div className="flex gap-4 sm:gap-6 bg-card px-4 sm:px-6 py-3 rounded-2xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex-shrink-0">
              <div className="text-center min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wide">Locations</p>
                <p className="text-lg sm:text-xl font-bold text-foreground">{stats.totalLocations}</p>
              </div>
            </div>
          </div>

          {/* 2. Business grid + Add card */}
          {(!businesses || businesses.length === 0) ? (
            <EmptyState
              icon={Building2}
              title="No businesses yet"
              description="Add your first business to get started."
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business) => (
                <DashboardBusinessCard
                  key={business.id}
                  business={business}
                />
              ))}
              <AddBusinessCard />
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function DashboardBusinessCard({ business }: { business: Business }) {
  const [, setLocation] = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const pendingConcerns = business.pendingConcernsCount ?? business.totalConcerns ?? 0;
  const isActionNeeded = pendingConcerns > 0;
  const notifications = pendingConcerns;

  const locationDisplay = business.address
    ? business.address.split(",").map((s) => s.trim()).slice(0, 2).join(", ")
    : business.category;

  return (
    <>
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
        className="group relative bg-card rounded-[2rem] border border-border shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_hsl(var(--primary)/0.15)] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        {/* Card header background */}
        <div className="h-24 bg-muted/50 border-b border-border flex items-start justify-between p-4 relative">
          {isActionNeeded ? (
            <div className="flex items-center gap-1.5 bg-card pl-1.5 pr-2.5 py-1 rounded-full border border-rose-100 shadow-sm z-10">
              <div className="relative">
                <AlertCircle size={16} className="text-rose-500" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
              </div>
              <span className="text-xs font-bold text-rose-600">{notifications} Alert{notifications !== 1 ? "s" : ""}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-card pl-1.5 pr-2.5 py-1 rounded-full border border-emerald-100 shadow-sm z-10">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">Healthy</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-card rounded-lg transition-colors z-10"
                aria-label="Business options"
              >
                <MoreVertical size={18} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem asChild>
                <Link href={`/business/${business.slug}`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/business/${business.slug}/qr`}>
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={(e) => {
                  e.preventDefault();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete business
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Card body */}
        <div className="px-6 pb-6 relative">
          <div
            className={`-mt-10 w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold shadow-md border-4 border-card mb-3 ${
              business.logo ? "bg-muted/50" : "bg-muted text-muted-foreground"
            }`}
          >
            {business.logo ? (
              <img src={business.logo} alt="" className="w-full h-full object-contain rounded-lg" />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors truncate">
              {business.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-wrap">
              {locationDisplay && (
                <span className="flex items-center gap-1 truncate">
                  <MapPin size={12} className="shrink-0" />
                  {locationDisplay}
                </span>
              )}
              {locationDisplay && business.category && <span>•</span>}
              <span>{business.category}</span>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs font-semibold text-muted-foreground">Manage</span>
            <span className="flex items-center gap-1 text-sm font-bold text-primary group-hover:gap-2 transition-all">
              Open <ArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
      <ConfirmDeleteBusinessDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        business={{ id: business.id, name: business.name }}
        onDeleted={() => setLocation("/dashboard")}
      />
    </>
  );
}

function AddBusinessCard() {
  return (
    <Link href="/business/new" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-[2rem]">
      <div className="group relative flex flex-col items-center justify-center min-h-[280px] rounded-[2rem] border-2 border-dashed border-border bg-muted/30 hover:bg-card hover:border-primary/40 hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 h-full">
        <div className="w-16 h-16 bg-card rounded-full shadow-sm border border-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus size={32} className="text-muted-foreground group-hover:text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground group-hover:text-primary">Add New Business</h3>
        <p className="text-sm text-muted-foreground mt-1">Connect Google or add manually</p>
      </div>
    </Link>
  );
}
