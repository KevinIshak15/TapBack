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
import { Plus, MessageSquare, AlertCircle, CheckCircle2, ArrowRight, Star, MapPin, MoreVertical, Settings, QrCode, Trash2, Building2 } from "lucide-react";
import { ConfirmDeleteBusinessDialog } from "@/components/ConfirmDeleteBusinessDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { AppShell } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";

// Palette for business card accent (first letter avatar)
const CARD_COLORS = ["bg-indigo-600", "bg-emerald-500", "bg-orange-500", "bg-violet-500", "bg-rose-500", "bg-sky-500"];

function getPortfolioStats(businesses: Business[] | undefined) {
  const list = businesses ?? [];
  const totalLocations = list.length;
  const totalReviews = list.reduce((sum, b) => sum + (b.totalReviews ?? 0), 0);
  let globalRating = 0;
  let totalWeight = 0;
  list.forEach((b) => {
    const n = b.totalReviews ?? 0;
    if (n > 0 && b.averageRating != null) {
      globalRating += b.averageRating * n;
      totalWeight += n;
    }
  });
  const avgRating = totalWeight > 0 ? globalRating / totalWeight : 0;
  return { totalLocations, totalReviews, globalRating: Math.round(avgRating * 10) / 10 };
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
        <div className="min-h-[60vh] bg-[#F8FAFC] p-6 md:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-4 w-64 mt-2" />
              </div>
              <div className="flex gap-6 bg-white px-6 py-3 rounded-xl border border-slate-200 w-fit">
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
      <div className="min-h-[60vh] bg-[#F8FAFC] p-6 md:p-8 font-sans text-slate-900">
        <div className="max-w-7xl mx-auto">
          {/* 1. Welcome header + Empire stats */}
          <div className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-slate-500 mt-1 md:mt-2 text-sm">Overview of your businesses and reputation.</p>
            </div>
            <div className="flex gap-4 sm:gap-6 bg-white px-4 sm:px-6 py-3 rounded-xl border border-slate-200 shadow-sm flex-shrink-0">
              <div className="text-center min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Locations</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">{stats.totalLocations}</p>
              </div>
              <div className="w-px bg-slate-100 self-stretch hidden sm:block" />
              <div className="text-center min-w-0" title="Total reviews across all businesses">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Reviews</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900">{stats.totalReviews}</p>
              </div>
              <div className="w-px bg-slate-100 self-stretch hidden sm:block" />
              <div className="text-center min-w-0">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">Avg Rating</p>
                <p className="text-lg sm:text-xl font-bold text-slate-900 flex items-center justify-center gap-0.5 sm:gap-1">
                  {stats.globalRating > 0 ? (
                    <>
                      {stats.globalRating}
                      <Star size={14} className="fill-amber-400 text-amber-400 shrink-0" />
                    </>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 2. Business grid + Add card */}
          {(!businesses || businesses.length === 0) ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businesses.map((business, index) => (
                <DashboardBusinessCard
                  key={business.id}
                  business={business}
                  imageColor={CARD_COLORS[index % CARD_COLORS.length]}
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

function DashboardBusinessCard({ business, imageColor }: { business: Business; imageColor: string }) {
  const [, setLocation] = useLocation();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const totalReviews = business.totalReviews ?? 0;
  const rating = business.averageRating ?? 0;
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
        className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2"
      >
        {/* Card header background */}
        <div className="h-24 bg-slate-50 border-b border-slate-100 flex items-start justify-between p-4 relative">
          {isActionNeeded ? (
            <div className="flex items-center gap-1.5 bg-white pl-1.5 pr-2.5 py-1 rounded-full border border-rose-100 shadow-sm z-10">
              <div className="relative">
                <AlertCircle size={16} className="text-rose-500" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-white animate-pulse" />
              </div>
              <span className="text-xs font-bold text-rose-600">{notifications} Alert{notifications !== 1 ? "s" : ""}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white pl-1.5 pr-2.5 py-1 rounded-full border border-emerald-100 shadow-sm z-10">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600">Healthy</span>
            </div>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg transition-colors z-10"
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
            className={`-mt-10 w-16 h-16 rounded-xl ${imageColor} text-white flex items-center justify-center text-2xl font-bold shadow-md border-4 border-white mb-3`}
          >
            {business.logo ? (
              <img src={business.logo} alt="" className="w-full h-full object-contain rounded-lg" />
            ) : (
              business.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
              {business.name}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-1 flex-wrap">
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
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Rating</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900">{rating > 0 ? rating.toFixed(1) : "—"}</span>
                {rating > 0 && <Star size={14} className="fill-amber-400 text-amber-400" />}
              </div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Reviews</p>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-slate-900">{totalReviews}</span>
                <MessageSquare size={14} className="text-slate-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
            <span className="text-xs font-semibold text-slate-400">Manage</span>
            <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:gap-2 transition-all">
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
    <Link href="/business/new" className="block outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 rounded-2xl">
      <div className="group relative flex flex-col items-center justify-center min-h-[280px] rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 hover:bg-white hover:border-indigo-400 hover:shadow-md transition-all duration-300 h-full">
        <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Plus size={32} className="text-slate-400 group-hover:text-indigo-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 group-hover:text-indigo-600">Add New Business</h3>
        <p className="text-sm text-slate-400 mt-1">Connect Google or add manually</p>
      </div>
    </Link>
  );
}
