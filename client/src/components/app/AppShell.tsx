import * as React from "react";
import { Link, useLocation } from "wouter";
import { useUser } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CreditCard,
  Settings,
  Shield,
  QrCode,
  BarChart,
  MessageSquare,
  Palette,
  FileImage,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 260;

const navLinkClass = (
  isActive: boolean
) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
  isActive
    ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] font-bold"
    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:font-bold"
}`;

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { user } = useUser();
  const { data: businesses } = useBusinesses();
  const isAdmin = user?.role === "admin";

  const pathname = location.split("?")[0];
  const pathParts = pathname.split("/").filter(Boolean);
  const currentBusinessSlug = pathname.startsWith("/business/") && pathname !== "/business/new"
    ? pathParts[1]
    : null;
  const businessTabSegment = pathParts[2]; // undefined | 'qr' | 'review-options' | 'insights' | ...

  const search = typeof window !== "undefined" ? window.location.search : "";
  const tabParam = new URLSearchParams(search).get("tab");
  const isDashboard = pathname === "/dashboard";
  const isDashboardBusinesses = isDashboard && (!tabParam || tabParam === "businesses");
  const isDashboardSubscription = isDashboard && tabParam === "subscription";

  const businessSubNav = [
    { label: "Settings", href: (s: string) => `/business/${s}`, icon: Settings, active: pathname === `/business/${currentBusinessSlug}` || pathname === `/business/${currentBusinessSlug}/` },
    { label: "Review Options", href: (s: string) => `/business/${s}/review-options`, icon: Palette, active: businessTabSegment === "review-options" },
    { label: "QR Code", href: (s: string) => `/business/${s}/qr`, icon: QrCode, active: businessTabSegment === "qr" },
    { label: "QR Marketing", href: (s: string) => `/business/${s}/posters`, icon: FileImage, active: businessTabSegment === "posters" },
    { label: "Insights", href: (s: string) => `/business/${s}/insights`, icon: BarChart, active: businessTabSegment === "insights" },
    { label: "Reviews & Concerns", href: (s: string) => `/business/${s}/feedback`, icon: MessageSquare, active: businessTabSegment === "feedback" },
  ];

  return (
    <div className="min-h-screen flex app-surface pt-14 sm:pt-16">
      <aside
        className="fixed left-0 top-14 sm:top-16 z-40 flex flex-col w-[260px] bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))] overflow-y-auto h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]"
      >
        <nav className="flex-1 p-3 space-y-6 min-h-0">
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/70">
              Main
            </p>
            <Link href="/dashboard" className={navLinkClass(isDashboardBusinesses)}>
              <LayoutDashboard className="h-5 w-5 shrink-0" />
              Dashboard
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/70">
              Business
            </p>
            {businesses?.map((b) => {
              const isCurrent = b.slug === currentBusinessSlug;
              return (
                <div key={b.id} className="space-y-0.5">
                  <Link
                    href={`/business/${b.slug}`}
                    className={navLinkClass(pathname === `/business/${b.slug}` || pathname.startsWith(`/business/${b.slug}/`))}
                  >
                    <Building2 className="h-5 w-5 shrink-0" />
                    <span className="truncate">{b.name}</span>
                  </Link>
                  {isCurrent && (
                    <div className="pl-6 space-y-0.5">
                      {businessSubNav.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href(b.slug)}
                          className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors", item.active ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] font-bold" : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] hover:font-bold")}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link href="/business/new" className={navLinkClass(pathname === "/business/new")}>
              <PlusCircle className="h-5 w-5 shrink-0" />
              Add business
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/70">
              Your account
            </p>
            <Link href="/dashboard?tab=subscription" className={navLinkClass(isDashboardSubscription)}>
              <CreditCard className="h-5 w-5 shrink-0" />
              Subscription
            </Link>
            <Link href="/settings" className={navLinkClass(pathname === "/settings")}>
              <Settings className="h-5 w-5 shrink-0" />
              Account settings
            </Link>
          </div>
          {isAdmin && (
            <div className="space-y-0.5">
              <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/70">
                Admin
              </p>
              <Link href="/admin" className={navLinkClass(pathname === "/admin" || pathname.startsWith("/admin"))}>
                <Shield className="h-5 w-5 shrink-0" />
                Admin
              </Link>
            </div>
          )}
        </nav>
      </aside>

      <div
        className="flex flex-1 flex-col min-h-screen"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <main className="flex-1 p-6 bg-[hsl(var(--app-surface))]">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
