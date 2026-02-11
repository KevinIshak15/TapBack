import * as React from "react";
import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { useBusinesses } from "@/hooks/use-businesses";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  ChevronDown,
  QrCode,
  BarChart,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 56;

const navLinkClass = (
  isActive: boolean
) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
  isActive
    ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]"
    : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))]"
}`;

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [location] = useLocation();
  const { user, isLoading } = useUser();
  const { data: businesses } = useBusinesses();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const userInitials = user?.username?.charAt(0).toUpperCase() ?? "U";
  const isAdmin = user?.role === "admin";

  const pathname = location.split("?")[0];
  const search = typeof window !== "undefined" ? window.location.search : "";
  const tabParam = new URLSearchParams(search).get("tab");
  const currentBusinessSlug = pathname.startsWith("/business/") && pathname !== "/business/new"
    ? pathname.split("/")[2]
    : null;

  const isDashboard = pathname === "/dashboard";
  const isDashboardBusinesses = isDashboard && (!tabParam || tabParam === "businesses");
  const isDashboardSubscription = isDashboard && tabParam === "subscription";

  const businessSubNav = [
    { label: "Settings", href: (s: string) => `/business/${s}`, icon: Settings, active: pathname === `/business/${currentBusinessSlug}` && !tabParam },
    { label: "QR Code", href: (s: string) => `/business/${s}/qr`, icon: QrCode, active: pathname === `/business/${currentBusinessSlug}/qr` },
    { label: "Insights", href: (s: string) => `/business/${s}?tab=insights`, icon: BarChart, active: pathname === `/business/${currentBusinessSlug}` && tabParam === "insights" },
    { label: "Reviews", href: (s: string) => `/business/${s}?tab=reviews`, icon: MessageSquare, active: pathname === `/business/${currentBusinessSlug}` && tabParam === "reviews" },
    { label: "Complaints", href: (s: string) => `/business/${s}?tab=complaints`, icon: AlertTriangle, active: pathname === `/business/${currentBusinessSlug}` && tabParam === "complaints" },
  ];

  return (
    <div className="min-h-screen flex app-surface">
      <aside
        className="fixed left-0 top-0 z-40 flex h-full flex-col bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))]"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex h-14 shrink-0 items-center px-5 border-b border-[hsl(var(--sidebar-border))]">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-semibold text-[hsl(var(--sidebar-foreground))]"
          >
            <img
              src="/tapback-logo.png"
              alt=""
              className="h-8 w-auto object-contain opacity-90"
            />
            <span className="text-base">TapBack</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/60">
              Main
            </p>
            <Link href="/dashboard">
              <a className={navLinkClass(isDashboardBusinesses)}>
                <LayoutDashboard className="h-5 w-5 shrink-0" />
                Dashboard
              </a>
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/60">
              Business
            </p>
            {businesses?.map((b) => {
              const isCurrent = b.slug === currentBusinessSlug;
              return (
                <div key={b.id} className="space-y-0.5">
                  <Link href={`/business/${b.slug}`}>
                    <a className={navLinkClass(pathname === `/business/${b.slug}` || pathname.startsWith(`/business/${b.slug}/`))}>
                      <Building2 className="h-5 w-5 shrink-0" />
                      <span className="truncate">{b.name}</span>
                    </a>
                  </Link>
                  {isCurrent && (
                    <div className="pl-6 space-y-0.5">
                      {businessSubNav.map((item) => (
                        <Link key={item.label} href={item.href(b.slug)}>
                          <a className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors", item.active ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))]" : "text-[hsl(var(--sidebar-foreground))]/80 hover:bg-[hsl(var(--sidebar-accent))]")}>
                            <item.icon className="h-4 w-4 shrink-0" />
                            {item.label}
                          </a>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <Link href="/business/new">
              <a className={navLinkClass(pathname === "/business/new")}>
                <PlusCircle className="h-5 w-5 shrink-0" />
                Add business
              </a>
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/60">
              Your account
            </p>
            <Link href="/dashboard?tab=subscription">
              <a className={navLinkClass(isDashboardSubscription)}>
                <CreditCard className="h-5 w-5 shrink-0" />
                Subscription
              </a>
            </Link>
            <Link href="/settings">
              <a className={navLinkClass(pathname === "/settings")}>
                <Settings className="h-5 w-5 shrink-0" />
                Account settings
              </a>
            </Link>
          </div>
          {isAdmin && (
            <div className="space-y-0.5">
              <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--sidebar-foreground))]/60">
                Admin
              </p>
              <Link href="/admin">
                <a className={navLinkClass(pathname === "/admin" || pathname.startsWith("/admin"))}>
                  <Shield className="h-5 w-5 shrink-0" />
                  Admin
                </a>
              </Link>
            </div>
          )}
        </nav>
      </aside>

      <div
        className="flex flex-1 flex-col min-h-screen"
        style={{ marginLeft: SIDEBAR_WIDTH }}
      >
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6"
          style={{ height: HEADER_HEIGHT }}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 font-semibold text-slate-800 hover:text-slate-600 transition-colors"
          >
            <img
              src="/tapback-logo.png"
              alt="TapBack"
              className="h-8 w-auto object-contain"
            />
            <span className="text-base hidden sm:inline">TapBack</span>
          </Link>

          <div className="flex items-center gap-3">
            {!isLoading && user != null && (
              <>
                <Link href="/dashboard">
                  <a className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors hidden sm:inline-flex items-center gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </a>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="gap-2 h-9 px-2.5 rounded-lg text-slate-700 hover:bg-slate-100"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[hsl(var(--sidebar-primary))] text-white text-sm font-medium">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
                        {user.username}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 bg-white border border-slate-200 shadow-card-hover rounded-xl"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{user.username}</p>
                      <p className="text-xs text-slate-500">
                        {isAdmin ? "Admin" : "User"}
                      </p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center cursor-pointer rounded-lg">
                        <LayoutDashboard className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-6 bg-[hsl(var(--app-surface))]">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
