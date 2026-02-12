import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Building2,
  Users,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Shield,
  Plug,
  CreditCard,
  AlertCircle,
  Flag,
  Settings,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 56;

const navLinkClass = (isActive: boolean) =>
  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
    isActive
      ? "bg-[hsl(var(--sidebar-primary))] text-[hsl(var(--sidebar-primary-foreground))] font-bold"
      : "text-[hsl(var(--sidebar-foreground))] hover:bg-[hsl(var(--sidebar-accent))] font-medium"
  }`;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, isLoading } = useUser();
  const logoutMutation = useLogout();
  const pathname = location.split("?")[0];

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const userInitials = user?.username?.charAt(0).toUpperCase() ?? "A";

  const isActive = (path: string) => pathname === path || (path !== "/admin/overview" && pathname.startsWith(path));

  return (
    <div className="min-h-screen flex bg-[hsl(var(--app-surface))]">
      <aside
        className="fixed left-0 top-0 z-40 flex h-full flex-col bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--sidebar-border))]"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <div className="flex h-14 shrink-0 items-center px-5 border-b border-[hsl(var(--sidebar-border))]">
          <Link href="/admin/overview" className="flex items-center gap-2.5 font-semibold text-[hsl(var(--sidebar-foreground))]">
            <Shield className="h-5 w-5" />
            <span>TapBack Admin</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Main</p>
            <Link href="/admin/overview">
              <a className={navLinkClass(isActive("/admin/overview"))}>
                <LayoutDashboard className="h-5 w-5 shrink-0" />
                Overview
              </a>
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Operations</p>
            <Link href="/admin/businesses">
              <a className={navLinkClass(isActive("/admin/businesses"))}>
                <Building2 className="h-5 w-5 shrink-0" />
                Businesses
              </a>
            </Link>
            <Link href="/admin/users">
              <a className={navLinkClass(isActive("/admin/users"))}>
                <Users className="h-5 w-5 shrink-0" />
                Users
              </a>
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Integrations</p>
            <Link href="/admin/integrations/google">
              <a className={navLinkClass(isActive("/admin/integrations/google"))}>
                <Plug className="h-5 w-5 shrink-0" />
                Google Business
              </a>
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Billing</p>
            <Link href="/admin/billing/subscriptions">
              <a className={navLinkClass(isActive("/admin/billing/subscriptions"))}>
                <CreditCard className="h-5 w-5 shrink-0" />
                Subscriptions
              </a>
            </Link>
          </div>
          <div className="space-y-0.5">
            <p className="px-3 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">System</p>
            <Link href="/admin/system/errors">
              <a className={navLinkClass(isActive("/admin/system/errors"))}>
                <AlertCircle className="h-5 w-5 shrink-0" />
                Error Logs
              </a>
            </Link>
            <Link href="/admin/system/feature-flags">
              <a className={navLinkClass(isActive("/admin/system/feature-flags"))}>
                <Flag className="h-5 w-5 shrink-0" />
                Feature Flags
              </a>
            </Link>
            <Link href="/admin/system/jobs">
              <a className={navLinkClass(isActive("/admin/system/jobs"))}>
                <Briefcase className="h-5 w-5 shrink-0" />
                Jobs & Sync
              </a>
            </Link>
            <Link href="/admin/settings">
              <a className={navLinkClass(isActive("/admin/settings"))}>
                <Settings className="h-5 w-5 shrink-0" />
                Settings
              </a>
            </Link>
          </div>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <header
          className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 shadow-sm"
          style={{ height: HEADER_HEIGHT }}
        >
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search businesses, users…"
                className="pl-9 h-9 rounded-lg border-slate-200 bg-slate-50 text-sm"
                readOnly
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-lg text-slate-500 hover:text-slate-700" title="Notifications">
            <Bell className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 h-9 px-2.5 rounded-lg text-slate-700 hover:bg-slate-100">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-sm font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-sm font-medium max-w-[140px] truncate">
                  {isLoading ? "…" : user?.username ?? "Admin"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border border-slate-200 shadow-lg rounded-xl">
              <div className="px-3 py-2.5 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900">{user?.username}</p>
                <p className="text-xs text-slate-500">Platform admin</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/dashboard" className="flex items-center cursor-pointer rounded-lg">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Back to app
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
